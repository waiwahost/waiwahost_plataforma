import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
    factusConfigController,
    clientesFacturacionController,
    facturasController,
    notasCreditoController,
    notasDebitoController,
    documentosSoporteController,
    declaracionesTercerosController,
    productosServiciosController,
} from '../controllers/factus.controller';

export async function factusRoutes(server: FastifyInstance) {

    // ==========================================
    // CONFIGURACIÓN FACTUS (por empresa)
    // ==========================================
    // GET /factus/config → Ver configuración
    server.get('/config', { preHandler: [authMiddleware] }, factusConfigController.getConfig);
    // POST /factus/config → Guardar/actualizar credenciales
    server.post('/config', { preHandler: [authMiddleware] }, factusConfigController.upsertConfig);
    // POST /factus/config/test → Probar conexión con Factus
    server.post('/config/test', { preHandler: [authMiddleware] }, factusConfigController.testConnection);
    // GET /factus/numeracion → Listar rangos de numeración disponibles
    server.get('/numeracion', { preHandler: [authMiddleware] }, factusConfigController.getNumeracion);
    // GET /factus/municipios → Buscar municipios (query: search)
    server.get('/municipios', { preHandler: [authMiddleware] }, factusConfigController.getMunicipios);
    // GET /factus/tributos → Listar tributos/impuestos
    server.get('/tributos', { preHandler: [authMiddleware] }, factusConfigController.getTributos);

    // ==========================================
    // CLIENTES DE FACTURACIÓN
    // ==========================================
    // GET /factus/clientes
    server.get('/clientes', { preHandler: [authMiddleware] }, clientesFacturacionController.list);
    // GET /factus/clientes/:id
    server.get('/clientes/:id', { preHandler: [authMiddleware] }, clientesFacturacionController.getById);
    // POST /factus/clientes
    server.post('/clientes', { preHandler: [authMiddleware] }, clientesFacturacionController.create);
    // PUT /factus/clientes/:id
    server.put('/clientes/:id', { preHandler: [authMiddleware] }, clientesFacturacionController.update);
    // DELETE /factus/clientes/:id
    server.delete('/clientes/:id', { preHandler: [authMiddleware] }, clientesFacturacionController.softDelete);

    // ==========================================
    // FACTURAS ELECTRÓNICAS
    // ==========================================
    // GET /factus/facturas
    server.get('/facturas', { preHandler: [authMiddleware] }, facturasController.list);
    // GET /factus/facturas/:id
    server.get('/facturas/:id', { preHandler: [authMiddleware] }, facturasController.getById);
    // GET /factus/facturas/desde-reserva/:id → Pre-llenar factura desde una reserva
    server.get('/facturas/desde-reserva/:id', { preHandler: [authMiddleware] }, facturasController.getDesdeReserva);
    // POST /facturas → Crear borrador
    server.post('/facturas', { preHandler: [authMiddleware] }, facturasController.create);
    // POST /facturas/:id/enviar → Enviar a Factus/DIAN
    server.post('/facturas/:id/enviar', { preHandler: [authMiddleware] }, facturasController.enviarDian);
    // GET /factus/facturas/:id/pdf → Descargar PDF
    server.get('/facturas/:id/pdf', { preHandler: [authMiddleware] }, facturasController.descargarPdf);
    // POST /factus/facturas/:id/email → Enviar por email
    server.post('/facturas/:id/email', { preHandler: [authMiddleware] }, facturasController.enviarEmail);

    // ==========================================
    // NOTAS DE CRÉDITO
    // ==========================================
    // GET /factus/notas-credito
    server.get('/notas-credito', { preHandler: [authMiddleware] }, notasCreditoController.list);
    // GET /factus/notas-credito/:id
    server.get('/notas-credito/:id', { preHandler: [authMiddleware] }, notasCreditoController.getById);
    // POST /factus/notas-credito
    server.post('/notas-credito', { preHandler: [authMiddleware] }, notasCreditoController.create);
    // POST /factus/notas-credito/:id/enviar
    server.post('/notas-credito/:id/enviar', { preHandler: [authMiddleware] }, notasCreditoController.enviarDian);
    // GET /factus/notas-credito/:id/pdf
    server.get('/notas-credito/:id/pdf', { preHandler: [authMiddleware] }, notasCreditoController.descargarPdf);

    // ==========================================
    // NOTAS DE DÉBITO
    // ==========================================
    // GET /factus/notas-debito
    server.get('/notas-debito', { preHandler: [authMiddleware] }, notasDebitoController.list);
    // GET /factus/notas-debito/:id
    server.get('/notas-debito/:id', { preHandler: [authMiddleware] }, notasDebitoController.getById);
    // POST /factus/notas-debito
    server.post('/notas-debito', { preHandler: [authMiddleware] }, notasDebitoController.create);
    // POST /factus/notas-debito/:id/enviar
    server.post('/notas-debito/:id/enviar', { preHandler: [authMiddleware] }, notasDebitoController.enviarDian);

    // ==========================================
    // DOCUMENTOS SOPORTE
    // ==========================================
    // GET /factus/documentos-soporte
    server.get('/documentos-soporte', { preHandler: [authMiddleware] }, documentosSoporteController.list);
    // GET /factus/documentos-soporte/:id
    server.get('/documentos-soporte/:id', { preHandler: [authMiddleware] }, documentosSoporteController.getById);
    // POST /factus/documentos-soporte
    server.post('/documentos-soporte', { preHandler: [authMiddleware] }, documentosSoporteController.create);
    // POST /factus/documentos-soporte/:id/enviar
    server.post('/documentos-soporte/:id/enviar', { preHandler: [authMiddleware] }, documentosSoporteController.enviarDian);

    // ==========================================
    // DECLARACIONES DE TERCEROS
    // ==========================================
    // GET /factus/declaraciones-terceros
    server.get('/declaraciones-terceros', { preHandler: [authMiddleware] }, declaracionesTercerosController.list);
    // GET /factus/declaraciones-terceros/:id
    server.get('/declaraciones-terceros/:id', { preHandler: [authMiddleware] }, declaracionesTercerosController.getById);
    // POST /factus/declaraciones-terceros → Crear manual
    server.post('/declaraciones-terceros', { preHandler: [authMiddleware] }, declaracionesTercerosController.create);
    // POST /factus/declaraciones-terceros/auto → Auto-generar desde movimientos del período
    server.post('/declaraciones-terceros/auto', { preHandler: [authMiddleware] }, declaracionesTercerosController.generarDesdeMovimientos);
    // POST /factus/declaraciones-terceros/:id/enviar
    server.post('/declaraciones-terceros/:id/enviar', { preHandler: [authMiddleware] }, declaracionesTercerosController.enviarDian);

    // ==========================================
    // PRODUCTOS Y SERVICIOS DE FACTURACIÓN
    // ==========================================
    // GET /factus/productos-servicios → Listar (query: search, tipo, page, limit)
    server.get('/productos-servicios', { preHandler: [authMiddleware] }, productosServiciosController.list);
    // GET /factus/productos-servicios/:id → Obtener por ID
    server.get('/productos-servicios/:id', { preHandler: [authMiddleware] }, productosServiciosController.getById);
    // POST /factus/productos-servicios → Crear
    server.post('/productos-servicios', { preHandler: [authMiddleware] }, productosServiciosController.create);
    // PUT /factus/productos-servicios/:id → Actualizar
    server.put('/productos-servicios/:id', { preHandler: [authMiddleware] }, productosServiciosController.update);
    // DELETE /factus/productos-servicios/:id → Eliminar (soft)
    server.delete('/productos-servicios/:id', { preHandler: [authMiddleware] }, productosServiciosController.softDelete);
}
