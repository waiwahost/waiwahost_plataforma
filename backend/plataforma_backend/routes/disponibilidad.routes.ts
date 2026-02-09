import { FastifyInstance } from 'fastify';
import { getDisponibilidadController } from '../controllers/disponibilidad.controller';

import { authMiddleware } from '../middlewares/authMiddleware';

/**
 * Registra la ruta de disponibilidad en Fastify
 */
export async function disponibilidadRoutes(fastify: FastifyInstance) {
	fastify.get('/calendario', { preHandler: [authMiddleware] }, getDisponibilidadController);
}
