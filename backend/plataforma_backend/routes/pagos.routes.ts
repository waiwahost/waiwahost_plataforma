import { FastifyInstance } from 'fastify';
import { PagosController } from '../controllers/pagos.controller';
import {
  createPagoSchema,
  updatePagoSchema,
  pagosQuerySchema,
  pagoIdSchema,
  reservaIdSchema,
  estadisticasQuerySchema
} from '../schemas/pago.schema';
import { authMiddleware } from '../middlewares/authMiddleware';

export default async function pagosRoutes(fastify: FastifyInstance) {
  // Prefijo para todas las rutas de pagos
  const routePrefix = '/api/v1/pagos';

  /**
   * @swagger
   * /api/v1/pagos/reserva/{id_reserva}:
   *   get:
   *     tags:
   *       - Pagos
   *     summary: Obtiene todos los pagos de una reserva específica
   *     description: Retorna la lista completa de pagos realizados para una reserva, junto con el resumen financiero
   *     parameters:
   *       - name: id_reserva
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la reserva
   *     responses:
   *       200:
   *         description: Pagos obtenidos exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     pagos:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Pago'
   *                     resumen:
   *                       $ref: '#/components/schemas/ResumenPagosReserva'
   *                     total_pagos:
   *                       type: integer
   *       404:
   *         description: Reserva no encontrada
   */
  fastify.get(`${routePrefix}/reserva/:id_reserva`, {
    schema: {
      params: reservaIdSchema
    },
    preHandler: [authMiddleware]
  }, PagosController.getPagosByReserva);

  /**
   * @swagger
   * /api/v1/pagos:
   *   get:
   *     tags:
   *       - Pagos
   *     summary: Obtiene pagos con filtros y paginación
   *     description: Permite buscar pagos aplicando diversos filtros con soporte para paginación
   *     parameters:
   *       - name: id_reserva
   *         in: query
   *         schema:
   *           type: integer
   *         description: Filtrar por ID de reserva
   *       - name: fecha_desde
   *         in: query
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha de inicio (YYYY-MM-DD)
   *       - name: fecha_hasta
   *         in: query
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha de fin (YYYY-MM-DD)
   *       - name: metodo_pago
   *         in: query
   *         schema:
   *           type: string
   *           enum: [efectivo, transferencia, tarjeta, otro]
   *         description: Filtrar por método de pago
   *       - name: page
   *         in: query
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Número de página
   *       - name: limit
   *         in: query
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *         description: Elementos por página
   *     responses:
   *       200:
   *         description: Pagos obtenidos exitosamente
   */
  fastify.get(`${routePrefix}`, {
    schema: {
      querystring: pagosQuerySchema
    },
    preHandler: [authMiddleware]
  }, PagosController.getPagosWithFilters);

  /**
   * @swagger
   * /api/v1/pagos/{id}:
   *   get:
   *     tags:
   *       - Pagos
   *     summary: Obtiene un pago específico por ID
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del pago
   *     responses:
   *       200:
   *         description: Pago encontrado exitosamente
   *       404:
   *         description: Pago no encontrado
   */
  fastify.get(`${routePrefix}/:id`, {
    schema: {
      params: pagoIdSchema
    },
    preHandler: [authMiddleware]
  }, PagosController.getPagoById);

  /**
   * @swagger
   * /api/v1/pagos:
   *   post:
   *     tags:
   *       - Pagos
   *     summary: Crea un nuevo pago para una reserva
   *     description: Registra un nuevo pago y automáticamente crea el movimiento de ingreso asociado
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreatePago'
   *           example:
   *             id_reserva: 1
   *             monto: 200000
   *             metodo_pago: "transferencia"
   *             concepto: "Abono inicial"
   *             descripcion: "Primer pago de la reserva"
   *             comprobante: "TRF-001"
   *             fecha_pago: "2024-01-15"
   *     responses:
   *       201:
   *         description: Pago creado exitosamente
   *       400:
   *         description: Datos inválidos o pago excede monto pendiente
   */
  fastify.post(`${routePrefix}`, {
    schema: {
      body: createPagoSchema
    },
    preHandler: [authMiddleware]
  }, PagosController.createPago);

  /**
   * @swagger
   * /api/v1/pagos/{id}:
   *   put:
   *     tags:
   *       - Pagos
   *     summary: Actualiza un pago existente
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del pago a actualizar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdatePago'
   *           example:
   *             monto: 250000
   *             concepto: "Abono inicial actualizado"
   *             descripcion: "Monto corregido del primer pago"
   *     responses:
   *       200:
   *         description: Pago actualizado exitosamente
   *       404:
   *         description: Pago no encontrado
   */
  fastify.put(`${routePrefix}/:id`, {
    schema: {
      params: pagoIdSchema,
      body: updatePagoSchema
    },
    preHandler: [authMiddleware]
  }, PagosController.updatePago);

  /**
   * @swagger
   * /api/v1/pagos/{id}:
   *   delete:
   *     tags:
   *       - Pagos
   *     summary: Elimina un pago
   *     description: Elimina un pago y su movimiento asociado (si existe)
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del pago a eliminar
   *     responses:
   *       200:
   *         description: Pago eliminado exitosamente
   *       404:
   *         description: Pago no encontrado
   */
  fastify.delete(`${routePrefix}/:id`, {
    schema: {
      params: pagoIdSchema
    },
    preHandler: [authMiddleware]
  }, PagosController.deletePago);

  /**
   * @swagger
   * /api/v1/pagos/reserva/{id_reserva}/resumen:
   *   get:
   *     tags:
   *       - Pagos
   *     summary: Obtiene el resumen financiero de una reserva
   *     description: Retorna el estado financiero completo de una reserva incluyendo totales y estadísticas
   *     parameters:
   *       - name: id_reserva
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la reserva
   *     responses:
   *       200:
   *         description: Resumen obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     resumen:
   *                       $ref: '#/components/schemas/ResumenPagosReserva'
   */
  fastify.get(`${routePrefix}/reserva/:id_reserva/resumen`, {
    schema: {
      params: reservaIdSchema
    },
    preHandler: [authMiddleware]
  }, PagosController.getResumenReserva);

  /**
   * @swagger
   * /api/v1/pagos/fecha:
   *   get:
   *     tags:
   *       - Pagos
   *     summary: Obtiene pagos por fecha específica
   *     description: Retorna todos los pagos realizados en una fecha específica para generar reportes diarios
   *     parameters:
   *       - name: fecha
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha a consultar (YYYY-MM-DD)
   *     responses:
   *       200:
   *         description: Pagos del día obtenidos exitosamente
   */
  fastify.get(`${routePrefix}/fecha`, { preHandler: [authMiddleware] }, PagosController.getPagosByFecha);

  /**
   * @swagger
   * /api/v1/pagos/estadisticas/metodos-pago:
   *   get:
   *     tags:
   *       - Pagos
   *     summary: Obtiene estadísticas por método de pago
   *     description: Genera estadísticas de pagos agrupadas por método de pago para análisis y reportes
   *     parameters:
   *       - name: fecha_inicio
   *         in: query
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha de inicio del período (YYYY-MM-DD)
   *       - name: fecha_fin
   *         in: query
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha de fin del período (YYYY-MM-DD)
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas exitosamente
   */
  fastify.get(`${routePrefix}/estadisticas/metodos-pago`, {
    schema: {
      querystring: estadisticasQuerySchema
    },
    preHandler: [authMiddleware]
  }, PagosController.getEstadisticasMetodosPago);
}

