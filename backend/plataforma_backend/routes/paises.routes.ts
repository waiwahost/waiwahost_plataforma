import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { paisesController } from '../controllers/paises.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function paisesRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
    // GET /paises - Obtener todos los países o uno específico por query param
    server.get('/', {}, paisesController.getPaises);

    // POST /paises - Crear un nuevo país
    server.post('/', { preHandler: [authMiddleware] }, paisesController.createPais);

    // PUT /paises/:id - Actualizar un país
    server.put('/:id', { preHandler: [authMiddleware] }, paisesController.editPais);
}
