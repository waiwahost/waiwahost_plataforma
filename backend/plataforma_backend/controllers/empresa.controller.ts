/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getEmpresas } from '../services/empresas/getEmpresasService';


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
};
