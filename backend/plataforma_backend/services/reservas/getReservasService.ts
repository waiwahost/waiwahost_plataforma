import { ReservasRepository } from '../../repositories/reservas.repository';
import { GetReservasQuery, Reserva, Huesped, HuespedPrincipal } from '../../interfaces/reserva.interface';

export class GetReservasService {
  private reservasRepository: ReservasRepository;

  constructor() {
    this.reservasRepository = new ReservasRepository();
  }

  /**
   * Genera un código de reserva mockeado basado en el ID y año
   */
  private generateCodigoReserva(id: number, fechaCreacion: string): string {
    const year = new Date(fechaCreacion).getFullYear();
    const paddedId = id.toString().padStart(3, '0');
    return `RSV-${year}-${paddedId}`;
  }

  /**
   * Procesa y completa los datos de un huésped
   */
  private processHuespedData(baseData: any, isPrincipal: boolean): Huesped {
    return {
      id: baseData.id,
      nombre: baseData.nombre || 'Sin nombre',
      apellido: baseData.apellido || 'Sin apellido',
      email: baseData.email || baseData.correo || 'sin-email@ejemplo.com',
      telefono: baseData.telefono || 'Sin teléfono',
      documento_tipo: baseData.documento_tipo || 'cedula',
      documento_numero: baseData.documento_numero || 'Sin documento',
      fecha_nacimiento: baseData.fecha_nacimiento || '1990-01-01',
      es_principal: isPrincipal,
      id_reserva: baseData.id_reserva,
      ...(isPrincipal && {
       ciudad_residencia: baseData.ciudad_residencia,
      ciudad_procedencia: baseData.ciudad_procedencia,
      motivo: baseData.motivo
    })
    };
  }

  /**
   * Obtiene el huésped principal de una lista de huéspedes
   */
  private getHuespedPrincipal(huespedes: Huesped[]): HuespedPrincipal {
    const principal = huespedes.find(h => h.es_principal) || huespedes[0];
    
    if (!principal) {
      // Retorna datos mockeados si no hay huéspedes
      return {
        nombre: 'Huésped',
        apellido: 'Principal',
        email: 'huesped@email.com',
        telefono: '+57 300 123 4567'
      };
    }

    return {
      nombre: principal.nombre,
      apellido: principal.apellido,
      email: principal.email,
      telefono: principal.telefono
    };
  }

  /**
   * Calcula el precio total mockeado basado en las fechas y capacidad
   */
  private calculateMockedPrecioTotal(fechaEntrada: string, fechaSalida: string): number {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const nights = Math.ceil((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = 150000; // Precio base mockeado
    return nights * pricePerNight;
  }

  /**
   * Servicio principal para obtener reservas
   */
  async execute(filters: GetReservasQuery): Promise<Reserva[]> {
    try {
      // Obtener reservas básicas
      const reservasBasicas = await this.reservasRepository.getReservas(filters);
      
      if (reservasBasicas.length === 0) {
        return [];
      }

      // Obtener IDs de reservas para buscar huéspedes
      const reservaIds = reservasBasicas.map(r => r.id);
      
      // Obtener todos los huéspedes de las reservas
      const huespedes = await this.reservasRepository.getHuespedesByReservaIds(reservaIds);
      
      // Agrupar huéspedes por reserva
      const huespedesPorReserva = huespedes.reduce((acc, huesped) => {
        if (!acc[huesped.id_reserva]) {
          acc[huesped.id_reserva] = [];
        }
        acc[huesped.id_reserva].push(this.processHuespedData(huesped, huesped.es_principal));
        return acc;
      }, {} as Record<number, Huesped[]>);

      // Construir la respuesta final
      const reservasCompletas: Reserva[] = reservasBasicas.map(reserva => {
        const huespedesReserva = huespedesPorReserva[reserva.id] || [];
        
        return {
          id: reserva.id,
          codigo_reserva: reserva.codigo_reserva || this.generateCodigoReserva(reserva.id, reserva.fecha_creacion),
          id_inmueble: reserva.id_inmueble,
          nombre_inmueble: reserva.nombre_inmueble || `Inmueble ${reserva.id_inmueble}`,
          huesped_principal: this.getHuespedPrincipal(huespedesReserva),
          fecha_inicio: reserva.fecha_inicio,
          fecha_fin: reserva.fecha_fin,
          numero_huespedes: reserva.numero_huespedes || huespedesReserva.length || 1,
          huespedes: huespedesReserva,
          precio_total: reserva.precio_total || this.calculateMockedPrecioTotal(reserva.fecha_inicio, reserva.fecha_fin),
          // Campos financieros
          total_reserva: reserva.total_reserva || reserva.precio_total || this.calculateMockedPrecioTotal(reserva.fecha_inicio, reserva.fecha_fin),
          total_pagado: reserva.total_pagado || 0,
          total_pendiente: reserva.total_pendiente || (reserva.total_reserva || reserva.precio_total || this.calculateMockedPrecioTotal(reserva.fecha_inicio, reserva.fecha_fin)),
          estado: reserva.estado || 'pendiente',
          fecha_creacion: reserva.fecha_creacion.toISOString().split('T')[0],
          observaciones: reserva.observaciones || 'Sin observaciones',
          id_empresa: reserva.id_empresa || 1,
          // Campo de plataforma de origen
          plataforma_origen: reserva.plataforma_origen || 'directa'
        };
      });

      return reservasCompletas;
    } catch (error) {
      console.error('Error en GetReservasService:', error);
      throw new Error('Error interno del servidor al obtener reservas');
    }
  }
}
