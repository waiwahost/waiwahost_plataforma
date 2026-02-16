/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getPaisesService } from '../services/paises/getPaisesService';
import { createPaisService } from '../services/paises/createPaisService';
import { editPaisService } from '../services/paises/editPaisService';
import {
    PaisQuerySchema,
    CreatePaisSchema,
    EditPaisSchema,
    PaisIdParamSchema
} from '../schemas/pais.schema';

export const paisesController = {
    getPaises: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            // Validar query parameters usando Zod schema
            const queryValidation = PaisQuerySchema.safeParse(req.query);
            if (!queryValidation.success) {
                return reply.status(400).send(
                    errorResponse({
                        message: 'Parámetros de consulta inválidos',
                        code: 400,
                        error: queryValidation.error.errors
                    })
                );
            }

            const { id } = queryValidation.data;

            // Llamar al servicio para obtener los países
            const { data, error } = await getPaisesService(id);

            if (error) {
                return reply.status(error.status || 500).send(
                    errorResponse({
                        message: error.message,
                        code: error.status || 500,
                        error: error.details || 'Internal Server Error'
                    })
                );
            }

            return reply.send(successResponse(data));
        } catch (err) {
            return reply.status(500).send(
                errorResponse({
                    message: 'Error interno del servidor',
                    code: 500,
                    error: err
                })
            );
        }
    },

    createPais: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            // Verificar autenticación
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

            // Validar datos del body
            const bodyValidation = CreatePaisSchema.safeParse(req.body);
            if (!bodyValidation.success) {
                console.error('Error al validar datos del país:', bodyValidation.error);
                return reply.status(400).send(
                    errorResponse({
                        message: 'Datos de país inválidos',
                        code: 400,
                        error: bodyValidation.error
                    })
                );
            }

            // Llamar al servicio
            const { data, error } = await createPaisService(bodyValidation.data);

            if (error) {
                console.error('Error al crear país:', error);
                return reply.status(error.status || 500).send(
                    errorResponse({
                        message: error.message,
                        code: error.status || 500,
                        error: error.details
                    })
                );
            }

            return reply.status(201).send(
                successResponse(data, 201)
            );

        } catch (err) {
            console.error('Error inesperado en createPais:', err);
            return reply.status(500).send(
                errorResponse({
                    message: 'Error interno del servidor',
                    code: 500,
                    error: err
                })
            );
        }
    },

    editPais: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            // Verificar autenticación
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

            // Validar parámetro de ruta (id del país)
            const paramValidation = PaisIdParamSchema.safeParse(req.params);

            if (!paramValidation.success) {
                console.error('Error al validar parámetro id:', paramValidation.error);
                return reply.status(400).send(
                    errorResponse({
                        message: 'ID de país inválido',
                        code: 400,
                        error: paramValidation.error
                    })
                );
            }

            // Validar datos del body
            const bodyValidation = EditPaisSchema.safeParse(req.body);

            if (!bodyValidation.success) {
                console.error('Error al validar datos del país:', bodyValidation.error);
                return reply.status(400).send(
                    errorResponse({
                        message: 'Datos de país inválidos',
                        code: 400,
                        error: bodyValidation.error
                    })
                );
            }

            const { id: paisId } = paramValidation.data;
            const paisData = { ...bodyValidation.data };

            // Llamar al servicio
            const { data, error } = await editPaisService(paisId, paisData);

            if (error) {
                console.error('Error al editar país:', error);
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
            console.error('Error inesperado en editPais:', err);
            return reply.status(500).send(
                errorResponse({
                    message: 'Error interno del servidor',
                    code: 500,
                    error: err
                })
            );
        }
    },
};
