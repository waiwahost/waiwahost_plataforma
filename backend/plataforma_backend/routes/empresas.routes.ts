import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { empresaController } from '../controllers/empresa.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function empresasRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  server.get('/', { preHandler: [authMiddleware] }, empresaController.list);
}
