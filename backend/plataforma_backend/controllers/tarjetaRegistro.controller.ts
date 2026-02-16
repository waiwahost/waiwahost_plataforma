import { FastifyRequest, FastifyReply } from 'fastify';
import { TarjetaRegistroService } from '../services/reservas/tarjetaRegistroService';
import { successResponse, errorResponse } from '../libs/responseHelper';


export class TarjetaRegistroController {
    /** 
     * Controlador para Enviar Tarjeta de Alojamiento a MinCit
     */
    async enviarTarjetaAlojamiento(request: FastifyRequest, reply: FastifyReply) {
        try {
            const ctx = (request as any).userContext || (request as any).user?.userContext;
            if (!ctx) {
                return reply.code(401).send(errorResponse({ message: 'No autenticado', code: 401 }));
            }
        
            const { id } = request.params as { id: string };
            const idReserva = parseInt(id);
        
            if (isNaN(idReserva)) {
                return reply.code(400).send(errorResponse({ message: 'ID de reserva inválido', code: 400 }));
            }
        
            const tarjetaRegistroService = new TarjetaRegistroService();
            
            const resultado = await tarjetaRegistroService.updateEstadoTarjeta(idReserva);
        
            const response = {
                isError: false,
                data: resultado,
                message: 'Proceso de envío a MINCIT finalizado'
            };
        
            return reply.code(200).send(successResponse(response, 200));
        
        } catch (error: any) {
            console.error('Error en TarjetaRegistroController.enviarTarjetaAlojamiento:', error);
            
            return reply.code(500).send(errorResponse({
                message: error.message || 'Error interno al procesar el envío',
                code: 500
            }));
        }
    }

    /**
     * Controlador para obtener tarjeta de alojamiento
     */
    async getTarjetaAlojamiento(request: FastifyRequest, reply: FastifyReply) {
        try {
            const ctx = (request as any).userContext || (request as any).user?.userContext;
            if (!ctx) {
                return reply.code(401).send(errorResponse({ message: 'No autenticado', code: 401 }));
            }
        
            const { id } = request.params as { id: string };
            const idReserva = parseInt(id);
        
            if (isNaN(idReserva)) {
                return reply.code(400).send(errorResponse({ message: 'ID de reserva inválido', code: 400 }));
            }
        
            const tarjetaRegistroService = new TarjetaRegistroService();
            
            const resultado = await tarjetaRegistroService.findByReserva(idReserva);
        
            const response = {
                isError: false,
                data: resultado,
                message: 'Tarjeta de alojamiento obtenida'
            };
        
            return reply.code(200).send(successResponse(response, 200));
        
        } catch (error: any) {
            console.error('Error en TarjetaRegistroController.getTarjetaAlojamiento:', error);
            
            return reply.code(500).send(errorResponse({
                message: error.message || 'Error interno al procesar la tarjeta de alojamiento',
                code: 500
            }));
        }
    }

    /**
     * Controlador para obtener estado de tarjeta de alojamiento
     */
    async getEstadoTarjetaAlojamiento(request: FastifyRequest, reply: FastifyReply) {
        try {
            const ctx = (request as any).userContext || (request as any).user?.userContext;
            if (!ctx) {
                return reply.code(401).send(errorResponse({ message: 'No autenticado', code: 401 }));
            }
        
            const { id } = request.params as { id: string };
            const idReserva = parseInt(id);
        
            if (isNaN(idReserva)) {
                return reply.code(400).send(errorResponse({ message: 'ID de reserva inválido', code: 400 }));
            }
        
            const tarjetaRegistroService = new TarjetaRegistroService();
            
            const resultado = await tarjetaRegistroService.findByReservaEstado(idReserva);
        
            const response = {
                isError: false,
                data: resultado,
                message: 'Estado de la tarjeta de alojamiento obtenido'
            };
        
            return reply.code(200).send(successResponse(response, 200));
        
        } catch (error: any) {
            console.error('Error en TarjetaRegistroController.getEstadoTarjetaAlojamiento:', error);
            
            return reply.code(500).send(errorResponse({
                message: error.message || 'Error interno al procesar el estado de la tarjeta de alojamiento',
                code: 500
            }));
        }
    }
}

export const tarjetaRegistroController = new TarjetaRegistroController();
