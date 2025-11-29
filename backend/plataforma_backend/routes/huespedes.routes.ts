import { FastifyInstance } from 'fastify';
import { huespedesController } from '../controllers/huespedes.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function huespedesRoutes(fastify: FastifyInstance) {
    fastify.get('/', { preHandler: [authMiddleware] }, huespedesController.getHuespedes);
}
