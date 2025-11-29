import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { inmueblesController } from '../controllers/inmuebles.controller';
import { movimientosController } from '../controllers/movimientos.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function inmueblesRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // GET /inmuebles/getInmuebles - Obtener lista de inmuebles o inmueble específico
  server.get('/getInmuebles', { preHandler: [authMiddleware] }, inmueblesController.getInmuebles);
  
  // GET /inmuebles/selector - Obtener inmuebles para selector
  server.get('/selector', { preHandler: [authMiddleware] }, movimientosController.getInmueblesSelector);
  
  // POST /inmuebles/createInmueble - Crear un nuevo inmueble
  server.post('/createInmueble', { preHandler: [authMiddleware] }, inmueblesController.createInmueble);
  
  // PUT /inmuebles/editInmueble - Editar un inmueble existente
  server.put('/editInmueble', { preHandler: [authMiddleware] }, inmueblesController.editInmueble);
  
  // DELETE /inmuebles/deleteInmueble - Eliminar un inmueble (eliminación lógica)
  server.delete('/deleteInmueble', { preHandler: [authMiddleware] }, inmueblesController.deleteInmueble);

  // Mantener compatibilidad con el endpoint anterior
  server.get('/', { preHandler: [authMiddleware] }, inmueblesController.list);
}