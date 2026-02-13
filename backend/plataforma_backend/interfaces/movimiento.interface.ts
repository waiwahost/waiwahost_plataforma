export interface Movimiento {
  id?: string;
  fecha: string; // DATE - Solo fecha para filtros por día (YYYY-MM-DD)
  tipo: 'ingreso' | 'egreso' | 'deducible';
  concepto: string;
  descripcion: string;
  monto: number;
  id_inmueble: string;
  nombre_inmueble?: string; // Campo calculado del JOIN
  id_reserva?: string | null;
  codigo_reserva?: string | null; // Campo calculado del JOIN
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  comprobante?: string | null;
  id_empresa: string;
  fecha_creacion?: Date; // TIMESTAMP - Fecha y hora exacta de creación
  fecha_actualizacion?: Date; // TIMESTAMP - Fecha de actualización
  // Campo de plataforma de origen (opcional)
  plataforma_origen?: string | null;
  // ID del pago que generó este movimiento (si aplica)
  id_pago?: number | null;
}

export interface CreateMovimientoData {
  fecha: string;
  tipo: 'ingreso' | 'egreso' | 'deducible';
  concepto: string;
  descripcion: string;
  monto: number;
  id_inmueble: string;
  id_reserva?: string | null;
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  comprobante?: string | null;
  id_empresa: string;
  // Campo de plataforma de origen (opcional)
  plataforma_origen?: string | null;
  // ID del pago que generó este movimiento (si aplica)
  id_pago?: number | null;
}

export interface EditMovimientoData {
  fecha?: string;
  tipo?: 'ingreso' | 'egreso' | 'deducible';
  concepto?: string;
  descripcion?: string;
  monto?: number;
  id_inmueble?: string;
  id_reserva?: string | null;
  metodo_pago?: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  comprobante?: string | null;
  // Campo de plataforma de origen (opcional)
  plataforma_origen?: string | null;
  // ID del pago que generó este movimiento (si aplica)
  id_pago?: number | null;
}

export interface MovimientosQueryParams {
  fecha?: string;
  empresa_id?: string;
  id_inmueble?: string;
  // Nuevo campo para filtrar por plataforma
  plataforma_origen?: string;
}

export interface ResumenDiario {
  fecha: string;
  total_ingresos: number;
  total_egresos: number;
  total_deducibles: number;
  balance: number;
  cantidad_movimientos: number;
}

export interface InmuebleSelector {
  id: string;
  nombre: string;
  direccion: string;
  estado: string;
}

// Conceptos válidos por tipo de movimiento
export const CONCEPTOS_INGRESOS = [
  'reserva',
  'limpieza',
  'deposito_garantia',
  'servicios_adicionales',
  'multa',
  'otro'
] as const;

export const CONCEPTOS_EGRESOS = [
  'mantenimiento',
  'limpieza',
  'servicios_publicos',
  'suministros',
  'comision',
  'devolucion',
  'impuestos',
  'otro'
] as const;

export const CONCEPTOS_DEDUCIBLES = [
  'mantenimiento',
  'limpieza',
  'servicios_publicos',
  'suministros',
  'comision', 
  'impuestos',
  'multa',
  'otro'
] as const;

export type ConceptoIngreso = typeof CONCEPTOS_INGRESOS[number];
export type ConceptoEgreso = typeof CONCEPTOS_EGRESOS[number];
export type ConceptoDeducible = typeof CONCEPTOS_DEDUCIBLES[number];

// Unión de todos los conceptos válidos
export type ConceptoMovimiento = ConceptoIngreso | ConceptoEgreso;
export type ConceptoDeducibleMovimiento = ConceptoDeducible;

// Función para validar concepto según tipo
export function isConceptoValido(tipo: 'ingreso' | 'egreso' | 'deducible', concepto: string): boolean {
  if (tipo === 'ingreso') {
    return CONCEPTOS_INGRESOS.includes(concepto as ConceptoIngreso);
  } else if (tipo === 'egreso') {
    return CONCEPTOS_EGRESOS.includes(concepto as ConceptoEgreso);
  } else if (tipo === 'deducible') {
    return CONCEPTOS_DEDUCIBLES.includes(concepto as ConceptoDeducible);
  }
}