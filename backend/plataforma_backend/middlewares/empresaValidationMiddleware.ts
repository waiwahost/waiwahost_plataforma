import { FastifyRequest, FastifyReply } from 'fastify';
import { errorResponse } from '../libs/responseHelper';

/**
 * Middleware/factory para validar que el recurso pertenece a la empresa del usuario autenticado.
 * @param getEmpresaIdFn - función que recibe el request y retorna el id_empresa del recurso a consultar
 */
export function empresaValidationMiddleware(getEmpresaIdFn: (req: FastifyRequest) => Promise<number | null> | number | null) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    if (!ctx || !ctx.empresaId) {
      return reply.status(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
    }
    const empresaIdRecurso = await getEmpresaIdFn(req);
    if (empresaIdRecurso === null || empresaIdRecurso === undefined) {
      return reply.status(404).send(errorResponse({ message: 'Recurso no encontrado', code: 404 }));
    }
    if (empresaIdRecurso !== ctx.empresaId) {
      return reply.status(403).send(errorResponse({ message: 'No tiene permisos para acceder a este recurso', code: 403 }));
    }
    // Si pasa la validación, continuar
    return;
  };
}
