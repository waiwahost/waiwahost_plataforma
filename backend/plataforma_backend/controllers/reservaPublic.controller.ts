import { FastifyRequest, FastifyReply } from 'fastify';
import { createReservaPublicService } from '../services/reservas/createReservaPublicService';

export const createReservaPublicController = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const reservaData = request.body;
    const result = await createReservaPublicService(reservaData);
    return reply.code(201).send({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return reply.code(400).send({ success: false, message });
  }
};
