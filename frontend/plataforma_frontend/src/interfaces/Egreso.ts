// Interfaces para egresos específicos
export interface IEgreso {
  id: string;
  fecha: string;
  concepto: string;
  descripcion: string;
  monto: number;
  id_inmueble: string;
  nombre_inmueble: string;
  id_reserva?: string;
  codigo_reserva?: string;
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  comprobante?: string;
  tipo_egreso: 'movimiento'; // Solo movimientos, no hay "pagos" para egresos
  id_empresa: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Para respuestas de API
export interface IEgresoApiResponse {
  success: boolean;
  data: IEgreso[];
  message: string;
  error?: string;
}

// Para resumen de egresos diarios
export interface IResumenEgresos {
  fecha: string;
  total_egresos: number;
  cantidad_egresos: number;
  promedio_egreso: number;
  inmueble_seleccionado: string | null;
  egresos_por_inmueble: IEgresosPorInmueble[];
}

// Para respuesta de resumen de egresos
export interface IResumenEgresosApiResponse {
  success: boolean;
  data: IResumenEgresos | null;
  message: string;
  error?: string;
}

// Para agrupar egresos por inmueble
export interface IEgresosPorInmueble {
  id_inmueble: string;
  nombre_inmueble: string;
  total_egresos: number;
  cantidad_egresos: number;
}

// Para filtros del componente
export interface IFiltrosEgresos {
  fecha: string;
  id_inmueble?: string; // Si está vacío, muestra todos los inmuebles
}