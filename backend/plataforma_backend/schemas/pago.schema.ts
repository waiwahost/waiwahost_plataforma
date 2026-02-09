// Schemas JSON Schema compatibles con Fastify
// Los métodos de pago disponibles
const METODOS_PAGO = ['efectivo', 'transferencia', 'tarjeta', 'otro'] as const;

// Schema para crear un nuevo pago
export const createPagoSchema = {
  type: 'object',
  required: ['id_reserva', 'monto', 'metodo_pago', 'concepto'],
  properties: {
    id_reserva: {
      type: 'integer',
      minimum: 1,
      description: 'ID de la reserva'
    },
    monto: {
      type: 'number',
      minimum: 0.01,
      description: 'Monto del pago'
    },
    fecha_pago: {
      type: 'string',
      format: 'date',
      description: 'Fecha del pago (YYYY-MM-DD)'
    },
    metodo_pago: {
      type: 'string',
      enum: METODOS_PAGO,
      description: 'Método de pago utilizado'
    },
    concepto: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      description: 'Concepto del pago'
    },
    descripcion: {
      type: 'string',
      maxLength: 1000,
      description: 'Descripción detallada del pago'
    },
    comprobante: {
      type: 'string',
      maxLength: 255,
      description: 'Número de comprobante'
    },
    id_empresa: {
      type: 'integer',
      minimum: 1,
      description: 'ID de la empresa'
    },
    id_usuario_registro: {
      type: 'integer',
      minimum: 1,
      description: 'ID del usuario que registra el pago'
    }
  }
};

// Schema para actualizar un pago
export const updatePagoSchema = {
  type: 'object',
  properties: {
    monto: {
      type: 'number',
      minimum: 0.01
    },
    fecha_pago: {
      type: 'string',
      format: 'date'
    },
    metodo_pago: {
      type: 'string',
      enum: METODOS_PAGO
    },
    concepto: {
      type: 'string',
      minLength: 1,
      maxLength: 255
    },
    descripcion: {
      type: 'string',
      maxLength: 1000
    },
    comprobante: {
      type: 'string',
      maxLength: 255
    }
  }
};

// Schema para parámetros de consulta de pagos
export const pagosQuerySchema = {
  type: 'object',
  properties: {
    id_reserva: {
      type: 'string',
      pattern: '^[1-9]\\d*$'
    },
    fecha_desde: {
      type: 'string',
      format: 'date'
    },
    fecha_hasta: {
      type: 'string',
      format: 'date'
    },
    metodo_pago: {
      type: 'string',
      enum: METODOS_PAGO
    },
    id_empresa: {
      type: 'string',
      pattern: '^[1-9]\\d*$'
    },
    page: {
      type: 'string',
      pattern: '^[1-9]\\d*$',
      default: '1'
    },
    limit: {
      type: 'string',
      pattern: '^[1-9]\\d*$',
      default: '50'
    }
  }
};

// Schema para parámetros de ID
export const pagoIdSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      pattern: '^[1-9]\\d*$',
      description: 'ID del pago'
    }
  }
};

export const reservaIdSchema = {
  type: 'object',
  required: ['id_reserva'],
  properties: {
    id_reserva: {
      type: 'string',
      pattern: '^[1-9]\\d*$',
      description: 'ID de la reserva'
    }
  }
};

// Schema para validar fechas
export const fechaSchema = {
  type: 'object',
  required: ['fecha'],
  properties: {
    fecha: {
      type: 'string',
      format: 'date',
      description: 'Fecha en formato YYYY-MM-DD'
    }
  }
};

// Schema para estadísticas
export const estadisticasQuerySchema = {
  type: 'object',
  properties: {
    fecha_inicio: {
      type: 'string',
      format: 'date',
      description: 'Fecha de inicio del período'
    },
    fecha_fin: {
      type: 'string',
      format: 'date',
      description: 'Fecha de fin del período'
    },
    id_empresa: {
      type: 'string',
      pattern: '^[1-9]\\d*$',
      description: 'ID de la empresa'
    }
  }
};

// Tipos TypeScript para las interfaces de request
export interface CreatePagoRequest {
  id_reserva: number;
  monto: number;
  fecha_pago?: string;
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  concepto: string;
  descripcion?: string;
  comprobante?: string;
  id_empresa: number;
  id_usuario_registro?: number;
}

export interface UpdatePagoRequest {
  monto?: number;
  fecha_pago?: string;
  metodo_pago?: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  concepto?: string;
  descripcion?: string;
  comprobante?: string;
}

export interface PagosQueryRequest {
  id_reserva?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  metodo_pago?: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  id_empresa?: number;
  page?: number;
  limit?: number;
}

export interface PagoIdRequest {
  id: number;
}

export interface ReservaIdRequest {
  id_reserva: number;
}

export interface FechaRequest {
  fecha: string;
}

export interface EstadisticasQueryRequest {
  fecha_inicio?: string;
  fecha_fin?: string;
  id_empresa?: number;
}