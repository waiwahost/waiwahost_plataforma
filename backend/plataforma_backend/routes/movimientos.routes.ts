import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { movimientosController } from '../controllers/movimientos.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function movimientosRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // GET /movimientos/fecha/{fecha}?empresa_id={empresa_id}&plataforma_origen={plataforma} - Obtener movimientos por fecha, solo tipo=ingreso&egreso 
  server.get('/fecha/:fecha', { preHandler: [authMiddleware] }, movimientosController.getMovimientosByFecha);
  
  // GET /movimientos/inmueble?id_inmueble={id}&fecha={fecha} - Obtener movimientos por inmueble y fecha
  server.get('/inmueble', { preHandler: [authMiddleware] }, movimientosController.getMovimientosByInmueble);
  
  // Arreglar cantidad de Movimientos - Si es deducible no aparece en la lista
  // GET /movimientos/resumen/{fecha}?empresa_id={empresa_id} - Obtener resumen diario
  server.get('/resumen/:fecha', { preHandler: [authMiddleware] }, movimientosController.getResumenDiario);
  
  // GET /movimientos/filtrar-por-plataforma?fecha={fecha}&plataforma={plataforma}&empresa_id={empresa_id} - Filtrar por plataforma
  server.get('/filtrar-por-plataforma', { preHandler: [authMiddleware] }, movimientosController.filtrarMovimientosPorPlataforma);
  
  // POST /movimientos - Crear un nuevo movimiento
  server.post('/', { preHandler: [authMiddleware] }, movimientosController.createMovimiento);
  
  // GET /movimientos/{id} - Obtener movimiento por ID
  server.get('/:id', { preHandler: [authMiddleware] }, movimientosController.getMovimientoById);
  
  // PUT /movimientos/{id} - Actualizar un movimiento
  server.put('/:id', { preHandler: [authMiddleware] }, movimientosController.editMovimiento);
  
  // DELETE /movimientos/{id} - Eliminar un movimiento
  server.delete('/:id', { preHandler: [authMiddleware] }, movimientosController.deleteMovimiento);
}