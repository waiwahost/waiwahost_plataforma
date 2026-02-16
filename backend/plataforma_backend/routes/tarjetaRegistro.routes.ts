import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { TarjetaRegistroController } from '../controllers/tarjetaRegistro.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const tarjetaController = new TarjetaRegistroController();

export async function tarjetaRegistroRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
    // POST /tarjeta-registro/:id - Enviar tarjeta de alojamiento a MINCIT
    server.post('/:id', {
        preHandler: [authMiddleware],
    }, tarjetaController.enviarTarjetaAlojamiento);

    // GET /tarjeta-registro/:id - Obtener tarjeta de alojamiento por ID de reserva
    server.get('/:id', {
        preHandler: [authMiddleware],
    }, tarjetaController.getTarjetaAlojamiento);

    // GET /tarjeta-registro/:id - Obtener Estado de tarjeta de alojamiento por ID de reserva
    server.get('/estado/:id', {
        preHandler: [authMiddleware],
    }, tarjetaController.getEstadoTarjetaAlojamiento);
    
}
