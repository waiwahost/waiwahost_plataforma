import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { conceptosController } from '../controllers/conceptos.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function conceptosRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
    // GET /conceptos - Obtener lista de conceptos (con filtros opcionales por tipo y búsqueda)
    server.get('/', { preHandler: [authMiddleware] }, conceptosController.getConceptos);

    // POST /conceptos - Crear un nuevo concepto
    server.post('/', { preHandler: [authMiddleware] }, conceptosController.createConcepto);
}
