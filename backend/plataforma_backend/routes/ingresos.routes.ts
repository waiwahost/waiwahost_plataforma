import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ingresosController } from '../controllers/ingresos.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function ingresosRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // GET /ingresos?fecha={fecha}&id_inmueble={id_inmueble}
  server.get('/', { 
    preHandler: [authMiddleware]
  }, ingresosController.getIngresos);

  // GET /ingresos/resumen?fecha={fecha}&id_inmueble={id_inmueble}
  server.get('/resumen', {
    preHandler: [authMiddleware]
  }, ingresosController.getResumenIngresos);

  // GET /ingresos/inmuebles-filtro
  server.get('/inmuebles-filtro', {
    preHandler: [authMiddleware]
  }, ingresosController.getInmueblesFiltro);
}