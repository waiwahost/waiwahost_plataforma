import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ciudadesController } from '../controllers/ciudades.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function ciudadesRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
    // GET /ciudades - Obtener todas las ciudades o filtrar por query params (id, id_pais)
    server.get('/', {}, ciudadesController.getCiudades);

    // GET /ciudades/:id - Obtener una ciudad específica por ID
    server.get('/:id', {}, ciudadesController.getCiudadById);

    // GET /ciudades/pais/:id_pais - Obtener una ciudad específica por ID de pais
    server.get('/pais/:id', {}, ciudadesController.getCiudadByPaisId);

    // POST /ciudades - Crear una nueva ciudad
    server.post('/', { preHandler: [authMiddleware] }, ciudadesController.createCiudad);

    // PUT /ciudades/:id - Actualizar una ciudad
    server.put('/:id', { preHandler: [authMiddleware] }, ciudadesController.editCiudad);
}
