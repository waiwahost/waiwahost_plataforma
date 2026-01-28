import { PlataformaOrigen } from '../constants/plataformas';

// Interfaces para movimientos de caja
export interface IMovimiento {
  id: string;
  fecha: string;
  tipo: 'ingreso' | 'egreso' | 'deducible';
  concepto: string;
  descripcion: string;
  monto: number;
  id_inmueble: string;
  nombre_inmueble: string;
  id_reserva?: string; // Opcional
  codigo_reserva?: string; // Opcional
  plataforma_origen?: PlataformaOrigen; // Nueva columna
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  comprobante?: string; // URL o número de comprobante
  id_empresa: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Para formularios de creación/edición
export interface IMovimientoForm {
  tipo: 'ingreso' | 'egreso' | 'deducible';
  concepto: string;
  descripcion: string;
  monto: number;
  id_inmueble: string;
  id_reserva?: string;
  plataforma_origen?: PlataformaOrigen; // Nueva columna
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  comprobante?: string;
  fecha: string;
}

// Para respuestas de API
export interface IMovimientoApiResponse {
  success: boolean;
  data?: IMovimiento | IMovimiento[];
  message: string;
  error?: string;
}

// Para resumen diario
export interface IResumenDiario {
  fecha: string;
  total_ingresos: number;
  total_egresos: number;
  total_deducibles: number;
  balance: number;
  cantidad_movimientos: number;
}

// Tipos de conceptos predefinidos
export type ConceptoIngreso = 
  | 'reserva'
  | 'limpieza'
  | 'deposito_garantia'
  | 'servicios_adicionales'
  | 'multa'
  | 'otro';

export type ConceptoEgreso = 
  | 'mantenimiento'
  | 'limpieza'
  | 'servicios_publicos'
  | 'suministros'
  | 'comision'
  | 'devolucion'
  | 'impuestos'
  | 'otro';

export type ConceptoDeducible = 
  | 'mantenimiento'
  | 'limpieza'
  | 'servicios_publicos'
  | 'suministros'
  | 'comision'
  | 'impuestos'
  | 'multa'
  | 'otro';