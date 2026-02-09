import { FastifyRequest, FastifyReply } from 'fastify';
import { getDisponibilidad } from '../services/disponibilidad/getDisponibilidadService';

/**
 * Controlador Fastify para consultar la disponibilidad de inmuebles en un rango de fechas.
 */
export const getDisponibilidadController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { start, end, inmuebleId, estado } = request.query as {
      start?: string;
      end?: string;
      inmuebleId?: string;
      estado?: string;
    };
    if (!start || !end) {
      return reply.status(400).send({ error: 'Parámetros start y end son requeridos' });
    }

    // Obtener contexto del usuario
    const ctx = (request as any).userContext || (request as any).user?.userContext;
    const idEmpresa = ctx?.empresaId ? Number(ctx.empresaId) : undefined;

    const result = await getDisponibilidad({
      start,
      end,
      inmuebleId,
      estado,
      idEmpresa
    });
    return reply.send(result);
  } catch (error) {
    return reply.status(500).send({ error: 'Error al consultar disponibilidad', details: error });
  }
};
