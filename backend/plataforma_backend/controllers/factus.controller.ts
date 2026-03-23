/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import {
    factusConfigService, clientesFacturacionService, facturasElectronicasService,
    notasCreditoService, notasDebitoService, documentosSoporteService, declaracionesTercerosService
} from '../services/factus.service';
import {
    getProductosServiciosService, getProductoServicioByIdService,
    createProductoServicioService, updateProductoServicioService, deleteProductoServicioService
} from '../services/factus/productosServiciosFactus.service';
import {
    FactusConfigSchema, ClienteFacturacionSchema, ClienteFacturacionUpdateSchema,
    ClienteFacturacionQuerySchema, FacturaCreateSchema, FacturaQuerySchema, FacturaIdParamSchema,
    NotaCreditoCreateSchema, NotaDebitoCreateSchema, DocumentoSoporteCreateSchema,
    DeclaracionTerceroCreateSchema, DeclaracionDesdeMovimientosSchema
} from '../schemas/factus.schema';
import { ROLES } from '../constants/globalConstants';

// Helper: verificar autenticación y obtener contexto
function getCtx(req: FastifyRequest, reply: FastifyReply): any | null {
    const ctx = req.userContext;
    if (!ctx || !ctx.id) {
        reply.status(401).send(errorResponse({ message: 'No autenticado', code: 401 }));
        return null;
    }
    return ctx;
}

// Helper: obtener id_empresa según rol
function getEmpresaId(ctx: any, req: FastifyRequest): number | null {
    if (ctx.id_roles === ROLES.SUPERADMIN) {
        const fromQuery = (req.query as any)?.id_empresa || (req.body as any)?.id_empresa;
        if (!fromQuery) return ctx.empresaId ? Number(ctx.empresaId) : null;
        return Number(fromQuery);
    }
    return ctx.empresaId ? Number(ctx.empresaId) : null;
}

// =======================================================
// FACTUS CONFIG CONTROLLER
// =======================================================
export const factusConfigController = {

    getConfig: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const { data, error } = await factusConfigService.getConfig(ctx);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    upsertConfig: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        if (ctx.id_roles !== ROLES.SUPERADMIN && ctx.id_roles !== ROLES.EMPRESA) {
            return reply.status(403).send(errorResponse({ message: 'No autorizado', code: 403 }));
        }
        const parse = FactusConfigSchema.safeParse(req.body);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: parse.error.errors }));
        const { data, error } = await factusConfigService.upsertConfig(ctx, parse.data);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.status(201).send(successResponse(data, 201));
    },

    testConnection: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const { data } = await factusConfigService.testConnection(ctx);
        return reply.send(successResponse(data));
    },

    getNumeracion: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const { data, error } = await factusConfigService.getNumeracion(ctx);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    getMunicipios: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const { search } = req.query as { search?: string };
        const { data, error } = await factusConfigService.getMunicipios(ctx, search);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    getTributos: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const { data, error } = await factusConfigService.getTributos(ctx);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },
};

// =======================================================
// CLIENTES FACTURACIÓN CONTROLLER
// =======================================================
export const clientesFacturacionController = {

    list: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = ClienteFacturacionQuerySchema.safeParse(req.query);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'Parámetros inválidos', code: 400, error: parse.error.errors }));
        const { data, error } = await clientesFacturacionService.getAll(ctx, parse.data);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    getById: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await clientesFacturacionService.getById(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    create: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = ClienteFacturacionSchema.safeParse(req.body);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: parse.error.errors }));
        const { data, error } = await clientesFacturacionService.create(ctx, parse.data);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.status(201).send(successResponse(data, 201));
    },

    update: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const bodyParse = ClienteFacturacionUpdateSchema.safeParse(req.body);
        if (!bodyParse.success) return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: bodyParse.error.errors }));
        const { data, error } = await clientesFacturacionService.update(ctx, parse.data.id, bodyParse.data);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    softDelete: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await clientesFacturacionService.softDelete(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },
};

// =======================================================
// FACTURAS ELECTRÓNICAS CONTROLLER
// =======================================================
export const facturasController = {

    list: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaQuerySchema.safeParse(req.query);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'Parámetros inválidos', code: 400, error: parse.error.errors }));
        const { data, error } = await facturasElectronicasService.getAll(ctx, parse.data);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    getById: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await facturasElectronicasService.getById(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    getDesdeReserva: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await facturasElectronicasService.getDesdeReserva(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    create: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaCreateSchema.safeParse(req.body);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: parse.error.errors }));
        const { data, error } = await facturasElectronicasService.create(ctx, parse.data);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.status(201).send(successResponse(data, 201));
    },

    enviarDian: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await facturasElectronicasService.enviarDian(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    descargarPdf: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { buffer, contentType, error } = await facturasElectronicasService.descargarPdf(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        reply.header('Content-Type', contentType);
        reply.header('Content-Disposition', `attachment; filename="factura-${parse.data.id}.pdf"`);
        return reply.send(buffer);
    },

    enviarEmail: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { email } = req.body as { email?: string };
        const { data, error } = await facturasElectronicasService.enviarEmail(ctx, parse.data.id, email);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },
};

