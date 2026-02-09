import { FastifyRequest, FastifyReply } from 'fastify';
import { ReportesService, ReporteFinancieroFilters } from '../services/reportes.service';
import { successResponse, errorResponse } from '../libs/responseHelper';

export class ReportesController {
    async getReporteFinanciero(request: FastifyRequest, reply: FastifyReply) {
        try {
            const ctx = (request as any).userContext || (request as any).user?.userContext;
            if (!ctx) {
                return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
            }

            const filters = request.query as ReporteFinancieroFilters;

            // Security check: if not superadmin, force company filter
            if (ctx.id_roles !== 1) {
                if (!ctx.empresaId) {
                    return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
                }
                filters.empresaId = ctx.empresaId;
            } else {
                // If superadmin and empresaId is provided in query, use it.
                // If not provided, it will return data for all companies (or maybe we should force one?)
                // For now, let's respect the query param if present.
            }

            const reportesService = new ReportesService();
            const data = await reportesService.getReporteFinanciero(filters);

            return reply.code(200).send(successResponse(data));

        } catch (error) {
            console.error('Error en ReportesController.getReporteFinanciero:', error);
            return reply.code(500).send(errorResponse({
                message: 'Error interno del servidor al generar reporte',
                code: 500
            }));
        }
    }
    async getOpciones(request: FastifyRequest, reply: FastifyReply) {
        try {
            const ctx = (request as any).userContext || (request as any).user?.userContext;
            if (!ctx) {
                return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
            }

            const query = request.query as { tipo?: string, empresaId?: string };
            let empresaId: number | undefined = query.empresaId ? Number(query.empresaId) : undefined;
            const tipo = query.tipo;

            // If not superadmin (role 1), force filtering by their company
            if (ctx.id_roles !== 1) {
                if (!ctx.empresaId) {
                    return reply.code(401).send(errorResponse({ message: 'No autenticado o token inválido', code: 401 }));
                }
                empresaId = ctx.empresaId;
            }

            const reportesService = new ReportesService();
            const data = await reportesService.getOpciones(empresaId, tipo);

            return reply.code(200).send(successResponse(data));
        } catch (error) {
            console.error('Error en ReportesController.getOpciones:', error);
            return reply.code(500).send(errorResponse({
                message: 'Error interno del servidor al obtener opciones',
                code: 500
            }));
        }
    }
}

export const reportesController = new ReportesController();
