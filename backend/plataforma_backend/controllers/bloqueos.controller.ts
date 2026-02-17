/// <reference path="../types/fastify.d.ts" />
import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateBloqueoService } from '../services/bloqueos/createBloqueoService';
import { GetBloqueosService } from '../services/bloqueos/getBloqueosService';
import { UpdateBloqueoService } from '../services/bloqueos/updateBloqueoService';
import { DeleteBloqueoService } from '../services/bloqueos/deleteBloqueoService';
import { CreateBloqueoRequest, GetBloqueosQuery } from '../interfaces/bloqueo.interface';
import { successResponse, errorResponse } from '../libs/responseHelper';

export const bloqueosController = {
    private_createService: new CreateBloqueoService(),
    private_getService: new GetBloqueosService(),
    private_updateService: new UpdateBloqueoService(),
    private_deleteService: new DeleteBloqueoService(),

    createBloqueo: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as CreateBloqueoRequest;
            const result = await bloqueosController.private_createService.execute(body);
            return reply.code(201).send(successResponse(result, 201));
        } catch (error: any) {
            return reply.code(400).send(errorResponse({ message: error.message, code: 400 }));
        }
    },

    getBloqueos: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const query = request.query as GetBloqueosQuery;
            const result = await bloqueosController.private_getService.execute(query);
            return reply.send(successResponse(result));
        } catch (error: any) {
            return reply.code(500).send(errorResponse({ message: error.message }));
        }
    },

    updateBloqueo: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as Partial<CreateBloqueoRequest>;
            const result = await bloqueosController.private_updateService.execute(Number(id), body);
            return reply.send(successResponse(result, 'Bloqueo actualizado exitosamente'));
        } catch (error: any) {
            return reply.code(400).send(errorResponse({ message: error.message, code: 400 }));
        }
    },

    deleteBloqueo: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const success = await bloqueosController.private_deleteService.execute(Number(id));
            if (success) {
                return reply.send(successResponse(null, 'Bloqueo eliminado exitosamente'));
            } else {
                return reply.code(404).send(errorResponse({ message: 'Bloqueo no encontrado', code: 404 }));
            }
        } catch (error: any) {
            return reply.code(500).send(errorResponse({ message: error.message }));
        }
    }
};