// =======================================================
// NOTAS DE CRÉDITO CONTROLLER
// =======================================================
export const notasCreditoController = {

    list: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const filters = req.query as any;
        const { data, error } = await notasCreditoService.getAll(ctx, filters);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    getById: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await notasCreditoService.getById(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    create: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = NotaCreditoCreateSchema.safeParse(req.body);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: parse.error.errors }));
        const { data, error } = await notasCreditoService.create(ctx, parse.data);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.status(201).send(successResponse(data, 201));
    },

    enviarDian: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await notasCreditoService.enviarDian(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    descargarPdf: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { buffer, contentType, error } = await notasCreditoService.descargarPdf(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        reply.header('Content-Type', contentType);
        reply.header('Content-Disposition', `attachment; filename="nota-credito-${parse.data.id}.pdf"`);
        return reply.send(buffer);
    },
};

// =======================================================
// NOTAS DE DÉBITO CONTROLLER
// =======================================================
export const notasDebitoController = {

    list: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const { data, error } = await notasDebitoService.getAll(ctx, req.query);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    getById: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await notasDebitoService.getById(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    create: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = NotaDebitoCreateSchema.safeParse(req.body);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: parse.error.errors }));
        const { data, error } = await notasDebitoService.create(ctx, parse.data);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.status(201).send(successResponse(data, 201));
    },

    enviarDian: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await notasDebitoService.enviarDian(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },
};

// =======================================================
// DOCUMENTOS SOPORTE CONTROLLER
// =======================================================
export const documentosSoporteController = {

    list: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const { data, error } = await documentosSoporteService.getAll(ctx, req.query);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    getById: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await documentosSoporteService.getById(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    create: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = DocumentoSoporteCreateSchema.safeParse(req.body);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: parse.error.errors }));
        const { data, error } = await documentosSoporteService.create(ctx, parse.data);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.status(201).send(successResponse(data, 201));
    },

    enviarDian: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await documentosSoporteService.enviarDian(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },
};

// =======================================================
// DECLARACIONES TERCEROS CONTROLLER
// =======================================================
export const declaracionesTercerosController = {

    list: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const { data, error } = await declaracionesTercerosService.getAll(ctx, req.query);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    getById: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await declaracionesTercerosService.getById(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    create: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = DeclaracionTerceroCreateSchema.safeParse(req.body);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: parse.error.errors }));
        const { data, error } = await declaracionesTercerosService.create(ctx, parse.data);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.status(201).send(successResponse(data, 201));
    },

    generarDesdeMovimientos: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = DeclaracionDesdeMovimientosSchema.safeParse(req.body);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: parse.error.errors }));
        const { data, error } = await declaracionesTercerosService.generarDesdeMovimientos(ctx, parse.data);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.status(201).send(successResponse(data, 201));
    },

    enviarDian: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const parse = FacturaIdParamSchema.safeParse(req.params);
        if (!parse.success) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400, error: parse.error.errors }));
        const { data, error } = await declaracionesTercerosService.enviarDian(ctx, parse.data.id);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },
};

// =======================================================
// PRODUCTOS Y SERVICIOS FACTURACIÓN CONTROLLER
// =======================================================
export const productosServiciosController = {

    list: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const { search, tipo, page, limit } = req.query as any;
        const { data, error } = await getProductosServiciosService.execute(ctx, {
            search, tipo,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 50,
        });
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    getById: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const { id } = req.params as any;
        if (!id || isNaN(Number(id))) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400 }));
        const { data, error } = await getProductoServicioByIdService.execute(ctx, Number(id));
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    create: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const body = req.body as any;
        if (!body?.codigo_referencia || !body?.nombre) {
            return reply.status(400).send(errorResponse({ message: 'codigo_referencia y nombre son requeridos', code: 400 }));
        }
        const { data, error } = await createProductoServicioService.execute(ctx, body);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.status(201).send(successResponse(data, 201));
    },

    update: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const { id } = req.params as any;
        if (!id || isNaN(Number(id))) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400 }));
        const body = req.body as any;
        const { data, error } = await updateProductoServicioService.execute(ctx, Number(id), body);
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },

    softDelete: async (req: FastifyRequest, reply: FastifyReply) => {
        const ctx = getCtx(req, reply); if (!ctx) return;
        const { id } = req.params as any;
        if (!id || isNaN(Number(id))) return reply.status(400).send(errorResponse({ message: 'ID inválido', code: 400 }));
        const { data, error } = await deleteProductoServicioService.execute(ctx, Number(id));
        if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status, error: error.details }));
        return reply.send(successResponse(data));
    },
};

