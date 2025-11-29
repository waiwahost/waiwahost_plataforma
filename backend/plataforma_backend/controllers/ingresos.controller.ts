/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getIngresosService } from '../services/ingresos/getIngresosService.js';
import { getResumenIngresosService } from '../services/ingresos/getResumenIngresosService.js';
import { getInmueblesFiltroService } from '../services/ingresos/getInmueblesFiltroService.js';

export const ingresosController = {
  /**
   * GET /ingresos?fecha={fecha}&id_inmueble={id_inmueble}
   * Obtiene ingresos filtrados por fecha e inmueble (opcional)
   */
  getIngresos: async (req: FastifyRequest, reply: FastifyReply) => {
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
      const { data, error } = await getIngresosService(filtros);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details || 'Internal Server Error'
          })
        );
      }

      const message = `${data?.length || 0} ingresos encontrados para la fecha ${fecha}`;

      return reply.send(successResponse({ data, message }));

    } catch (err) {
      console.error('Error en ingresosController.getIngresos:', err);
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
   * GET /ingresos/resumen?fecha={fecha}&id_inmueble={id_inmueble}
   * Obtiene resumen de ingresos por fecha e inmueble (opcional)
   */
  getResumenIngresos: async (req: FastifyRequest, reply: FastifyReply) => {
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
      const { data, error } = await getResumenIngresosService(filtros);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details || 'Internal Server Error'
          })
        );
      }

      const message = `Resumen de ingresos generado para la fecha ${fecha}`;

      return reply.send(successResponse({ data, message }));

    } catch (err) {
      console.error('Error en ingresosController.getResumenIngresos:', err);
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
   * GET /ingresos/inmuebles-filtro
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
      console.error('Error en ingresosController.getInmueblesFiltro:', err);
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