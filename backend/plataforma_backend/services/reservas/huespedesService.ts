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
   * Valida que los campos de TRA para huesped Principal
   */
  private validateDatosTRA(huespedes: CreateHuespedData[]): void {
    const principal = huespedes.find(h => h.es_principal);

    if (!principal) {
      throw new Error('Debe existir un huésped principal');
    }

    if (!principal.ciudad_residencia || !principal.ciudad_procedencia || !principal.motivo) {
      throw new Error(
        'El huésped principal debe tener ciudad de residencia, ciudad de procedencia y motivo'
      );
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
    this.validateDatosTRA(huespedes)
    //this.validateDocumentosDuplicados(huespedes);
    // Ya no validamos estricto documento duplicado si no hay documento
    // this.validateDocumentosDuplicados(huespedes); 

    // Validaciones individuales limitadas
    huespedes.forEach((huesped, index) => {
      try {
        if (huesped.fecha_nacimiento) {
          this.validateFechaNacimiento(huesped.fecha_nacimiento);
        }
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
    ciudadResidencia: string;
    ciudadProcedencia: string;
    motivo: string;
    existia: boolean;
  }>> {
    try {
      // 1. Validar datos de entrada
      this.validateHuespedes(numeroHuespedes, huespedesData);

      // 2. Obtener documentos para buscar existentes (solo si tienen documento)
      const documentos = huespedesData
        .map(h => h.documento_numero)
        .filter((d): d is string => d !== undefined && d !== null && d !== '');

      // 3. Buscar huéspedes existentes por documento
      let huespedesExistentes: any[] = [];
      if (documentos.length > 0) {
        huespedesExistentes = await this.reservasRepository.findHuespedesByDocumentos(documentos);
      }

      const documentosExistentes = new Set(
        huespedesExistentes.flatMap(h => [h.documento_numero, h.documento_identidad].filter(Boolean))
      );

      // 4. Procesar cada huésped
      const resultados: Array<{
        id: number;
        esPrincipal: boolean;
        ciudadResidencia: string;
        ciudadProcedencia: string;
        motivo: string;
        existia: boolean;
      }> = [];

      const principal = huespedesData.find(h => h.es_principal);

      if (!principal) {
        throw new Error('Debe existir un huésped principal');
      }


      for (const huespedData of huespedesData) {
        let existeHuesped = null;

        // Solo buscar si tiene documento
        if (huespedData.documento_numero) {
          existeHuesped = huespedesExistentes.find(
            h => h.documento_numero === huespedData.documento_numero ||
              h.documento_identidad === huespedData.documento_numero
          );
        }

        if (existeHuesped) {
          // Huésped ya existe, usar ID existente
          resultados.push({
            id: existeHuesped.id,
            esPrincipal: huespedData.es_principal,
            ciudadResidencia: principal.ciudad_residencia!,
            ciudadProcedencia: principal.ciudad_procedencia!,
            motivo: principal.motivo!,
            existia: true
          });
        } else {
          // Crear nuevo huésped
          // Asegurar que pasamos undefined o null para campos opcionales vacíos
          const nuevoHuesped = await this.reservasRepository.createHuespedCompleto({
            nombre: huespedData.nombre,
            apellido: huespedData.apellido,
            email: huespedData.email || null,
            telefono: huespedData.telefono || null,
            documento_tipo: huespedData.documento_tipo || null,
            documento_numero: huespedData.documento_numero || null,
            fecha_nacimiento: huespedData.fecha_nacimiento || null
          });

          resultados.push({
            id: nuevoHuesped.id,
            esPrincipal: huespedData.es_principal,
            ciudadResidencia: principal.ciudad_residencia!,
            ciudadProcedencia: principal.ciudad_procedencia!,
            motivo: principal.motivo!,
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
   * Actualiza los huéspedes de una reserva (actualiza existentes o crea nuevos)
   * Lógica Pivot: Se usa documento_numero como llave de búsqueda.
   */
  async updateHuespedesForReserva(idReserva: number, huespedesData: CreateHuespedData[]): Promise<void> {
    try {
      for (const huespedData of huespedesData) {
        let existingId: number | null = null;

        // 1. Intentar buscar por documento (si existe)
        // 1. Intentar buscar por documento (si existe)
        if (huespedData.documento_numero) {
          const docNum = String(huespedData.documento_numero).trim();
          if (docNum) {
            const found = await this.reservasRepository.findHuespedesByDocumentos([docNum]);
            if (found && found.length > 0) {
              const match = found.find((h: any) =>
                (h.documento_numero && String(h.documento_numero).trim() === docNum) ||
                (h.documento_identidad && String(h.documento_identidad).trim() === docNum)
              );
              if (match) existingId = match.id;
            }
          }
        }

        // 2. Fallback a ID si se envía (por compatibilidad o si no tiene documento - edge case)
        if (!existingId && huespedData.id) {
          existingId = huespedData.id;
        }

        if (existingId) {
          // 1. Actualizar datos generales del huésped
          await this.reservasRepository.updateHuesped(existingId, {
            nombre: huespedData.nombre,
            apellido: huespedData.apellido,
            email: huespedData.email || null,
            telefono: huespedData.telefono || null,
            documento_tipo: huespedData.documento_tipo || null,
            documento_numero: huespedData.documento_numero || null,
            fecha_nacimiento: huespedData.fecha_nacimiento || null
          });

          // 2. Actualizar información de la relación huésped-reserva
          await this.reservasRepository.updateHuespedReservaInfo(idReserva, existingId, {
            ciudad_residencia: huespedData.ciudad_residencia || null,
            ciudad_procedencia: huespedData.ciudad_procedencia || null,
            motivo: huespedData.motivo || null,
            es_principal: huespedData.es_principal
          });
        } else {
          // Crear nuevo y linkear
          const [nuevoHuesped] = await this.processHuespedes(1, [huespedData]);

          await this.reservasRepository.linkHuespedToReserva(
            idReserva,
            nuevoHuesped.id,
            nuevoHuesped.esPrincipal
          );
        }
      }
    } catch (error) {
      console.error('Error en HuespedesService.updateHuespedesForReserva:', error);
      throw error;
    }
  }

  /**
   * Relaciona múltiples huéspedes con una reserva
   */
  async linkHuespedesConReserva(idReserva: number, huespedesIds: Array<{
    id: number;
    esPrincipal: boolean;
    ciudadResidencia: string;
    ciudadProcedencia: string;
    motivo: string;

  }>): Promise<void> {
    try {
      const principal = huespedesIds.find(h => h.esPrincipal)!;

      const relaciones = huespedesIds.map(huesped => ({
        idReserva,
        idHuesped: huesped.id,
        esPrincipal: huesped.esPrincipal,

        ciudad_residencia: principal.ciudadResidencia,
        ciudad_procedencia: principal.ciudadProcedencia,
        motivo: principal.motivo

      }));

      await this.reservasRepository.linkMultipleHuespedesReserva(relaciones);
    } catch (error) {
      console.error('Error en HuespedesService.linkHuespedesConReserva:', error);
      throw error;
    }
  }
}
