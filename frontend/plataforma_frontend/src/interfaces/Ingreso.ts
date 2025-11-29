// Interfaces para ingresos específicos
export interface IIngreso {
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
  tipo_ingreso: 'movimiento' | 'pago'; // Para distinguir si viene de movimientos o pagos
  id_empresa: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Para respuestas de API
export interface IIngresoApiResponse {
  success: boolean;
  data: IIngreso[];
  message: string;
  error?: string;
}

// Para resumen de ingresos diarios
export interface IResumenIngresos {
  fecha: string;
  total_ingresos: number;
  cantidad_ingresos: number;
  promedio_ingreso: number;
  inmueble_seleccionado: string | null;
  ingresos_por_inmueble: IIngresosPorInmueble[];
}

// Para respuesta de resumen de ingresos
export interface IResumenIngresosApiResponse {
  success: boolean;
  data: IResumenIngresos | null;
  message: string;
  error?: string;
}

// Para agrupar ingresos por inmueble
export interface IIngresosPorInmueble {
  id_inmueble: string;
  nombre_inmueble: string;
  total_ingresos: number;
  cantidad_ingresos: number;
}

// Para filtros del componente
export interface IFiltrosIngresos {
  fecha: string;
  id_inmueble?: string; // Si está vacío, muestra todos los inmuebles
}

// Para inmuebles en el selector
export interface IInmuebleFiltro {
  id: string;
  nombre: string;
  direccion: string;
}

// Para respuesta de inmuebles filtro
export interface IInmuebleFiltroApiResponse {
  success: boolean;
  data: IInmuebleFiltro[];
  message: string;
  error?: string;
}