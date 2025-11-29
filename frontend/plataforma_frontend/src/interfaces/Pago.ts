// Interfaces para pagos de reservas
export interface IPago {
  id: number;
  id_reserva: number;
  codigo_reserva: string;
  monto: number;
  fecha_pago: string;
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  concepto: string;
  descripcion?: string;
  comprobante?: string;
  id_empresa: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Para formularios de creación de pagos
export interface IPagoForm {
  monto: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  concepto?: string;
  descripcion?: string;
  comprobante?: string;
  fecha_pago?: string;
  id_empresa?: number;
}

// Para formularios de actualización de pagos
export interface IPagoUpdateForm {
  monto?: number;
  metodo_pago?: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  concepto?: string;
  descripcion?: string;
  comprobante?: string;
  fecha_pago?: string;
}

// Para respuestas de API internas
export interface IPagoApiResponse {
  success: boolean;
  data?: IPago | IPago[];
  message: string;
  error?: string;
}

// Resumen de pagos por reserva
export interface IResumenPagos {
  id_reserva: number;
  total_pagado: number;
  total_pendiente: number;
  cantidad_pagos: number;
  pagos: IPago[];
}