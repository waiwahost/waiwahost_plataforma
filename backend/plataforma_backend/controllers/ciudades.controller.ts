/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getCiudadesService } from '../services/ciudades/getCiudadesService';
import { createCiudadService } from '../services/ciudades/createCiudadService';
import { editCiudadService } from '../services/ciudades/editCiudadService';
import {
    CiudadQuerySchema,
    CreateCiudadSchema,
    EditCiudadSchema,
    CiudadIdParamSchema
} from '../schemas/ciudad.schema';

export const ciudadesController = {
    getCiudades: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            // Validar query parameters usando Zod schema
            const queryValidation = CiudadQuerySchema.safeParse(req.query);
            if (!queryValidation.success) {
                return reply.status(400).send(
                    errorResponse({
                        message: 'Parámetros de consulta inválidos',
                        code: 400,
                        error: queryValidation.error.errors
                    })
                );
            }

            const { id, id_pais } = queryValidation.data;

            // Llamar al servicio para obtener las ciudades
            const { data, error } = await getCiudadesService(id, id_pais);

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

    getCiudadById: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            // Validar parámetro de ruta
            const paramValidation = CiudadIdParamSchema.safeParse(req.params);

            if (!paramValidation.success) {
                return reply.status(400).send(
                    errorResponse({
                        message: 'ID de ciudad inválido',
                        code: 400,
                        error: paramValidation.error
                    })
                );
            }

            const { id } = paramValidation.data;

            // Llamar al servicio
            const { data, error } = await getCiudadesService(id);

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

    createCiudad: async (req: FastifyRequest, reply: FastifyReply) => {
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
            const bodyValidation = CreateCiudadSchema.safeParse(req.body);
            if (!bodyValidation.success) {
                console.error('Error al validar datos de la ciudad:', bodyValidation.error);
                return reply.status(400).send(
                    errorResponse({
                        message: 'Datos de ciudad inválidos',
                        code: 400,
                        error: bodyValidation.error
                    })
                );
            }

            // Llamar al servicio
            const { data, error } = await createCiudadService(bodyValidation.data);

            if (error) {
                console.error('Error al crear ciudad:', error);
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
            console.error('Error inesperado en createCiudad:', err);
            return reply.status(500).send(
                errorResponse({
                    message: 'Error interno del servidor',
                    code: 500,
                    error: err
                })
            );
        }
    },

    editCiudad: async (req: FastifyRequest, reply: FastifyReply) => {
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

            // Validar parámetro de ruta (id de la ciudad)
            const paramValidation = CiudadIdParamSchema.safeParse(req.params);

            if (!paramValidation.success) {
                console.error('Error al validar parámetro id:', paramValidation.error);
                return reply.status(400).send(
                    errorResponse({
                        message: 'ID de ciudad inválido',
                        code: 400,
                        error: paramValidation.error
                    })
                );
            }

            // Validar datos del body
            const bodyValidation = EditCiudadSchema.safeParse(req.body);

            if (!bodyValidation.success) {
                console.error('Error al validar datos de la ciudad:', bodyValidation.error);
                return reply.status(400).send(
                    errorResponse({
                        message: 'Datos de ciudad inválidos',
                        code: 400,
                        error: bodyValidation.error
                    })
                );
            }

            const { id: ciudadId } = paramValidation.data;
            const ciudadData = { ...bodyValidation.data };

            // Llamar al servicio
            const { data, error } = await editCiudadService(ciudadId, ciudadData);

            if (error) {
                console.error('Error al editar ciudad:', error);
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
            console.error('Error inesperado en editCiudad:', err);
            return reply.status(500).send(
                errorResponse({
                    message: 'Error interno del servidor',
                    code: 500,
                    error: err
                })
            );
        }
    },

    getCiudadByPaisId: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            // Validar parámetro de ruta (id del país)
            const paramValidation = CiudadIdParamSchema.safeParse(req.params);

            if (!paramValidation.success) {
                return reply.status(400).send(
                    errorResponse({
                        message: 'ID de país inválido',
                        code: 400,
                        error: paramValidation.error
                    })
                );
            }

            const { id: paisId } = paramValidation.data;

            // Llamar al servicio para obtener las ciudades por país
            const { data, error } = await getCiudadesService(undefined, paisId);

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
            console.error('Error en getCiudadByPaisId:', err);
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
