import { FastifyInstance } from 'fastify';
import { getDisponibilidadController } from '../controllers/disponibilidad.controller';

/**
 * Registra la ruta de disponibilidad en Fastify
 */
export async function disponibilidadRoutes(fastify: FastifyInstance) {
	fastify.get('/calendario', getDisponibilidadController);
}
