import { FastifyRequest, FastifyReply } from 'fastify';
import { TarjetaRegistroService } from '../services/reservas/tarjetaRegistroService';

import { successResponse, errorResponse } from '../libs/responseHelper';

import { GetTarjetaQuery } from '../interfaces/tarjetaRegistro.interface';

export class TarjetaRegistroController {
    /** 
     * Controlador para Enviar Tarjeta de Alojamiento a MinCit
     */
    async enviarTarjetaAlojamiento(request: FastifyRequest, reply: FastifyReply) {
        try {
            const ctx = (request as any).userContext || (request as any).user?.userContext;
            if (!ctx) {
                return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
            }
            const tarjetaRegistroService = new TarjetaRegistroService();
            const tarjeta = await tarjetaRegistroService.enviarAMincit(ctx.id_usuario);
            const response = {
                isError: false,
                data: tarjeta,
                message: 'Tarjeta de alojamiento enviada exitosamente'
            };
            reply.code(200).send(response);
        } catch (error) {
            console.error('Error en TarjetaRegistroController.enviarTarjetaAlojamiento:', error);
            const response = errorResponse({
                message: 'Error interno del servidor',
                code: 500
            });
            reply.code(500).send(response);
        }
    }



  /**
   * Controlador para obtener tarjetas de registro
   * GET /tarjetaRegistro
   */
  async getReservas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      if (!ctx) {
        return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
      }
      const getReservasService = new GetReservasService();
      const filters = request.query as GetReservasQuery;
      // Lógica superadmin: si es superadmin y empresaId es null, no filtrar por empresa
      if (ctx.id_roles === 1 && (ctx.empresaId === null || ctx.empresaId === undefined)) {
        // superadmin: no filtrar por empresa
        delete filters.id_empresa;
      } else {
        const id_empresa = ctx.empresaId;
        if (!id_empresa) {
          return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
        }
        filters.id_empresa = id_empresa;
      }
      const reservas = await getReservasService.execute(filters);
      const response = {
        isError: false,
        data: reservas,
        message: 'Reservas obtenidas exitosamente'
      };
      reply.code(200).send(response);
    } catch (error) {
      console.error('Error en ReservasController.getReservas:', error);
      const response = errorResponse({
        message: 'Error interno del servidor',
        code: 500
      });
      reply.code(500).send(response);
    }
  }
}

export const tarjetaRegistroController = new TarjetaRegistroController();
