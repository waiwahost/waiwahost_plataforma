/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getEgresosService } from '../services/egresos/getEgresosService.js';
import { getResumenEgresosService } from '../services/egresos/getResumenEgresosService.js';
import { getInmueblesFiltroService } from '../services/egresos/getInmueblesFiltroService.js';

export const egresosController = {
  /**
   * GET /egresos?fecha={fecha}&id_inmueble={id_inmueble}
   * Obtiene egresos filtrados por fecha e inmueble (opcional)
   */
  getEgresos: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    
    // Verificar autenticación
    if (!ctx || !ctx.id) {
      return reply.status(401).send(
        errorResponse({
          message: 'No autenticado',
          code: 401,
          error: 'Unauthorized'
        })
      );
    }

    try {
      const query = req.query as any;
      const { fecha, id_inmueble } = query;

      // Validar fecha requerida
      if (!fecha) {
        return reply.status(400).send(
          errorResponse({
            message: 'El parámetro fecha es obligatorio',
            code: 400,
            error: 'Missing required parameter: fecha'
          })
        );
      }

      // Validar formato de fecha
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) {
        return reply.status(400).send(
          errorResponse({
            message: 'Formato de fecha inválido. Use YYYY-MM-DD',
            code: 400,
            error: 'Invalid date format'
          })
        );
      }

      // Preparar filtros
      const filtros = {
        fecha,
        id_inmueble: id_inmueble ? Number(id_inmueble) : undefined,
        empresa_id: Number(ctx.empresaId)
      };

      // Validar id_inmueble si se proporciona
      if (id_inmueble && (isNaN(Number(id_inmueble)) || Number(id_inmueble) <= 0)) {
        return reply.status(400).send(
          errorResponse({
            message: 'ID de inmueble inválido',
            code: 400,
            error: 'Invalid property ID'
          })
        );
      }

      // Llamar al servicio
      const { data, error } = await getEgresosService(filtros);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details || 'Internal Server Error'
          })
        );
      }

      const message = `${data?.length || 0} egresos encontrados para la fecha ${fecha}`;

      return reply.send(successResponse({ data, message }));

    } catch (err) {
      console.error('Error en egresosController.getEgresos:', err);
      return reply.status(500).send(
        errorResponse({
          message: 'Error interno del servidor',
          code: 500,
          error: err
        })
      );
    }
  },

  /**
   * GET /egresos/resumen?fecha={fecha}&id_inmueble={id_inmueble}
   * Obtiene resumen de egresos por fecha e inmueble (opcional)
   */
  getResumenEgresos: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    
    // Verificar autenticación
    if (!ctx || !ctx.id) {
      return reply.status(401).send(
        errorResponse({
          message: 'No autenticado',
          code: 401,
          error: 'Unauthorized'
        })
      );
    }

    try {
      const query = req.query as any;
      const { fecha, id_inmueble } = query;

      // Validar fecha requerida
      if (!fecha) {
        return reply.status(400).send(
          errorResponse({
            message: 'El parámetro fecha es obligatorio',
            code: 400,
            error: 'Missing required parameter: fecha'
          })
        );
      }

      // Validar formato de fecha
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) {
        return reply.status(400).send(
          errorResponse({
            message: 'Formato de fecha inválido. Use YYYY-MM-DD',
            code: 400,
            error: 'Invalid date format'
          })
        );
      }

      // Preparar filtros
      const filtros = {
        fecha,
        id_inmueble: id_inmueble ? Number(id_inmueble) : undefined,
        empresa_id: Number(ctx.empresaId)
      };

      // Validar id_inmueble si se proporciona
      if (id_inmueble && (isNaN(Number(id_inmueble)) || Number(id_inmueble) <= 0)) {
        return reply.status(400).send(
          errorResponse({
            message: 'ID de inmueble inválido',
            code: 400,
            error: 'Invalid property ID'
          })
        );
      }

      // Llamar al servicio
      const { data, error } = await getResumenEgresosService(filtros);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details || 'Internal Server Error'
          })
        );
      }

      const message = `Resumen de egresos generado para la fecha ${fecha}`;

      return reply.send(successResponse({ data, message }));

    } catch (err) {
      console.error('Error en egresosController.getResumenEgresos:', err);
      return reply.status(500).send(
        errorResponse({
          message: 'Error interno del servidor',
          code: 500,
          error: err
        })
      );
    }
  },

  /**
   * GET /egresos/inmuebles-filtro
   * Obtiene lista de inmuebles para el selector de filtros
   */
  getInmueblesFiltro: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    
    // Verificar autenticación
    if (!ctx || !ctx.id) {
      return reply.status(401).send(
        errorResponse({
          message: 'No autenticado',
          code: 401,
          error: 'Unauthorized'
        })
      );
    }

    try {
      // Llamar al servicio
  const { data, error } = await getInmueblesFiltroService(Number(ctx.empresaId));

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details || 'Internal Server Error'
          })
        );
      }

      const message = `${data?.length || 0} inmuebles disponibles para filtro`;

      return reply.send(successResponse({ data, message }));

    } catch (err) {
      console.error('Error en egresosController.getInmueblesFiltro:', err);
      return reply.status(500).send(
        errorResponse({
          message: 'Error interno del servidor',
          code: 500,
          error: err
        })
      );
    }
  }
};