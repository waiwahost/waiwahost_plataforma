/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getEmpresas } from '../services/empresas/getEmpresasService';
import { EmpresaSchema, EmpresaParamsSchema } from '../schemas/empresa.schema';
import { createEmpresaService } from '../services/empresas/createEmpresaService';
import { EmpresaUpdateSchema } from '../schemas/empresa.schema';
import { editEmpresaService } from '../services/empresas/editEmpresaService';
import { softDeleteEmpresaService } from '../services/empresas/softDeleteEmpresaService';
import { hardDeleteEmpresaService } from '../services/empresas/hardDeleteEmpresaService';


export const empresaController = {
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    // enviar peticion al repositorio de empresas
    //responder con la lista de empresas
    // Verificar autenticación
    const ctx = req.userContext;
    if (!ctx || !ctx.id) {
      return reply.status(401).send(errorResponse({ message: 'No autenticado', code: 401 }));
    }

    // Lógica de filtrado por rol
    let id_empresa: number | undefined = undefined;

    // Si NO es superadmin (rol 1), forzar filtro por empresa del usuario
    if (ctx.id_roles !== 1) {
      if (!ctx.empresaId) {
        return reply.status(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
      }
      id_empresa = Number(ctx.empresaId);
    }

    const { data, error } = await getEmpresas(id_empresa);
    if (error) {
      return reply.status(403).send(errorResponse({ message: error.message, code: 403, error: 'Forbidden' }));
    }
    return reply.send(successResponse(data));
  },

  // Crear empresa (solo SUPERADMIN)
  create: async (req: FastifyRequest, reply: FastifyReply) => {
    // 1. Verificar autenticación
    const ctx = req.userContext;
    if (!ctx || !ctx.id) {
      return reply.status(401).send(errorResponse({ message: 'No autenticado', code: 401 }));
    }

    // 2. Verificar autorización (Solo SUPERADMIN)
    if (ctx.id_roles !== 1) { // 1 = ROLES.SUPERADMIN
      return reply.status(403).send(errorResponse({ message: 'No autorizado. Se requiere rol de SUPERADMIN.', code: 403 }));
    }

    // 3. Validar datos de entrada
    const parse = EmpresaSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: parse.error }));
    }

    // 4. Llamar al servicio de creación
    const { data, error } = await createEmpresaService(parse.data);

    if (error) {
      console.error('Error al crear empresa:', error);
      return reply.status(error.status || 500).send(errorResponse({
        message: error.message,
        code: error.status || 500,
        error: error.details
      }));
    }

    return reply.status(201).send(successResponse(data, 201));
  },

  edit: async (req: FastifyRequest, reply: FastifyReply) => {
    // 1. Verificar autenticación
    const ctx = req.userContext;
    if (!ctx || !ctx.id) {
      return reply.status(401).send(errorResponse({ message: 'No autenticado', code: 401 }));
    }

    // 2. Verificar autorización (Solo SUPERADMIN)
    if (ctx.id_roles !== 1) {
      return reply.status(403).send(errorResponse({ message: 'No autorizado. Se requiere rol de SUPERADMIN.', code: 403 }));
    }

    const { id } = req.params as { id: string };
    const idEmpresa = Number(id);

    // 3. Validar datos de entrada
    const parse = EmpresaUpdateSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: parse.error }));
    }

    // 4. Llamar al servicio de edición
    const { data, error } = await editEmpresaService(idEmpresa, parse.data);

    if (error) {
      console.error('Error al editar empresa:', error);
      return reply.status(error.status || 500).send(errorResponse({
        message: error.message,
        code: error.status || 500,
        error: error.details
      }));
    }

    return reply.send(successResponse(data));
  },

  delete: async (req: FastifyRequest, reply: FastifyReply) => {
    // Soft Delete: Inactiva empresa y usuarios
    const ctx = req.userContext;
    if (!ctx || !ctx.id || ctx.id_roles !== 1) { // Solo SUPERADMIN
      return reply.status(403).send(errorResponse({ message: 'No autorizado', code: 403 }));
    }

    const parseParams = EmpresaParamsSchema.safeParse(req.params);
    if (!parseParams.success) {
      return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parseParams.error }));
    }

    const { id } = parseParams.data;

    const { data, error } = await softDeleteEmpresaService(id);

    if (error) {
      console.error('Error al desactivar empresa:', error);
      return reply.status(error.status || 500).send(errorResponse({
        message: error.message,
        code: error.status || 500,
        error: error.details
      }));
    }

    return reply.send(successResponse(data));
  },

  deletePermanent: async (req: FastifyRequest, reply: FastifyReply) => {
    // Hard Delete: Elimina TODO
    const ctx = req.userContext;
    if (!ctx || !ctx.id || ctx.id_roles !== 1) { // Solo SUPERADMIN
      return reply.status(403).send(errorResponse({ message: 'No autorizado', code: 403 }));
    }

    const parseParams = EmpresaParamsSchema.safeParse(req.params);
    if (!parseParams.success) {
      return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parseParams.error }));
    }

    const { id } = parseParams.data;

    const { data, error } = await hardDeleteEmpresaService(id);

    if (error) {
      console.error('Error al eliminar empresa permanentemente:', error);
      return reply.status(error.status || 500).send(errorResponse({
        message: error.message,
        code: error.status || 500,
        error: error.details
      }));
    }

    return reply.send(successResponse(data));
  },
};
