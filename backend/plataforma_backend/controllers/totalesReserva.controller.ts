import { FastifyRequest, FastifyReply } from 'fastify';
import { updateTotalesReservaService } from '../services/reservas/updateTotalesReservaService';
import { successResponse, errorResponse } from '../libs/responseHelper';

export class TotalesReservaController {

  /**
   * Actualiza los totales de una reserva específica
   * PUT /admin/reservas/:id/actualizar-totales
   */
  static async actualizarTotalesReserva(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const idReserva = parseInt(request.params.id);
      
      if (isNaN(idReserva) || idReserva <= 0) {
        return reply.code(400).send(errorResponse({
          message: 'ID de reserva inválido',
          code: 400
        }));
      }

      await updateTotalesReservaService.actualizarTotales(idReserva);

      const response = successResponse({
        data: { id_reserva: idReserva },
        message: 'Totales de la reserva actualizados correctamente'
      });

      reply.code(200).send(response);

    } catch (error) {
      console.error('Error al actualizar totales de reserva:', error);
      
      const response = errorResponse({
        message: error instanceof Error ? error.message : 'Error interno del servidor',
        code: 500
      });

      reply.code(500).send(response);
    }
  }

  /**
   * Actualiza los totales de múltiples reservas
   * PUT /admin/reservas/actualizar-totales-lote
   */
  static async actualizarTotalesMultiples(
    request: FastifyRequest<{ Body: { ids_reservas: number[] } }>,
    reply: FastifyReply
  ) {
    try {
      const { ids_reservas } = request.body;

      if (!Array.isArray(ids_reservas) || ids_reservas.length === 0) {
        return reply.code(400).send(errorResponse({
          message: 'Se debe proporcionar un array de IDs de reservas válido',
          code: 400
        }));
      }

      // Validar que todos sean números válidos
      const idsValidos = ids_reservas.filter(id => Number.isInteger(id) && id > 0);
      
      if (idsValidos.length === 0) {
        return reply.code(400).send(errorResponse({
          message: 'No se encontraron IDs de reservas válidos',
          code: 400
        }));
      }

      const resultado = await updateTotalesReservaService.actualizarTotalesMultiples(idsValidos);

      const response = successResponse({
        data: resultado,
        message: `Proceso completado: ${resultado.procesadas} reservas actualizadas, ${resultado.errores} errores`
      });

      reply.code(200).send(response);

    } catch (error) {
      console.error('Error al actualizar totales múltiples:', error);
      
      const response = errorResponse({
        message: error instanceof Error ? error.message : 'Error interno del servidor',
        code: 500
      });

      reply.code(500).send(response);
    }
  }

  /**
   * Actualiza los totales de todas las reservas de una empresa
   * PUT /admin/empresas/:id/actualizar-totales-reservas
   */
  static async actualizarTotalesEmpresa(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const idEmpresa = parseInt(request.params.id);
      
      if (isNaN(idEmpresa) || idEmpresa <= 0) {
        return reply.code(400).send(errorResponse({
          message: 'ID de empresa inválido',
          code: 400
        }));
      }

      const resultado = await updateTotalesReservaService.actualizarTodosLosTotalesEmpresa(idEmpresa);

      const response = successResponse({
        data: resultado,
        message: `Totales de empresa actualizados: ${resultado.procesadas} reservas procesadas, ${resultado.errores} errores`
      });

      reply.code(200).send(response);

    } catch (error) {
      console.error('Error al actualizar totales de empresa:', error);
      
      const response = errorResponse({
        message: error instanceof Error ? error.message : 'Error interno del servidor',
        code: 500
      });

      reply.code(500).send(response);
    }
  }

  /**
   * Verifica la consistencia de totales de una reserva
   * GET /admin/reservas/:id/verificar-totales
   */
  static async verificarConsistenciaTotales(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const idReserva = parseInt(request.params.id);
      
      if (isNaN(idReserva) || idReserva <= 0) {
        return reply.code(400).send(errorResponse({
          message: 'ID de reserva inválido',
          code: 400
        }));
      }

      const verificacion = await updateTotalesReservaService.verificarConsistenciaTotales(idReserva);

      const response = successResponse({
        data: verificacion,
        message: verificacion.esConsistente ? 
          'Los totales son consistentes' : 
          'Se detectaron inconsistencias en los totales'
      });

      reply.code(200).send(response);

    } catch (error) {
      console.error('Error al verificar consistencia:', error);
      
      const response = errorResponse({
        message: error instanceof Error ? error.message : 'Error interno del servidor',
        code: 500
      });

      reply.code(500).send(response);
    }
  }
}

export const totalesReservaController = new TotalesReservaController();