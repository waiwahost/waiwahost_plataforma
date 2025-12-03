import { FastifyRequest, FastifyReply } from 'fastify';
import { createReservaPublicService } from '../services/reservas/createReservaPublicService';
import { GetReservaPublicService } from '../services/reservas/getReservaPublicService';
import { errorResponse, successResponse } from '../libs/responseHelper';

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

export const getReservaPublicController = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const id = Number((request.params as any).id);
    if (!id || isNaN(id)) {
      return reply.code(400).send(errorResponse({ message: 'ID de reserva inválido', code: 400 }));
    }

    const service = new GetReservaPublicService();
    const result = await service.execute(id);

    if (!result) {
      return reply.code(404).send(errorResponse({ message: 'Reserva no encontrada', code: 404 }));
    }

    return reply.code(200).send(successResponse({ data: result, message: 'Reserva encontrada exitosamente' }));
  } catch (error) {
    console.error('Error en getReservaPublicController:', error);
    return reply.code(500).send(errorResponse({ message: 'Error interno del servidor', code: 500 }));
  }
};
