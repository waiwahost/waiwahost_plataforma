import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { kpiController } from '../controllers/kpi.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function kpiRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    fastify.get('/', { preHandler: [authMiddleware], }, kpiController.getKpis);
}
