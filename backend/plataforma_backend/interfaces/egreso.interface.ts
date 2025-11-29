// Interfaces para Egresos (Solo movimientos tipo egreso)

export interface Egreso {
  id: number;
  fecha: string;
  hora: string;
  concepto: string;
  descripcion: string;
  monto: number;
  id_inmueble: number;
  nombre_inmueble: string;
  id_reserva?: number | null;
  codigo_reserva?: string | null;
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  fecha_creacion: string;
  comprobante?: string | null;
}

export interface ResumenEgresos {
  fecha: string;
  inmueble_filtro: string | null; // null = todos los inmuebles
  total_egresos: number;
  cantidad_egresos: number;
  promedio_egreso: number;
  desglose_inmuebles?: {
    id_inmueble: number;
    nombre_inmueble: string;
    total: number;
    cantidad: number;
  }[];
}

export interface FiltrosEgresos {
  fecha: string; // Obligatorio - formato YYYY-MM-DD
  id_inmueble?: number; // Opcional - para filtrar por inmueble específico
  empresa_id?: number; // Opcional - del contexto del usuario. Si no se especifica, obtiene de todas las empresas
}

export interface InmuebleFiltro {
  id: number;
  nombre: string;
  direccion: string;
}

// Response types para las APIs
export interface EgresosResponse {
  isError: boolean;
  data: Egreso[];
  message: string;
}

export interface ResumenEgresosResponse {
  isError: boolean;
  data: ResumenEgresos;
  message: string;
}

export interface InmueblesFiltroResponse {
  isError: boolean;
  data: InmuebleFiltro[];
  message: string;
}

// Conceptos específicos para egresos con sus colores asociados
export const CONCEPTOS_EGRESOS_CONFIG = {
  'mantenimiento': { label: 'Mantenimiento', color: 'orange' },
  'limpieza': { label: 'Limpieza', color: 'green' },
  'servicios_publicos': { label: 'Servicios Públicos', color: 'blue' },
  'suministros': { label: 'Suministros', color: 'purple' },
  'comision': { label: 'Comisión', color: 'yellow' },
  'devolucion': { label: 'Devolución', color: 'red' },
  'impuestos': { label: 'Impuestos', color: 'gray' },
  'otro': { label: 'Otro', color: 'gray' }
} as const;

export type ConceptoEgresoKey = keyof typeof CONCEPTOS_EGRESOS_CONFIG;