import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function userRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  server.get('/', { preHandler: [authMiddleware] }, userController.list);
  //server.get('/', userController.list); // Liberado: no requiere authMiddleware
  // Solo superadmin, empresa y administrador pueden crear usuarios (no público)
  //server.post('/', { preHandler: [authMiddleware] }, userController.create);
  server.post('/', { preHandler: [authMiddleware] }, userController.create);
  // Editar usuario
  //server.put('/:id', { preHandler: [authMiddleware] }, userController.update);
  server.put('/:id', userController.update);
  // Eliminar usuario
  server.delete('/:id', { preHandler: [authMiddleware] }, userController.delete);
  //server.delete('/:id', userController.delete);
  //server.get('/:id', { preHandler: [authMiddleware] }, userController.getById);
  server.get('/:id', userController.getById);
  server.post('/login', userController.login);
  server.post('/reset-password', userController.resetPassword);
}