// Esquemas para documentación Swagger
export const pagosSchemas = {
  Pago: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      id_reserva: { type: 'integer' },
      codigo_reserva: { type: 'string' },
      monto: { type: 'number' },
      fecha_pago: { type: 'string', format: 'date' },
      metodo_pago: { type: 'string', enum: ['efectivo', 'transferencia', 'tarjeta', 'otro'] },
      concepto: { type: 'string' },
      descripcion: { type: 'string' },
      comprobante: { type: 'string' },
      id_empresa: { type: 'integer' },
      fecha_creacion: { type: 'string', format: 'date-time' },
      fecha_actualizacion: { type: 'string', format: 'date-time' },
      id_usuario_registro: { type: 'integer' }
    }
  },
  CreatePago: {
    type: 'object',
    required: ['id_reserva', 'monto', 'metodo_pago', 'concepto', 'id_empresa'],
    properties: {
      id_reserva: { type: 'integer' },
      monto: { type: 'number', minimum: 0.01 },
      fecha_pago: { type: 'string', format: 'date' },
      metodo_pago: { type: 'string', enum: ['efectivo', 'transferencia', 'tarjeta', 'otro'] },
      concepto: { type: 'string', maxLength: 255 },
      descripcion: { type: 'string', maxLength: 1000 },
      comprobante: { type: 'string', maxLength: 255 },
      id_empresa: { type: 'integer' },
      id_usuario_registro: { type: 'integer' }
    }
  },
  UpdatePago: {
    type: 'object',
    properties: {
      monto: { type: 'number', minimum: 0.01 },
      fecha_pago: { type: 'string', format: 'date' },
      metodo_pago: { type: 'string', enum: ['efectivo', 'transferencia', 'tarjeta', 'otro'] },
      concepto: { type: 'string', maxLength: 255 },
      descripcion: { type: 'string', maxLength: 1000 },
      comprobante: { type: 'string', maxLength: 255 }
    }
  },
  ResumenPagosReserva: {
    type: 'object',
    properties: {
      id_reserva: { type: 'integer' },
      codigo_reserva: { type: 'string' },
      total_reserva: { type: 'number' },
      total_pagado: { type: 'number' },
      total_pendiente: { type: 'number' },
      cantidad_pagos: { type: 'integer' },
      porcentaje_pagado: { type: 'number' },
      estado_pago: { type: 'string', enum: ['sin_pagos', 'parcial', 'completo', 'excedido'] },
      ultimo_pago: {
        type: 'object',
        properties: {
          fecha: { type: 'string', format: 'date' },
          monto: { type: 'number' },
          metodo: { type: 'string' }
        }
      }
    }
  }
};