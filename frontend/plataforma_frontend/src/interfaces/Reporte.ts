// Interfaces para el sistema de reportes

export interface IReporteConfig {
  tipo_reporte: 'empresa' | 'inmueble' | 'propietario';
  periodo: {
    año: number;
    mes: number; // 1-12
    fecha_inicio: string; // YYYY-MM-DD
    fecha_fin: string; // YYYY-MM-DD
  };
  filtros: {
    id_empresa?: string;
    id_inmueble?: string;
    id_propietario?: string;
  };
}

export interface IReporteFinanciero {
  config: IReporteConfig;
  resumen_general: IResumenGeneral;
  detalle_inmuebles: IDetalleInmueble[];
  graficos: IGraficosData;
  fecha_generacion: string;
}

export interface IResumenGeneral {
  total_ingresos: number;
  total_egresos: number;
  ganancia_neta: number;
  cantidad_inmuebles: number;
  cantidad_reservas: number;
  ocupacion_promedio: number; // Porcentaje
  inmueble_mas_rentable: {
    id: string;
    nombre: string;
    ganancia: number;
  };
  mes_anterior: {
    total_ingresos: number;
    total_egresos: number;
    ganancia_neta: number;
    variacion_porcentual: number;
  };
}

export interface IDetalleInmueble {
  id_inmueble: string;
  nombre_inmueble: string;
  propietario: {
    id: string;
    nombre: string;
    apellido: string;
  };
  metricas: {
    total_ingresos: number;
    total_egresos: number;
    ganancia_neta: number;
    dias_ocupados: number;
    dias_disponibles: number;
    tasa_ocupacion: number; // Porcentaje
    precio_promedio_noche: number;
    cantidad_reservas: number;
  };
  ingresos_detalle: IIngresoDetalle[];
  egresos_detalle: IEgresoDetalle[];
  reservas_detalle: IReservaDetalle[];
}

export interface IIngresoDetalle {
  id: string;
  fecha: string;
  concepto: string;
  monto: number;
  metodo_pago: string;
  id_reserva?: string;
  codigo_reserva?: string;
}

export interface IEgresoDetalle {
  id: string;
  fecha: string;
  concepto: string;
  monto: number;
  metodo_pago: string;
  categoria: 'mantenimiento' | 'limpieza' | 'servicios' | 'administrativo' | 'otro';
}

export interface IReservaDetalle {
  id: string;
  codigo_reserva: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias: number;
  monto_total: number;
  estado: string;
  plataforma_origen?: string;
  huesped: {
    nombre: string;
    apellido: string;
  };
}

export interface IGraficosData {
  ingresos_por_dia: IDataPoint[];
  egresos_por_dia: IDataPoint[];
  ganancia_por_dia: IDataPoint[];
  ingresos_por_inmueble: IPieChartData[];
  egresos_por_categoria: IPieChartData[];
  ocupacion_por_inmueble: IBarChartData[];
  comparacion_meses: IComparisonData[];
  tendencia_anual: ITendenciaAnual[];
}

export interface IDataPoint {
  fecha: string;
  valor: number;
  label?: string;
}

export interface IPieChartData {
  name: string;
  value: number;
  porcentaje: number;
  color: string;
}

export interface IBarChartData {
  nombre: string;
  ocupacion: number;
  disponibilidad: number;
  total_dias: number;
}

export interface IComparisonData {
  periodo: string;
  ingresos: number;
  egresos: number;
  ganancia: number;
}

export interface ITendenciaAnual {
  mes: string;
  año: number;
  ingresos: number;
  egresos: number;
  ganancia: number;
  reservas: number;
}

// Interfaces para filtros del componente
export interface IFiltrosReporte {
  tipo_reporte: 'empresa' | 'inmueble' | 'propietario';
  año: number;
  mes: number;
  id_empresa?: string;
  id_inmueble?: string;
  id_propietario?: string;
}

// Interface para opciones de exportación
export interface IExportOptions {
  formato: 'pdf' | 'excel' | 'csv';
  incluir_graficos: boolean;
  incluir_detalles: boolean;
  incluir_comparaciones: boolean;
}

// Interface para respuesta de API
export interface IReporteApiResponse {
  success: boolean;
  data?: IReporteFinanciero;
  message: string;
  error?: string;
}

// Interface para metadatos de empresas/inmuebles/propietarios para selects
export interface IOpcionesReporte {
  empresas: IEmpresaOption[];
  inmuebles: IInmuebleOption[];
  propietarios: IPropietarioOption[];
}

export interface IEmpresaOption {
  id: string;
  nombre: string;
  cantidad_inmuebles: number;
}

export interface IInmuebleOption {
  id: string;
  nombre: string;
  id_empresa: string;
  nombre_empresa: string;
  id_propietario: string;
  nombre_propietario: string;
}

export interface IPropietarioOption {
  id: string;
  nombre: string;
  apellido: string;
  cantidad_inmuebles: number;
  inmuebles: string[]; // IDs de inmuebles
}