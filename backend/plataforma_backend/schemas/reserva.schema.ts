import { FastifySchema } from 'fastify';

export const getReservasSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      id_empresa: { type: 'number' },
      id_inmueble: { type:'number' },
      estado: { type: 'string' },
      fecha_inicio: { type: 'string', format: 'date' },
      fecha_fin: { type: 'string', format: 'date' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        isError: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              codigo_reserva: { type: 'string' },
              id_inmueble: { type: 'number' },
              nombre_inmueble: { type: 'string' },
              huesped_principal: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  apellido: { type: 'string' },
                  email: { type: 'string' },
                  telefono: { type: 'string' }
                }
              },
              fecha_inicio: { type: 'string' },
              fecha_fin: { type: 'string' },
              numero_huespedes: { type: 'number' },
              huespedes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    nombre: { type: 'string' },
                    apellido: { type: 'string' },
                    email: { type: 'string' },
                    telefono: { type: 'string' },
                    documento_tipo: { type: 'string' },
                    documento_numero: { type: 'string' },
                    fecha_nacimiento: { type: 'string' },
                    es_principal: { type: 'boolean' },
                    id_reserva: { type: 'number' }
                  }
                }
              },
              precio_total: { type: 'number' },
              total_reserva: { type: 'number' },
              total_pagado: { type: 'number' },
              total_pendiente: { type: 'number' },
              estado: { type: 'string' },
              fecha_creacion: { type: 'string' },
              observaciones: { type: 'string' },
              id_empresa: { type: 'number' },
              plataforma_origen: { type: 'string' }
            }
          }
        },
        message: { type: 'string' }
      }
    }
  }
};


export const createReservaSchema: FastifySchema = {
  body: {
    type: 'object',
    required: [
      'id_inmueble',
      'fecha_inicio',
      'fecha_fin',
      'numero_huespedes',
      'huespedes',
      'precio_total',
      'total_reserva',
      'estado',
      'id_empresa'
    ],
    properties: {
      id_inmueble: { type: 'number' },
      fecha_inicio: { type: 'string', format: 'date' },
      fecha_fin: { type: 'string', format: 'date' },
      numero_huespedes: { type: 'number', minimum: 1 },
      total_reserva: { type: 'number', minimum: 0 },
      total_pagado: { type: 'number', minimum: 0 },
      estado: { type: 'string', enum: ['pendiente', 'confirmada', 'cancelada', 'finalizada'] },
      observaciones: { type: 'string' },
      id_empresa: { type: 'number' },
      plataforma_origen: {
        type: 'string',
        enum: ['airbnb', 'booking', 'pagina_web', 'directa']
      }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        isError: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            codigo_reserva: { type: 'string' },
            id_inmueble: { type: 'number' },
            nombre_inmueble: { type: 'string' },
            huesped_principal: {
              type: 'object',
              properties: {
                nombre: { type: 'string' },
                apellido: { type: 'string' },
                email: { type: 'string' },
                telefono: { type: 'string' }
              }
            },
            fecha_inicio: { type: 'string' },
            fecha_fin: { type: 'string' },
            numero_huespedes: { type: 'number' },
            huespedes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  nombre: { type: ['string', 'null'] },
                  apellido: { type: ['string', 'null'] },
                  email: { type: ['string', 'null'] },
                  telefono: { type: ['string', 'null'] },
                  documento_tipo: { type: ['string', 'null'] },
                  documento_numero: { type: 'string', minLength: 1 },
                  fecha_nacimiento: { type: ['string', 'null'] },
                  es_principal: { type: 'boolean' },
                  id_reserva: { type: 'number' }
                }
              }
            },
            precio_total: { type: 'number' },
            total_reserva: { type: 'number' },
            total_pagado: { type: 'number' },
            total_pendiente: { type: 'number' },
            estado: { type: 'string' },
            fecha_creacion: { type: 'string' },
            observaciones: { type: 'string' },
            id_empresa: { type: 'number' },
            plataforma_origen: { type: 'string' }
          }
        },
        message: { type: 'string' }
      }
    }
  }
};

export const editReservaSchema: FastifySchema = {
  body: {
    type: 'object',
    minProperties: 1,
    properties: {
      fecha_inicio: { type: 'string', format: 'date' },
      fecha_fin: { type: 'string', format: 'date' },
      numero_huespedes: { type: 'number', minimum: 1 },
      huespedes: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: [
            'es_principal'
          ],
          properties: {
            id: { type: 'number' },
            nombre: { type: ['string', 'null'] },
            apellido: { type: ['string', 'null'] },
            email: { type: ['string', 'null'] },
            telefono: { type: ['string', 'null'] },
            documento_tipo: { type: ['string', 'null'] },
            documento_numero: { type: ['string', 'null'] },
            fecha_nacimiento: { type: ['string', 'null'] },
            es_principal: { type: 'boolean' }
          }
        }
      },
      precio_total: { type: 'number', minimum: 0 },
      total_reserva: { type: 'number', minimum: 0 },
      total_pagado: { type: 'number', minimum: 0 },
      estado: { type: 'string', enum: ['pendiente', 'confirmada', 'cancelada', 'finalizada'] },
      observaciones: { type: 'string' },
      id_empresa: { type: 'number' },
      plataforma_origen: {
        type: 'string',
        enum: ['airbnb', 'booking', 'pagina_web', 'directa']
      }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: 'object',
      properties: {
        isError: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' }
      }
    }
  }
};
