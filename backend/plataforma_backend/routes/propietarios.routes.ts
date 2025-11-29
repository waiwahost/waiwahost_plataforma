import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { propietarioController } from '../controllers/propietario.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function propietariosRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // GET /api/propietarios/getPropietarios
  server.get('/getPropietarios', { preHandler: [authMiddleware] }, propietarioController.getPropietarios);
  // POST /api/propietarios/createPropietario
  server.post('/createPropietario', { preHandler: [authMiddleware] }, propietarioController.createPropietario);
  
  // PUT /api/propietarios/editPropietario
  server.put('/editPropietario', { preHandler: [authMiddleware] }, propietarioController.editPropietario);
}
