import { ReservasRepository } from '../../repositories/reservas.repository';
import { CreateReservaRequest, Reserva } from '../../interfaces/reserva.interface';
import { GetReservasService } from './getReservasService';
import { HuespedesService } from './huespedesService';
import { PLATAFORMA_DEFAULT, isPlataformaValida } from '../../constants/plataformas';

export class CreateReservaService {
  private reservasRepository: ReservasRepository;
  private getReservasService: GetReservasService;
  private huespedesService: HuespedesService;

  constructor() {
    this.reservasRepository = new ReservasRepository();
    this.getReservasService = new GetReservasService();
    this.huespedesService = new HuespedesService();
  }

  /**
   * Valida la plataforma de origen
   */
  private validatePlataformaOrigen(plataformaOrigen?: string): string {
    // Si no se especifica, usar valor por defecto
    if (!plataformaOrigen) {
      return PLATAFORMA_DEFAULT;
    }

    // Validar que sea una plataforma válida
    if (!isPlataformaValida(plataformaOrigen)) {
      throw new Error('La plataforma de origen especificada no es válida');
    }

    return plataformaOrigen;
  }

  /**
   * Valida que las fechas sean coherentes
   */
  private validateDates(fechaEntrada: string, fechaSalida: string): void {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fechas

    if (entrada >= salida) {
      throw new Error('La fecha de entrada debe ser anterior a la fecha de salida');
    }

    if (entrada < hoy) {
      throw new Error('La fecha de entrada no puede ser anterior a hoy');
    }
  }

  /**
   * Valida que el precio sea válido
   */
  private validatePrecio(precio: number): void {
    if (precio <= 0) {
      throw new Error('El precio total debe ser mayor a 0');
    }
  }

  /**
   * Valida los campos financieros
   */
  private validateCamposFinancieros(totalReserva: number, totalPagado?: number): void {
    if (totalReserva <= 0) {
      throw new Error('El total de la reserva debe ser mayor a 0');
    }

    if (totalPagado !== undefined) {
      if (totalPagado < 0) {
        throw new Error('El total pagado no puede ser negativo');
      }

      if (totalPagado > totalReserva) {
        throw new Error('El total pagado no puede ser mayor al total de la reserva');
      }
    }
  }

  /**
   * Valida que el número de huéspedes sea válido
   */
  private validateNumeroHuespedes(numero: number): void {
    if (numero < 1 || numero > 20) { // Límite razonable
      throw new Error('El número de huéspedes debe estar entre 1 y 20');
    }
  }

  /**
   * Servicio principal para crear una reserva con múltiples huéspedes
   */
  async execute(requestData: CreateReservaRequest): Promise<Reserva> {
    try {
      // 1. Validaciones básicas de reserva
      this.validateDates(requestData.fecha_inicio, requestData.fecha_fin);
      this.validatePrecio(requestData.precio_total);
      this.validateCamposFinancieros(requestData.total_reserva, requestData.total_pagado);
      this.validateNumeroHuespedes(requestData.numero_huespedes);

      // 1.1. Validar y establecer plataforma de origen
      const plataformaOrigen = this.validatePlataformaOrigen(requestData.plataforma_origen);

      // Calcular total_pendiente
      const totalPagado = requestData.total_pagado || 0;
      const totalPendiente = requestData.total_reserva - totalPagado;

      // 2. Procesar huéspedes (validar, buscar existentes, crear nuevos)
      const huespedesProcessados = await this.huespedesService.processHuespedes(
        requestData.numero_huespedes,
        requestData.huespedes
      );

      // 3. Generar código de reserva único
      const codigoReserva = await this.reservasRepository.generateNextCodigoReserva();

      // 4. Crear la reserva
      const nuevaReserva = await this.reservasRepository.createReserva({
        id_inmueble: requestData.id_inmueble,
        fecha_inicio: requestData.fecha_inicio,
        fecha_fin: requestData.fecha_fin,
        estado: requestData.estado,
        codigo_reserva: codigoReserva,
        precio_total: requestData.precio_total,
        total_reserva: requestData.total_reserva,
        total_pagado: totalPagado,
        total_pendiente: totalPendiente,
        observaciones: requestData.observaciones,
        numero_huespedes: requestData.numero_huespedes,
        plataforma_origen: plataformaOrigen
      });

      // 5. Relacionar todos los huéspedes con la reserva
      await this.huespedesService.linkHuespedesConReserva(
        nuevaReserva.id,
        huespedesProcessados.map(h => ({
          id: h.id,
          esPrincipal: h.esPrincipal,
          ciudadResidencia: h.ciudadResidencia,
          ciudadProcedencia: h.ciudadProcedencia,
          motivo: h.motivo
        }))
      );

      // 6. Obtener la reserva completa para retornar
      const reservaCompleta = await this.getReservasService.execute({});
      const reservaCreada = reservaCompleta.find(r => r.id === nuevaReserva.id);

      if (!reservaCreada) {
        throw new Error('Error al recuperar la reserva creada');
      }

      return reservaCreada;
    } catch (error) {
      console.error('Error en CreateReservaService:', error);
      
      // Re-lanzar errores de validación con el mensaje original
      if (error instanceof Error && (
          error.message.includes('fecha') || 
          error.message.includes('email') ||
          error.message.includes('precio') ||
          error.message.includes('huéspedes') ||
          error.message.includes('principal') ||
          error.message.includes('documento') ||
          error.message.includes('nacimiento'))) {
        throw error;
      }
      
      // Para otros errores, usar mensaje genérico
      throw new Error('Error interno del servidor al crear la reserva');
    }
  }
}
