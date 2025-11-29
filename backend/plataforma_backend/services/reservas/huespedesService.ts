import { ReservasRepository } from '../../repositories/reservas.repository';
import { CreateHuespedData } from '../../interfaces/reserva.interface';

export class HuespedesService {
  private reservasRepository: ReservasRepository;

  constructor() {
    this.reservasRepository = new ReservasRepository();
  }

  /**
   * Valida que existe exactamente un huésped principal
   */
  private validateHuespedPrincipal(huespedes: CreateHuespedData[]): void {
    const principales = huespedes.filter(h => h.es_principal);
    
    if (principales.length === 0) {
      throw new Error('Debe especificar al menos un huésped principal');
    }
    
    if (principales.length > 1) {
      throw new Error('Solo puede haber un huésped principal por reserva');
    }
  }

  /**
   * Valida que no haya documentos duplicados en el array
   */
  private validateDocumentosDuplicados(huespedes: CreateHuespedData[]): void {
    const documentos = huespedes.map(h => h.documento_numero);
    const documentosUnicos = new Set(documentos);
    
    if (documentos.length !== documentosUnicos.size) {
      throw new Error('No pueden existir huéspedes con el mismo número de documento en una reserva');
    }
  }

  /**
   * Valida que el número de huéspedes coincida con el array
   */
  private validateNumeroHuespedes(numeroHuespedes: number, huespedes: CreateHuespedData[]): void {
    if (numeroHuespedes !== huespedes.length) {
      throw new Error(`El número de huéspedes (${numeroHuespedes}) no coincide con la cantidad en el array (${huespedes.length})`);
    }
  }

  /**
   * Valida el formato de fecha de nacimiento
   */
  private validateFechaNacimiento(fecha: string): void {
    const fechaNacimiento = new Date(fecha);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    
    if (isNaN(fechaNacimiento.getTime())) {
      throw new Error('Formato de fecha de nacimiento inválido');
    }
    
    if (edad < 0 || edad > 120) {
      throw new Error('La fecha de nacimiento no es válida');
    }
  }

  /**
   * Valida todos los datos de huéspedes
   */
  private validateHuespedes(numeroHuespedes: number, huespedes: CreateHuespedData[]): void {
    // Validaciones básicas
    this.validateNumeroHuespedes(numeroHuespedes, huespedes);
    this.validateHuespedPrincipal(huespedes);
    this.validateDocumentosDuplicados(huespedes);

    // Validaciones individuales
    huespedes.forEach((huesped, index) => {
      try {
        this.validateFechaNacimiento(huesped.fecha_nacimiento);
      } catch (error) {
        throw new Error(`Error en huésped ${index + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    });
  }

  /**
   * Obtiene o crea huéspedes, retornando sus IDs
   */
  async processHuespedes(numeroHuespedes: number, huespedesData: CreateHuespedData[]): Promise<Array<{
    id: number;
    esPrincipal: boolean;
    existia: boolean;
  }>> {
    try {
      // 1. Validar datos de entrada
      this.validateHuespedes(numeroHuespedes, huespedesData);

      // 2. Obtener documentos para buscar existentes
      const documentos = huespedesData.map(h => h.documento_numero);

      // 3. Buscar huéspedes existentes por documento
      const huespedesExistentes = await this.reservasRepository.findHuespedesByDocumentos(documentos);
      const documentosExistentes = new Set(
        huespedesExistentes.flatMap(h => [h.documento_numero, h.documento_identidad].filter(Boolean))
      );

      // 4. Procesar cada huésped
      const resultados: Array<{
        id: number;
        esPrincipal: boolean;
        existia: boolean;
      }> = [];

      for (const huespedData of huespedesData) {
        const existeHuesped = huespedesExistentes.find(
          h => h.documento_numero === huespedData.documento_numero || 
               h.documento_identidad === huespedData.documento_numero
        );

        if (existeHuesped) {
          // Huésped ya existe, usar ID existente
          resultados.push({
            id: existeHuesped.id,
            esPrincipal: huespedData.es_principal,
            existia: true
          });
        } else {
          // Crear nuevo huésped
          const nuevoHuesped = await this.reservasRepository.createHuespedCompleto({
            nombre: huespedData.nombre,
            apellido: huespedData.apellido,
            email: huespedData.email,
            telefono: huespedData.telefono,
            documento_tipo: huespedData.documento_tipo,
            documento_numero: huespedData.documento_numero,
            fecha_nacimiento: huespedData.fecha_nacimiento
          });

          resultados.push({
            id: nuevoHuesped.id,
            esPrincipal: huespedData.es_principal,
            existia: false
          });
        }
      }

      return resultados;
    } catch (error) {
      console.error('Error en HuespedesService.processHuespedes:', error);
      throw error;
    }
  }

  /**
   * Relaciona múltiples huéspedes con una reserva
   */
  async linkHuespedesConReserva(idReserva: number, huespedesIds: Array<{
    id: number;
    esPrincipal: boolean;
  }>): Promise<void> {
    try {
      const relaciones = huespedesIds.map(huesped => ({
        idReserva,
        idHuesped: huesped.id,
        esPrincipal: huesped.esPrincipal
      }));

      await this.reservasRepository.linkMultipleHuespedesReserva(relaciones);
    } catch (error) {
      console.error('Error en HuespedesService.linkHuespedesConReserva:', error);
      throw error;
    }
  }
}
