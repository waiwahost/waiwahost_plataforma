import { FastifyRequest, FastifyReply } from 'fastify';
import { GetReservasService } from '../services/reservas/getReservasService';
import { CreateReservaService } from '../services/reservas/createReservaService';
import { editReservaService } from '../services/reservas/editReservaService';
import { ExportReservasExcelService } from '../services/reservas/exportReservasExcelService';
import { GetReservasQuery, CreateReservaRequest, EditReservaRequest } from '../interfaces/reserva.interface';
import { successResponse, errorResponse } from '../libs/responseHelper';

export class ReservasController {
  /**
   * Controlador para obtener reservas
   * GET /reservas
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

  /**
   * Controlador para obtener una reserva por ID
   * GET /reservas/:id
   */
  async getReservaById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      if (!ctx) {
        return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
      }

      const id = Number((request.params as any).id);
      if (!id || isNaN(id)) {
        return reply.code(400).send(errorResponse({ message: 'ID de reserva inválido', code: 400 }));
      }

      const getReservasService = new GetReservasService();
      const filters: GetReservasQuery = { id };

      // Lógica de seguridad por empresa
      if (ctx.id_roles === 1 && (ctx.empresaId === null || ctx.empresaId === undefined)) {
        // superadmin sin empresa seleccionada: puede ver todo
      } else {
        const id_empresa = ctx.empresaId;
        if (!id_empresa) {
          return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
        }
        filters.id_empresa = id_empresa;
      }

      const reservas = await getReservasService.execute(filters);

      if (reservas.length === 0) {
        return reply.code(404).send(errorResponse({ message: 'Reserva no encontrada', code: 404 }));
      }

      const response = {
        isError: false,
        data: reservas[0],
        message: 'Reserva obtenida exitosamente'
      };
      reply.code(200).send(response);
    } catch (error) {
      console.error('Error en ReservasController.getReservaById:', error);
      const response = errorResponse({
        message: 'Error interno del servidor',
        code: 500
      });
      reply.code(500).send(response);
    }
  }

  /**
   * Controlador para crear una nueva reserva
   * POST /reservas
   */
  async createReserva(request: FastifyRequest, reply: FastifyReply) {
    try {
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      const id_empresa = ctx?.empresaId;
      const id_roles = ctx?.id_roles;
      if (!id_empresa && id_roles !== 1) {
        return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
      }
      const createReservaService = new CreateReservaService();
      const requestData = { ...(request.body as CreateReservaRequest), id_empresa };
      const nuevaReserva = await createReservaService.execute(requestData);
      const response = {
        isError: false,
        data: nuevaReserva,
        message: 'Reserva creada exitosamente'
      };
      reply.code(201).send(response);
    } catch (error) {
      console.error('Error en ReservasController.createReserva:', error);
      let statusCode = 500;
      let message = 'Error interno del servidor';
      if (error instanceof Error) {
        if (error.message.includes('fecha') ||
          error.message.includes('email') ||
          error.message.includes('precio') ||
          error.message.includes('huéspedes') ||
          error.message.includes('principal') ||
          error.message.includes('documento') ||
          error.message.includes('nacimiento')) {
          statusCode = 400;
          message = error.message;
        }
      }
      const response = errorResponse({
        message,
        code: statusCode
      });
      reply.code(statusCode).send(response);
    }
  }

  /**
   * Controlador para editar una reserva
   * PUT/PATCH /reservas/:id
   */
  async editReserva(request: FastifyRequest, reply: FastifyReply) {
    try {
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      const id_empresa = ctx?.empresaId;
      const id_roles = ctx?.id_roles;
      if (!id_empresa && id_roles !== 1) {
        return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
      }
      const id = Number((request.params as any).id);
      const data = request.body as EditReservaRequest;
      if (!id || isNaN(id)) {
        return reply.code(400).send(errorResponse({ message: 'ID de reserva inválido', code: 400 }));
      }
      const updated = await editReservaService(id, data);
      return reply.code(200).send(successResponse({ data: updated, message: 'Reserva actualizada exitosamente' }));
    } catch (error: any) {
      console.error('Error en ReservasController.editReserva:', error);
      return reply.code(400).send(errorResponse({ message: error.message || 'Error al editar reserva', code: 400 }));
    }
  }

  /**
   * Controlador para anular una reserva
   * DELETE /reservas/:id
   */
  async deleteReserva(request: FastifyRequest, reply: FastifyReply) {
    try {
      const id = Number((request.params as any).id);
      if (!id || isNaN(id)) {
        return reply.code(400).send(errorResponse({ message: 'ID de reserva inválido', code: 400 }));
      }
      const { deleteReservaService } = await import('../services/reservas/deleteReservaService');
      const result = await deleteReservaService(id);
      return reply.code(200).send(successResponse({ data: result, message: 'Reserva eliminada exitosamente' }));
    } catch (error: any) {
      console.error('Error en ReservasController.deleteReserva:', error);
      return reply.code(400).send(errorResponse({ message: error.message || 'Error al anular reserva', code: 400 }));
    }
  }

  /**
   * Exporta reservas a Excel
   * GET /reservas/export-excel?fecha_inicio={fecha_inicio}&fecha_fin={fecha_fin}&estado={estado}&id_inmueble={id_inmueble}&plataforma_origen={plataforma}
   */
  async exportExcel(request: FastifyRequest, reply: FastifyReply) {
    try {
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      if (!ctx) {
        return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
      }

      const query = request.query as any;

      // Lógica superadmin: si es superadmin y empresaId es null, no filtrar por empresa
      let id_empresa: number | undefined;
      if (ctx.id_roles === 1 && (ctx.empresaId === null || ctx.empresaId === undefined)) {
        id_empresa = undefined;
      } else {
        if (!ctx.empresaId) {
          return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
        }
        id_empresa = Number(ctx.empresaId);
      }

      const { buffer, fileName } = await ExportReservasExcelService.execute({
        fecha_inicio: query.fecha_inicio,
        fecha_fin: query.fecha_fin,
        estado: query.estado,
        id_inmueble: query.id_inmueble ? Number(query.id_inmueble) : undefined,
        plataforma_origen: query.plataforma_origen,
        id_empresa,
      });

      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', `attachment; filename=${fileName}`);

      return reply.send(buffer);
    } catch (error: any) {
      console.error('Error en ReservasController.exportExcel:', error);
      return reply.code(500).send(errorResponse({ message: 'Error al generar el reporte de Excel', code: 500 }));
    }
  }
}

export const reservasController = new ReservasController();
