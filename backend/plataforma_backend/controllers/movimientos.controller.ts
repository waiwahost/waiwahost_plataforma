/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';

// Importar servicios
import { getMovimientosFechaService } from '../services/movimientos/getMovimientosFechaService';
import { getMovimientosInmuebleService } from '../services/movimientos/getMovimientosInmuebleService';
import { getResumenDiarioService } from '../services/movimientos/getResumenDiarioService';
import { createMovimientoService } from '../services/movimientos/createMovimientoService';
import { editMovimientoService } from '../services/movimientos/editMovimientoService';
import { getMovimientoByIdService } from '../services/movimientos/getMovimientoByIdService';
import { deleteMovimientoService } from '../services/movimientos/deleteMovimientoService';
import { getInmueblesSelectorsService } from '../services/movimientos/getInmueblesSelectorsService';
import { filtrarMovimientosPorPlataformaService } from '../services/movimientos/filtrarMovimientosPorPlataformaService';
import { reportePorPlataformaService } from '../services/movimientos/reportePorPlataformaService';

// Importar schemas
import {
  CreateMovimientoSchema,
  EditMovimientoSchema,
  MovimientosFechaQuerySchema,
  MovimientosInmuebleQuerySchema,
  MovimientoIdParamSchema,
  FechaParamSchema,
  InmueblesSelectorrQuerySchema
} from '../schemas/movimiento.schema';

