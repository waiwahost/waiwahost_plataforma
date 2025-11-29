import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { empresaController } from '../controllers/empresa.controller';

export async function empresasRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  server.get('/', empresaController.list);
}
