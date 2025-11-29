// Interfaces para Ingresos (Combinación de movimientos tipo ingreso + pagos de reservas)

export interface Ingreso {
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
  tipo_registro: 'movimiento' | 'pago'; // Para distinguir origen del ingreso
  fecha_creacion: string;
  comprobante?: string | null;
}

export interface ResumenIngresos {
  fecha: string;
  inmueble_filtro: string | null; // null = todos los inmuebles
  total_ingresos: number;
  cantidad_ingresos: number;
  promedio_ingreso: number;
  desglose_inmuebles?: {
    id_inmueble: number;
    nombre_inmueble: string;
    total: number;
    cantidad: number;
  }[];
}

export interface FiltrosIngresos {
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
export interface IngresosResponse {
  isError: boolean;
  data: Ingreso[];
  message: string;
}

export interface ResumenIngresosResponse {
  isError: boolean;
  data: ResumenIngresos;
  message: string;
}

export interface InmueblesFiltroResponse {
  isError: boolean;
  data: InmuebleFiltro[];
  message: string;
}