export const movimientosController = {
  /**
   * GET /movimientos/inmueble?id_inmueble={id}&fecha={fecha}
   * Obtiene movimientos por inmueble y fecha
   */
  getMovimientosByInmueble: async (req: FastifyRequest, reply: FastifyReply) => {
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
      // Validar query parameters
      const queryValidation = MovimientosInmuebleQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        return reply.status(400).send(
          errorResponse({
            message: 'Parámetros de consulta inválidos',
            code: 400,
            error: queryValidation.error.errors
          })
        );
      }
      const { id_inmueble, fecha } = queryValidation.data;
      // Llamar al servicio
      const { data, error } = await getMovimientosInmuebleService(id_inmueble, fecha);
      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details || 'Internal Server Error'
          })
        );
      }
      // Calcular resumen
      const totalIngresos = data?.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + Number(m.monto), 0) || 0;
      const totalEgresos = data?.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + Number(m.monto), 0) || 0;
      const response = {
        ingresos: totalIngresos,
        egresos: totalEgresos,
        movimientos: data || []
      };
      const cantidadMovimientos = data?.length || 0;
      const message = `${cantidadMovimientos} movimientos encontrados para la fecha ${fecha}`;
      return reply.send(successResponse(response));
    } catch (err) {
      console.error('Error en getMovimientosByInmueble:', err);
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
   * GET /movimientos/fecha/{fecha}?empresa_id={empresa_id}
   * Obtiene movimientos por fecha y empresa
   */
  getMovimientosByFecha: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    if (!ctx || !ctx.id) {
      return reply.status(401).send(
        errorResponse({
          message: 'No autenticado o token inválido',
          code: 401,
          error: 'Unauthorized'
        })
      );
    }

    try {
      // Validar parámetros de path
      const pathValidation = FechaParamSchema.safeParse(req.params);
      if (!pathValidation.success) {
        return reply.status(400).send(
          errorResponse({
            message: 'Parámetros de URL inválidos',
            code: 400,
            error: pathValidation.error.errors
          })
        );
      }

      // Validar query parameters
      const queryValidation = MovimientosFechaQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        return reply.status(400).send(
          errorResponse({
            message: 'Parámetros de consulta inválidos',
            code: 400,
            error: queryValidation.error.errors
          })
        );
      }

      const { fecha } = pathValidation.data;
      const { plataforma_origen } = queryValidation.data;
      // Lógica superadmin: si es superadmin y empresaId es null, no filtrar por empresa
      let empresa_id: string;
      if (ctx.id_roles === 1 && (ctx.empresaId === null || ctx.empresaId === undefined)) {
        empresa_id = '';
      } else {
        if (!ctx.empresaId) {
          return reply.status(401).send(
            errorResponse({
              message: 'No autenticado o token inválido',
              code: 401,
              error: 'Unauthorized'
            })
          );
        }
        empresa_id = String(ctx.empresaId);
      }
      // Llamar al servicio con filtro de plataforma
      const { data, error } = await getMovimientosFechaService(empresa_id, fecha, plataforma_origen);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details || 'Internal Server Error'
          })
        );
      }

      return reply.send(successResponse(data));
    } catch (err) {
      console.error('Error en getMovimientosByFecha:', err);
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
   * GET /movimientos/resumen/{fecha}?empresa_id={empresa_id}
   * Obtiene resumen diario por fecha y empresa
   */
  getResumenDiario: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    if (!ctx || !ctx.id || (!ctx.empresaId && ctx.id_roles !== 1)) {
      return reply.status(401).send(
        errorResponse({
          message: 'No autenticado o token inválido',
          code: 401,
          error: 'Unauthorized'
        })
      );
    }

    try {
      // Validar parámetros de path
      const pathValidation = FechaParamSchema.safeParse(req.params);
      if (!pathValidation.success) {
        return reply.status(400).send(
          errorResponse({
            message: 'Parámetros de URL inválidos',
            code: 400,
            error: pathValidation.error.errors
          })
        );
      }

      // Validar query parameters
      const queryValidation = MovimientosFechaQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        return reply.status(400).send(
          errorResponse({
            message: 'Parámetros de consulta inválidos',
            code: 400,
            error: queryValidation.error.errors
          })
        );
      }

      const { fecha } = pathValidation.data;
      const empresa_id = String(ctx.empresaId);
      // Llamar al servicio
      const { data, error } = await getResumenDiarioService(empresa_id, fecha);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details || 'Internal Server Error'
          })
        );
      }

      return reply.send(successResponse(data));

    } catch (err) {
      console.error('Error en getResumenDiario:', err);
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
   * POST /movimientos
   * Crea un nuevo movimiento
   */
  createMovimiento: async (req: FastifyRequest, reply: FastifyReply) => {
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
      // Validar datos del body
      const bodyValidation = CreateMovimientoSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        return reply.status(400).send(
          errorResponse({
            message: 'Datos de movimiento inválidos',
            code: 400,
            error: bodyValidation.error.errors
          })
        );
      }

      const movimientoData = bodyValidation.data;

      // Llamar al servicio
      const { data, error } = await createMovimientoService(movimientoData);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details
          })
        );
      }

      return reply.status(201).send(
        successResponse(data, 201)
      );

    } catch (err) {
      console.error('Error en createMovimiento:', err);
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
   * PUT /movimientos/{id}
   * Actualiza un movimiento
   */
  editMovimiento: async (req: FastifyRequest, reply: FastifyReply) => {
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
      // Validar parámetros de path
      const pathValidation = MovimientoIdParamSchema.safeParse(req.params);
      if (!pathValidation.success) {
        return reply.status(400).send(
          errorResponse({
            message: 'ID de movimiento inválido',
            code: 400,
            error: pathValidation.error.errors
          })
        );
      }

      // Validar datos del body
      const bodyValidation = EditMovimientoSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        return reply.status(400).send(
          errorResponse({
            message: 'Datos de movimiento inválidos',
            code: 400,
            error: bodyValidation.error.errors
          })
        );
      }

      const { id } = pathValidation.data;
      const movimientoData = bodyValidation.data;

      // Llamar al servicio
      const { data, error } = await editMovimientoService(id, movimientoData);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details
          })
        );
      }

      return reply.send(successResponse(data));

    } catch (err) {
      console.error('Error en editMovimiento:', err);
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
   * GET /movimientos/{id}
   * Obtiene un movimiento por ID
   */
  getMovimientoById: async (req: FastifyRequest, reply: FastifyReply) => {
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
      // Validar parámetros de path
      const pathValidation = MovimientoIdParamSchema.safeParse(req.params);
      if (!pathValidation.success) {
        return reply.status(400).send(
          errorResponse({
            message: 'ID de movimiento inválido',
            code: 400,
            error: pathValidation.error.errors
          })
        );
      }

      const { id } = pathValidation.data;

      // Llamar al servicio
      const { data, error } = await getMovimientoByIdService(id);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details || 'Internal Server Error'
          })
        );
      }

      return reply.send(successResponse(data));

    } catch (err) {
      console.error('Error en getMovimientoById:', err);
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
   * DELETE /movimientos/{id}
   * Elimina un movimiento
   */
  deleteMovimiento: async (req: FastifyRequest, reply: FastifyReply) => {
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
      // Validar parámetros de path
      const pathValidation = MovimientoIdParamSchema.safeParse(req.params);
      if (!pathValidation.success) {
        return reply.status(400).send(
          errorResponse({
            message: 'ID de movimiento inválido',
            code: 400,
            error: pathValidation.error.errors
          })
        );
      }

      const { id } = pathValidation.data;

      // Llamar al servicio
      const { data, error } = await deleteMovimientoService(id);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details
          })
        );
      }

      return reply.send(successResponse(null));

    } catch (err) {
      console.error('Error en deleteMovimiento:', err);
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
   * GET /inmuebles/selector?empresa_id={empresa_id}
   * Obtiene inmuebles para selector
   */
  getInmueblesSelector: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    // Allow superadmin (role 1) to proceed without empresaId
    if (!ctx || !ctx.id || (!ctx.empresaId && ctx.id_roles !== 1)) {
      return reply.status(401).send(
        errorResponse({
          message: 'No autenticado o token inválido',
          code: 401,
          error: 'Unauthorized'
        })
      );
    }

    try {
      // Validar query parameters
      const queryValidation = InmueblesSelectorrQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        return reply.status(400).send(
          errorResponse({
            message: 'Parámetros de consulta inválidos',
            code: 400,
            error: queryValidation.error.errors
          })
        );
      }

      const empresa_id = ctx.empresaId ? String(ctx.empresaId) : null;
      // Llamar al servicio
      const { data, error } = await getInmueblesSelectorsService(empresa_id);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details || 'Internal Server Error'
          })
        );
      }

      return reply.send(successResponse(data));

    } catch (err) {
      console.error('Error en getInmueblesSelector:', err);
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
   * GET /movimientos/filtrar-por-plataforma?fecha={fecha}&plataforma={plataforma}&empresa_id={empresa_id}
   * Filtra movimientos por plataforma y fecha
   */
  filtrarMovimientosPorPlataforma: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    if (!ctx || !ctx.id || !ctx.empresaId) {
      return reply.status(401).send(
        errorResponse({
          message: 'No autenticado o token inválido',
          code: 401,
          error: 'Unauthorized'
        })
      );
    }

    try {
      // Validar query parameters
      const query = req.query as any;

      if (!query.fecha || !query.plataforma) {
        return reply.status(400).send(
          errorResponse({
            message: 'Parámetros requeridos: fecha y plataforma',
            code: 400,
            error: 'Missing required parameters'
          })
        );
      }
      const { fecha, plataforma } = query;
      const empresa_id = String(ctx.empresaId);
      // Llamar al servicio
      const { data, error } = await filtrarMovimientosPorPlataformaService(fecha, plataforma, empresa_id);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details
          })
        );
      }

      return reply.send(successResponse({
        data,
        message: 'Movimientos filtrados exitosamente'
      }));

    } catch (err) {
      console.error('Error en filtrarMovimientosPorPlataforma:', err);
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
   * GET /reportes/por-plataforma?fecha_inicio={fecha_inicio}&fecha_fin={fecha_fin}&empresa_id={empresa_id}
   * Genera reporte de ingresos por plataforma
   */
  reportePorPlataforma: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    if (!ctx || !ctx.id || !ctx.empresaId) {
      return reply.status(401).send(
        errorResponse({
          message: 'No autenticado o token inválido',
          code: 401,
          error: 'Unauthorized'
        })
      );
    }

    try {
      // Validar query parameters
      const query = req.query as any;

      if (!query.fecha_inicio || !query.fecha_fin) {
        return reply.status(400).send(
          errorResponse({
            message: 'Parámetros requeridos: fecha_inicio y fecha_fin',
            code: 400,
            error: 'Missing required parameters'
          })
        );
      }
      const { fecha_inicio, fecha_fin } = query;
      const empresa_id = String(ctx.empresaId);
      // Llamar al servicio
      const { data, error } = await reportePorPlataformaService(fecha_inicio, fecha_fin, empresa_id);

      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({
            message: error.message,
            code: error.status || 500,
            error: error.details
          })
        );
      }

      return reply.send(successResponse({
        data,
        message: 'Reporte generado exitosamente'
      }));

    } catch (err) {
      console.error('Error en reportePorPlataforma:', err);
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