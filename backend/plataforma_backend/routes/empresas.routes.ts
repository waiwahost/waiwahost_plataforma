import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { empresaController } from '../controllers/empresa.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function empresasRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // GET: Obtener empresas (solo SUPERADMIN) - (empresas/)
  server.get('/', { preHandler: [authMiddleware] }, empresaController.list);

  // POST: Crear empresa (solo SUPERADMIN) - (empresas/)
  server.post('/', { preHandler: [authMiddleware] }, empresaController.create);

  // PUT: Editar empresa (solo SUPERADMIN) - (empresas/:id)
  server.put('/:id', { preHandler: [authMiddleware] }, empresaController.edit);

  // PATCH: Eliminar (Soft Delete - Inactivar) (solo SUPERADMIN) - (empresas/:id)
  server.patch('/:id', { preHandler: [authMiddleware] }, empresaController.delete);

  // DELETE: Eliminar (Hard Delete - Borrado total) (solo SUPERADMIN) - (empresas/:id/eliminar)
  // Cuidado con esta opcion - Elimina permanentemente todo lo relacionado con la empresa
  server.delete('/:id/eliminar', { preHandler: [authMiddleware] }, empresaController.deletePermanent);
}
