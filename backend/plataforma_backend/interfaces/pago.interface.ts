export interface Pago {
  id: number;
  id_reserva: number;
  codigo_reserva: string;
  monto: number;
  fecha_pago: string; // YYYY-MM-DD
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  concepto: string;
  descripcion?: string;
  comprobante?: string;
  id_empresa: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  // Campo opcional para futura auditoría
  id_usuario_registro?: number;
}

export interface CreatePagoData {
  id_reserva: number;
  monto: number;
  fecha_pago?: string; // Si no se especifica, usa la fecha actual
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  concepto: string;
  descripcion?: string;
  comprobante?: string;
  id_empresa: number;
  id_usuario_registro?: number;
}

export interface EditPagoData {
  monto?: number;
  fecha_pago?: string;
  metodo_pago?: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  concepto?: string;
  descripcion?: string;
  comprobante?: string;
}

export interface PagosQueryParams {
  id_reserva?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  metodo_pago?: string;
  id_empresa?: number;
  page?: number;
  limit?: number;
}

export interface ResumenPagosReserva {
  id_reserva: number;
  codigo_reserva: string;
  total_reserva: number;
  total_pagado: number;
  total_pendiente: number;
  cantidad_pagos: number;
  porcentaje_pagado: number;
  estado_pago: 'sin_pagos' | 'parcial' | 'completo' | 'excedido';
  ultimo_pago?: {
    fecha: string;
    monto: number;
    metodo: string;
  };
}

export interface PagoConMovimiento {
  pago: Pago;
  movimiento_id?: string;
  movimiento_creado: boolean;
}

export interface DeletePagoResult {
  pago_eliminado: {
    id: number;
    monto: number;
    codigo_reserva: string;
  };
  movimientos_eliminados: {
    cantidad: number;
    ids: string[];
  };
  resumen_actualizado: {
    total_pagado: number;
    total_pendiente: number;
  };
}

// Validaciones de negocio
export interface ValidacionPago {
  es_valido: boolean;
  errores: string[];
  advertencias?: string[];
}

// Tipos de concepto específicos para pagos
export const CONCEPTOS_PAGOS = [
  'abono_inicial',
  'saldo_final',
  'deposito_garantia',
  'servicios_adicionales',
  'limpieza_extra',
  'gastos_adicionales',
  'penalidad',
  'otro'
] as const;

export type ConceptoPago = typeof CONCEPTOS_PAGOS[number];

// Métodos de pago válidos
export const METODOS_PAGO = [
  'efectivo',
  'transferencia',
  'tarjeta',
  'otro'
] as const;

export type MetodoPago = typeof METODOS_PAGO[number];

// Estados de pago de una reserva
export type EstadoPago = 'sin_pagos' | 'parcial' | 'completo' | 'excedido';

/**
 * Función utilitaria para calcular el estado de pago de una reserva
 */
export function calcularEstadoPago(totalReserva: number, totalPagado: number): EstadoPago {
  if (totalPagado <= 0) return 'sin_pagos';
  if (totalPagado < totalReserva) return 'parcial';
  if (totalPagado === totalReserva) return 'completo';
  return 'excedido';
}

/**
 * Función utilitaria para calcular el porcentaje de pago
 */
export function calcularPorcentajePagado(totalReserva: number, totalPagado: number): number {
  if (totalReserva <= 0) return 0;
  return Math.round((totalPagado / totalReserva) * 100 * 100) / 100; // Redondear a 2 decimales
}

/**
 * Función utilitaria para validar que un pago no exceda el monto pendiente
 */
export function validarMontoPago(montoNuevoPago: number, totalReserva: number, totalPagadoActual: number): ValidacionPago {
  const errores: string[] = [];
  const advertencias: string[] = [];

  // Validaciones básicas
  if (montoNuevoPago <= 0) {
    errores.push('El monto del pago debe ser mayor a 0');
  }

  if (montoNuevoPago > totalReserva) {
    errores.push('El monto del pago no puede ser mayor al total de la reserva');
  }

  const totalDespuesPago = totalPagadoActual + montoNuevoPago;
  const montoPendiente = totalReserva - totalPagadoActual;

  if (totalDespuesPago > totalReserva) {
    const exceso = totalDespuesPago - totalReserva;
    errores.push(`El pago excede el monto pendiente por $${exceso.toLocaleString('es-CO')} (Total Reserva: ${totalReserva}, Pagado: ${totalPagadoActual}, Nuevo: ${montoNuevoPago})`);
  }

  if (montoNuevoPago > montoPendiente && montoPendiente > 0) {
    advertencias.push(`El pago supera el monto pendiente de $${montoPendiente.toLocaleString('es-CO')}`);
  }

  return {
    es_valido: errores.length === 0,
    errores,
    advertencias: advertencias.length > 0 ? advertencias : undefined
  };
}

/**
 * Función utilitaria para formatear un pago como string descriptivo
 */
export function formatearPagoDescripcion(pago: Pago): string {
  const fecha = new Date(pago.fecha_pago).toLocaleDateString('es-CO');
  const monto = pago.monto.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  });

  return `${fecha} - ${monto} (${pago.metodo_pago}) - ${pago.concepto}`;
}