// Interfaces para inmuebles
export interface IInmueble {
  id: string;
  id_inmueble: string;
  nombre: string;
  direccion: string;
  edificio: string;
  apartamento: string;
  comision: number;
  id_propietario: string;
  tipo: 'apartamento' | 'casa' | 'studio' | 'penthouse' | 'oficina' | 'local';
  estado: 'disponible' | 'ocupado' | 'mantenimiento' | 'inactivo';
  precio: number;
  precio_limpieza: number;
  id_producto_sigo: string;
  descripcion: string;
  capacidad_maxima: number;
  habitaciones: number;
  banos: number;
  area: number;
  tiene_cocina: boolean;
  id_empresa: string;
  nombre_empresa: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Para formularios de creación/edición
export interface IInmuebleForm {
  nombre: string;
  direccion: string;
  edificio: string;
  apartamento: string;
  comision: number;
  id_propietario: string;
  descripcion: string;
  precio_limpieza: number;
  id_producto_sigo: string;
  capacidad_maxima: number;
  habitaciones: number;
  banos: number;
  tiene_cocina: boolean;
  id_empresa: string;
}

// Para respuestas de API
export interface IInmuebleApiResponse {
  success: boolean;
  data?: IInmueble | IInmueble[];
  message: string;
  error?: string;
}
