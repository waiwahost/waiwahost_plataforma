import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { egresosController } from '../controllers/egresos.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function egresosRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // GET /egresos?fecha={fecha}&id_inmueble={id_inmueble}
  server.get('/', { 
    preHandler: [authMiddleware]
  }, egresosController.getEgresos);

  // GET /egresos/resumen?fecha={fecha}&id_inmueble={id_inmueble}
  server.get('/resumen', {
    preHandler: [authMiddleware]
  }, egresosController.getResumenEgresos);

  // GET /egresos/inmuebles-filtro
  server.get('/inmuebles-filtro', {
    preHandler: [authMiddleware]
  }, egresosController.getInmueblesFiltro);
}