import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getHuespedesService } from '../services/huespedes/getHuespedesService';

export const huespedesController = {
    getHuespedes: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const ctx = req.userContext;

            if (!ctx || !ctx.id) {
                return reply.status(401).send(
                    errorResponse({
                        message: 'No autenticado',
                        code: 401,
                        error: 'Unauthorized'
                    })
                );
            }

            const { data, error } = await getHuespedesService({
                id_roles: ctx.id_roles,
                empresaId: ctx.empresaId ? Number(ctx.empresaId) : undefined
            });

            if (error) {
                return reply.status(error.status || 500).send(
                    errorResponse({
                        message: error.message,
                        code: error.status || 500,
                        error: error.details
                    })
                );
            }

            return reply.send(successResponse(data));

        } catch (err) {
            console.error('Error en huespedesController.getHuespedes:', err);
            return reply.status(500).send(
                errorResponse({
                    message: 'Error interno del servidor',
                    code: 500,
                    error: err
                })
            );
        }
    }
};
