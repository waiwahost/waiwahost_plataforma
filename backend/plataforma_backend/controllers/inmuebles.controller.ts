/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getInmueblesService } from '../services/inmuebles/getInmueblesService';
import { createInmuebleService } from '../services/inmuebles/createInmuebleService';
import { editInmuebleService } from '../services/inmuebles/editInmuebleService';
import { deleteInmuebleService } from '../services/inmuebles/deleteInmuebleService';
import { 
  InmueblesQuerySchema, 
  CreateInmuebleSchema, 
  EditInmuebleSchema,
  EditInmuebleQuerySchema 
} from '../schemas/inmueble.schema';

export const inmueblesController = {
  getInmuebles: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
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
      // Validar query parameters usando Zod schema
      const queryValidation = InmueblesQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        return reply.status(400).send(
          errorResponse({ 
            message: 'Parámetros de consulta inválidos', 
            code: 400, 
            error: queryValidation.error.errors 
          })
        );
      }
      const { id } = queryValidation.data;
      // Lógica superadmin: si es superadmin y empresaId es null, no filtrar por empresa
      let id_empresa: number | undefined;
      if (ctx.id_roles === 1 && (ctx.empresaId === null || ctx.empresaId === undefined)) {
        // superadmin: no filtrar por empresa
        id_empresa = undefined;
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
        id_empresa = Number(ctx.empresaId);
      }
      // Llamar al servicio para obtener los inmuebles
      const { data, error } = await getInmueblesService(ctx, id_empresa, id);
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
      return reply.status(500).send(
        errorResponse({ 
          message: 'Error interno del servidor', 
          code: 500, 
          error: err 
        })
      );
    }
  },

  createInmueble: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      // Verificar autenticación
      const ctx = req.userContext;
      if (!ctx || !ctx.id) {
        return reply.status(401).send(
          errorResponse({ 
            message: 'No autenticado', 
            code: 401, 
            error: 'Unauthorized' 
          })
        );
      }

      // Validar datos del body
      const bodyValidation = CreateInmuebleSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        console.error('Error al validar datos del inmueble:', bodyValidation.error);
        return reply.status(400).send(
          errorResponse({ 
            message: 'Datos de inmueble inválidos', 
            code: 400, 
            error: bodyValidation.error 
          })
        );
      }
  // Forzar id_empresa del usuario autenticado
  const inmuebleData = { ...bodyValidation.data, id_empresa: Number(ctx.empresaId) };
  // Llamar al servicio
  const { data, error } = await createInmuebleService(Number(ctx.id), inmuebleData);
      
      if (error) {
        console.error('Error al crear inmueble:', error);
        return reply.status(error.status || 500).send(
          errorResponse({ 
            message: error.message, 
            code: error.status || 500, 
            error: error.details 
          })
        );
      }

      console.log('Inmueble creado exitosamente:', data?.id_inmueble);
      return reply.status(201).send(
        successResponse(data, 201)
      );
      
    } catch (err) {
      console.error('Error inesperado en createInmueble:', err);
      return reply.status(500).send(
        errorResponse({ 
          message: 'Error interno del servidor', 
          code: 500, 
          error: err 
        })
      );
    }
  },

  editInmueble: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      // Verificar autenticación
      const ctx = req.userContext;
      if (!ctx || !ctx.id) {
        return reply.status(401).send(
          errorResponse({ 
            message: 'No autenticado', 
            code: 401, 
            error: 'Unauthorized' 
          })
        );
      }

      // Validar query parameters (id del inmueble)
      const queryValidation = EditInmuebleQuerySchema.safeParse({
        id: parseInt((req.query as any)?.id)
      });
      
      if (!queryValidation.success) {
        console.error('Error al validar query params:', queryValidation.error);
        return reply.status(400).send(
          errorResponse({ 
            message: 'ID de inmueble inválido', 
            code: 400, 
            error: queryValidation.error 
          })
        );
      }

      // Validar datos del body
      const bodyValidation = EditInmuebleSchema.safeParse(req.body);
      
      if (!bodyValidation.success) {
        console.error('Error al validar datos del inmueble:', bodyValidation.error);
        return reply.status(400).send(
          errorResponse({ 
            message: 'Datos de inmueble inválidos', 
            code: 400, 
            error: bodyValidation.error 
          })
        );
      }

      const { id: inmuebleId } = queryValidation.data;
  const inmuebleData = { ...bodyValidation.data, id_empresa: Number(ctx.empresaId) };

      console.log('Editando inmueble:', { 
        inmuebleId,
        nombre: inmuebleData.nombre, 
        direccion: inmuebleData.direccion,
        id_propietario: inmuebleData.id_propietario,
        id_empresa: inmuebleData.id_empresa 
      });
      
      // Llamar al servicio
      const { data, error } = await editInmuebleService(
        Number(ctx.id), 
        inmuebleId, 
        inmuebleData
      );
      
      if (error) {
        console.error('Error al editar inmueble:', error);
        return reply.status(error.status || 500).send(
          errorResponse({ 
            message: error.message, 
            code: error.status || 500, 
            error: error.details 
          })
        );
      }

      console.log('Inmueble editado exitosamente:', data?.id_inmueble);
      return reply.send(successResponse(data));
      
    } catch (err) {
      console.error('Error inesperado en editInmueble:', err);
      return reply.status(500).send(
        errorResponse({ 
          message: 'Error interno del servidor', 
          code: 500, 
          error: err 
        })
      );
    }
  },

  deleteInmueble: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      // Verificar autenticación
      const ctx = req.userContext;
      if (!ctx || !ctx.id) {
        return reply.status(401).send(
          errorResponse({ 
            message: 'No autenticado', 
            code: 401, 
            error: 'Unauthorized' 
          })
        );
      }

      // Validar query parameters (id del inmueble)
      const queryValidation = EditInmuebleQuerySchema.safeParse({
        id: parseInt((req.query as any)?.id)
      });
      
      if (!queryValidation.success) {
        console.error('Error al validar query params:', queryValidation.error);
        return reply.status(400).send(
          errorResponse({ 
            message: 'ID de inmueble inválido', 
            code: 400, 
            error: queryValidation.error 
          })
        );
      }

      const { id: inmuebleId } = queryValidation.data;

      console.log('Eliminando inmueble:', { inmuebleId });
      
      // Llamar al servicio
      const { data, error } = await deleteInmuebleService(Number(ctx.id), inmuebleId);
      
      if (error) {
        console.error('Error al eliminar inmueble:', error);
        return reply.status(error.status || 500).send(
          errorResponse({ 
            message: error.message, 
            code: error.status || 500, 
            error: error.details 
          })
        );
      }

      console.log('Inmueble eliminado exitosamente:', data?.id_inmueble);
      return reply.send(successResponse(data));
      
    } catch (err) {
      console.error('Error inesperado en deleteInmueble:', err);
      return reply.status(500).send(
        errorResponse({ 
          message: 'Error interno del servidor', 
          code: 500, 
          error: err 
        })
      );
    }
  },

  // Mantener compatibilidad con el método anterior
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    return inmueblesController.getInmuebles(req, reply);
  },
};