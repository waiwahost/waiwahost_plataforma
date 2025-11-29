import { ReservasRepository } from '../../repositories/reservas.repository';
import dbClient from '../../libs/db';

/**
 * Servicio para actualizar los totales de una reserva
 * Calcula y actualiza total_pagado y total_pendiente basado en los pagos registrados
 */
export class UpdateTotalesReservaService {
  private reservasRepository: ReservasRepository;

  constructor() {
    this.reservasRepository = new ReservasRepository();
  }

  /**
   * Actualiza los totales de pagos de una reserva específica
   * @param idReserva - ID de la reserva a actualizar
   * @returns Promise<void>
   */
  async actualizarTotales(idReserva: number): Promise<void> {
    try {
      // Calcular totales desde los pagos registrados
      const totales = await this.calcularTotalesReserva(idReserva);
      
      // Actualizar la reserva con los nuevos totales
      await this.actualizarTotalesEnBD(idReserva, totales);
      
    } catch (error) {
      console.error(`Error al actualizar totales de reserva ${idReserva}:`, error);
      throw new Error(`No se pudieron actualizar los totales de la reserva: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Calcula los totales de una reserva basado en sus pagos
   * @param idReserva - ID de la reserva
   * @returns Promise con los totales calculados
   */
  private async calcularTotalesReserva(idReserva: number): Promise<{
    totalPagado: number;
    totalPendiente: number;
    totalReserva: number;
  }> {
    try {
      const query = `
        SELECT 
          r.total_reserva,
          COALESCE(SUM(p.monto), 0) as total_pagado
        FROM reservas r
        LEFT JOIN pagos p ON r.id_reserva = p.id_reserva
        WHERE r.id_reserva = $1
        GROUP BY r.id_reserva, r.total_reserva
      `;

      const result = await dbClient.query(query, [idReserva]);
      
      if (result.rows.length === 0) {
        throw new Error('Reserva no encontrada');
      }

      const row = result.rows[0];
      const totalReserva = parseFloat(row.total_reserva) || 0;
      const totalPagado = parseFloat(row.total_pagado) || 0;
      const totalPendiente = totalReserva - totalPagado;

      return {
        totalReserva,
        totalPagado,
        totalPendiente: Math.max(0, totalPendiente) // Asegurar que no sea negativo
      };

    } catch (error) {
      console.error('Error al calcular totales:', error);
      throw error;
    }
  }

  /**
   * Actualiza los campos de totales en la base de datos
   * @param idReserva - ID de la reserva
   * @param totales - Totales calculados
   */
  private async actualizarTotalesEnBD(
    idReserva: number, 
    totales: { totalPagado: number; totalPendiente: number }
  ): Promise<void> {
    try {
      const query = `
        UPDATE reservas 
        SET 
          total_pagado = $1,
          total_pendiente = $2,
          updated_at = NOW()
        WHERE id_reserva = $3
      `;

      const result = await dbClient.query(query, [
        totales.totalPagado,
        totales.totalPendiente,
        idReserva
      ]);

      if (result.rowCount === 0) {
        throw new Error('No se pudo actualizar la reserva');
      }

    } catch (error) {
      console.error('Error al actualizar totales en BD:', error);
      throw error;
    }
  }

  /**
   * Actualiza los totales de múltiples reservas
   * Útil para procesos en lote o correcciones masivas
   * @param idsReservas - Array de IDs de reservas
   * @returns Promise con el resumen de la operación
   */
  async actualizarTotalesMultiples(idsReservas: number[]): Promise<{
    procesadas: number;
    errores: number;
    detalleErrores: Array<{ idReserva: number; error: string }>;
  }> {
    const resultado = {
      procesadas: 0,
      errores: 0,
      detalleErrores: [] as Array<{ idReserva: number; error: string }>
    };

    for (const idReserva of idsReservas) {
      try {
        await this.actualizarTotales(idReserva);
        resultado.procesadas++;
      } catch (error) {
        resultado.errores++;
        resultado.detalleErrores.push({
          idReserva,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    return resultado;
  }

  /**
   * Actualiza los totales de todas las reservas de una empresa
   * @param idEmpresa - ID de la empresa
   * @returns Promise con el resumen de la operación
   */
  async actualizarTodosLosTotalesEmpresa(idEmpresa: number): Promise<{
    procesadas: number;
    errores: number;
    detalleErrores: Array<{ idReserva: number; error: string }>;
  }> {
    try {
      // Obtener todas las reservas de la empresa
      const query = `
        SELECT r.id_reserva
        FROM reservas r
        INNER JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
        WHERE i.id_empresa = $1
      `;

      const result = await dbClient.query(query, [idEmpresa]);
      const idsReservas = result.rows.map(row => row.id_reserva);

      return await this.actualizarTotalesMultiples(idsReservas);

    } catch (error) {
      console.error('Error al obtener reservas de la empresa:', error);
      throw new Error(`Error al actualizar totales de la empresa: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Verifica la consistencia entre los totales guardados y calculados
   * @param idReserva - ID de la reserva
   * @returns Promise con el resultado de la verificación
   */
  async verificarConsistenciaTotales(idReserva: number): Promise<{
    esConsistente: boolean;
    totalesGuardados: { totalPagado: number; totalPendiente: number };
    totalesCalculados: { totalPagado: number; totalPendiente: number };
    diferencias: { totalPagado: number; totalPendiente: number };
  }> {
    try {
      // Obtener totales guardados
      const queryGuardados = `
        SELECT total_pagado, total_pendiente
        FROM reservas
        WHERE id_reserva = $1
      `;

      const resultGuardados = await dbClient.query(queryGuardados, [idReserva]);
      
      if (resultGuardados.rows.length === 0) {
        throw new Error('Reserva no encontrada');
      }

      const totalesGuardados = {
        totalPagado: parseFloat(resultGuardados.rows[0].total_pagado) || 0,
        totalPendiente: parseFloat(resultGuardados.rows[0].total_pendiente) || 0
      };

      // Calcular totales actuales
      const totalesCalculados = await this.calcularTotalesReserva(idReserva);

      const diferencias = {
        totalPagado: Math.abs(totalesGuardados.totalPagado - totalesCalculados.totalPagado),
        totalPendiente: Math.abs(totalesGuardados.totalPendiente - totalesCalculados.totalPendiente)
      };

      const esConsistente = diferencias.totalPagado < 0.01 && diferencias.totalPendiente < 0.01;

      return {
        esConsistente,
        totalesGuardados,
        totalesCalculados: {
          totalPagado: totalesCalculados.totalPagado,
          totalPendiente: totalesCalculados.totalPendiente
        },
        diferencias
      };

    } catch (error) {
      console.error('Error al verificar consistencia:', error);
      throw error;
    }
  }
}

// Instancia del servicio para exportación
export const updateTotalesReservaService = new UpdateTotalesReservaService();