import { FastifyRequest, FastifyReply } from 'fastify';
import { KpiService } from '../services/kpis/kpiService';
import { KpiFilters } from '../interfaces/kpi.interface';

const kpiService = new KpiService();

export class KpiController {
    async getKpis(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id_inmueble, fecha_inicio, fecha_fin } = request.query as any;

            if (!id_inmueble || !fecha_inicio || !fecha_fin) {
                return reply.status(400).send({
                    isError: true,
                    message: 'Faltan parámetros requeridos: id_inmueble, fecha_inicio, fecha_fin'
                });
            }

            const filters: KpiFilters = {
                id_empresa: (request as any).user?.id_empresa || 0, // Assuming auth middleware provides this
                id_inmueble: Number(id_inmueble),
                fecha_inicio,
                fecha_fin
            };

            const result = await kpiService.getKpis(filters);

            if (result.error) {
                return reply.status(404).send({
                    isError: true,
                    message: result.error
                });
            }

            return reply.send({
                isError: false,
                data: {
                    data: result.data,
                    type: result.type
                }
            });

        } catch (error: any) {
            console.error('Error in KpiController:', error);
            return reply.status(500).send({
                isError: true,
                message: 'Error interno al obtener KPIs',
                error: error.message
            });
        }
    }
}

export const kpiController = new KpiController();
