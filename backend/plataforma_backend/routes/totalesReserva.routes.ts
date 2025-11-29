import { FastifyInstance } from 'fastify';
import { TotalesReservaController } from '../controllers/totalesReserva.controller';

/**
 * Rutas administrativas para manejo de totales de reservas
 * Prefijo: /admin/totales-reservas
 */
export default async function totalesReservaRoutes(fastify: FastifyInstance) {
  
  // Actualizar totales de una reserva específica
  fastify.put('/reservas/:id/actualizar-totales', {
    schema: {
      description: 'Actualiza los totales de una reserva específica',
      tags: ['Admin', 'Reservas', 'Totales'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID de la reserva' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            isError: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id_reserva: { type: 'number' }
              }
            },
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            isError: { type: 'boolean' },
            message: { type: 'string' },
            code: { type: 'number' }
          }
        },
        500: {
          type: 'object',
          properties: {
            isError: { type: 'boolean' },
            message: { type: 'string' },
            code: { type: 'number' }
          }
        }
      }
    },
    handler: TotalesReservaController.actualizarTotalesReserva
  });

  // Actualizar totales de múltiples reservas
  fastify.put('/reservas/actualizar-totales-lote', {
    schema: {
      description: 'Actualiza los totales de múltiples reservas en lote',
      tags: ['Admin', 'Reservas', 'Totales'],
      body: {
        type: 'object',
        properties: {
          ids_reservas: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array de IDs de reservas'
          }
        },
        required: ['ids_reservas']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            isError: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                procesadas: { type: 'number' },
                errores: { type: 'number' },
                detalleErrores: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      idReserva: { type: 'number' },
                      error: { type: 'string' }
                    }
                  }
                }
              }
            },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: TotalesReservaController.actualizarTotalesMultiples
  });

  // Actualizar totales de todas las reservas de una empresa
  fastify.put('/empresas/:id/actualizar-totales-reservas', {
    schema: {
      description: 'Actualiza los totales de todas las reservas de una empresa',
      tags: ['Admin', 'Empresas', 'Totales'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID de la empresa' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            isError: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                procesadas: { type: 'number' },
                errores: { type: 'number' },
                detalleErrores: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      idReserva: { type: 'number' },
                      error: { type: 'string' }
                    }
                  }
                }
              }
            },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: TotalesReservaController.actualizarTotalesEmpresa
  });

  // Verificar consistencia de totales de una reserva
  fastify.get('/reservas/:id/verificar-totales', {
    schema: {
      description: 'Verifica la consistencia entre totales guardados y calculados',
      tags: ['Admin', 'Reservas', 'Verificación'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID de la reserva' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            isError: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                esConsistente: { type: 'boolean' },
                totalesGuardados: {
                  type: 'object',
                  properties: {
                    totalPagado: { type: 'number' },
                    totalPendiente: { type: 'number' }
                  }
                },
                totalesCalculados: {
                  type: 'object',
                  properties: {
                    totalPagado: { type: 'number' },
                    totalPendiente: { type: 'number' }
                  }
                },
                diferencias: {
                  type: 'object',
                  properties: {
                    totalPagado: { type: 'number' },
                    totalPendiente: { type: 'number' }
                  }
                }
              }
            },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: TotalesReservaController.verificarConsistenciaTotales
  });
}