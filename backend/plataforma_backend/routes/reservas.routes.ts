
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { reservasController } from '../controllers/reservas.controller';
import { createReservaPublicController } from '../controllers/reservaPublic.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getReservasSchema, createReservaSchema, editReservaSchema } from '../schemas/reserva.schema';

export async function reservasRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // GET /reservas - Obtener lista de reservas
  server.get('/', { 
    preHandler: [authMiddleware],
    schema: getReservasSchema
  }, reservasController.getReservas);

  // POST /reservas - Crear una nueva reserva
  server.post('/', {
    preHandler: [authMiddleware],
    schema: createReservaSchema
  }, reservasController.createReserva);

  // POST /reservas/public - Crear reserva desde formulario externo (sin autenticación)
  server.post('/public', {}, createReservaPublicController);

  // PUT /reservas/:id - Editar reserva
  server.put('/:id', {
    preHandler: [authMiddleware],
    schema: editReservaSchema
  }, reservasController.editReserva);

  // PATCH /reservas/:id - Editar reserva (parcial)
  server.patch('/:id', {
    preHandler: [authMiddleware],
    schema: editReservaSchema
  }, reservasController.editReserva);

  // DELETE /reservas/:id - Eliminar reserva
  server.delete('/:id', {
    preHandler: [authMiddleware],
    // No requiere schema de body, solo validación de id en el controlador
  }, reservasController.deleteReserva);
}
