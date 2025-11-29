import { FastifyRequest, FastifyReply } from 'fastify';
import { errorResponse } from '../libs/responseHelper';

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
    // Extraer datos del usuario autenticado del JWT
    const payload = req.user as any;
    req.userContext = {
      id: payload.id,
      id_roles: payload.id_roles,
      role: payload.role,
      empresaId: payload.empresaId ?? null,
    };
  } catch (err) {
    return reply
      .status(401)
      .send(errorResponse({ message: 'Unauthorized', code: 401, error: err }));
  }
}
