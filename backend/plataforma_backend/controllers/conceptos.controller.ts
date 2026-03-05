/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getConceptosService } from '../services/conceptos/getConceptosService';
import { createConceptoService } from '../services/conceptos/createConceptoService';
import {
    GetConceptosQuerySchema,
    CreateConceptoSchema,
} from '../schemas/concepto.schema';

export const conceptosController = {
    /**
     * @swagger
     * /conceptos:
     *   get:
     *     summary: Obtiene la lista de conceptos disponibles para movimientos
     *     tags: [Conceptos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: tipo
     *         schema:
     *           type: string
     *           enum: [ingreso, egreso, deducible]
     *         description: Filtra conceptos por tipo de movimiento
     *       - in: query
     *         name: busqueda
     *         schema:
     *           type: string
     *         description: Búsqueda por nombre del concepto
     *       - in: query
     *         name: id_empresa
     *         schema:
     *           type: integer
     *         description: Filtro por empresa (solo SUPERADMIN)
     *     responses:
     *       200:
     *         description: Lista de conceptos obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success: { type: boolean }
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id_concepto: { type: integer }
     *                       nombre: { type: string }
     *                       slug: { type: string }
     *                       tipo_movimiento: { type: array, items: { type: string } }
     *                       id_empresa: { type: integer, nullable: true }
     *                       estado: { type: string }
     *       401:
     *         description: No autenticado
     *       500:
     *         description: Error interno del servidor
     */
    getConceptos: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = req.userContext;
        if (!ctx || !ctx.id) {
            return reply.status(401).send(errorResponse({ message: 'No autenticado', code: 401, error: 'Unauthorized' }));
        }

        try {
            const queryValidation = GetConceptosQuerySchema.safeParse(req.query);
            if (!queryValidation.success) {
                return reply.status(400).send(errorResponse({
                    message: 'Parámetros de consulta inválidos',
                    code: 400,
                    error: queryValidation.error.errors,
                }));
            }

            const { tipo, busqueda, id_empresa } = queryValidation.data;
            const { data, error } = await getConceptosService.execute(ctx, { tipo, busqueda, id_empresa });
            if (error) {
                return reply.status(error.status || 500).send(errorResponse({
                    message: error.message,
                    code: error.status || 500,
                    error: error.details,
                }));
            }

            return reply.send(successResponse(data));
        } catch (err) {
            return reply.status(500).send(errorResponse({ message: 'Error interno del servidor', code: 500, error: err }));
        }
    },

    /**
     * @swagger
     * /conceptos:
     *   post:
     *     summary: Crea un nuevo concepto de movimiento
     *     tags: [Conceptos]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [nombre, tipo_movimiento]
     *             properties:
     *               nombre:
     *                 type: string
     *                 example: "Mantenimiento de Piscina"
     *               slug:
     *                 type: string
     *                 description: Identificador único (se genera automáticamente si no se indica)
     *                 example: "mantenimiento_piscina"
     *               tipo_movimiento:
     *                 type: array
     *                 items:
     *                   type: string
     *                   enum: [ingreso, egreso, deducible]
     *                 example: ["egreso", "deducible"]
     *     responses:
     *       201:
     *         description: Concepto creado exitosamente
     *       400:
     *         description: Datos inválidos
     *       401:
     *         description: No autenticado
     *       409:
     *         description: Ya existe un concepto con ese identificador
     *       500:
     *         description: Error interno del servidor
     */
    createConcepto: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = req.userContext;
        if (!ctx || !ctx.id) {
            return reply.status(401).send(errorResponse({ message: 'No autenticado', code: 401, error: 'Unauthorized' }));
        }

        try {
            const bodyValidation = CreateConceptoSchema.safeParse(req.body);
            if (!bodyValidation.success) {
                return reply.status(400).send(errorResponse({
                    message: 'Datos del concepto inválidos',
                    code: 400,
                    error: bodyValidation.error.errors,
                }));
            }

            const { data, error } = await createConceptoService.execute(ctx, bodyValidation.data);
            if (error) {
                return reply.status(error.status || 500).send(errorResponse({
                    message: error.message,
                    code: error.status || 500,
                    error: error.details,
                }));
            }

            return reply.status(201).send(successResponse(data, 201));
        } catch (err) {
            return reply.status(500).send(errorResponse({ message: 'Error interno del servidor', code: 500, error: err }));
        }
    },
};
