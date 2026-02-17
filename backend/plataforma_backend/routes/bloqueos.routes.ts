/// <reference path="../types/fastify.d.ts" />
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { bloqueosController } from '../controllers/bloqueos.controller';
import { createBloqueoSchema, updateBloqueoSchema, getBloqueosSchema, deleteBloqueoSchema } from '../schemas/bloqueo.schema';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function bloqueosRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
    fastify.get('/', {
        preHandler: [authMiddleware],
        schema: getBloqueosSchema
    }, bloqueosController.getBloqueos);

    fastify.post('/', {
        preHandler: [authMiddleware],
        schema: createBloqueoSchema
    }, bloqueosController.createBloqueo);

    fastify.put('/:id', {
        preHandler: [authMiddleware],
        schema: updateBloqueoSchema
    }, bloqueosController.updateBloqueo);

    fastify.delete('/:id', {
        preHandler: [authMiddleware],
        schema: deleteBloqueoSchema
    }, bloqueosController.deleteBloqueo);
}
