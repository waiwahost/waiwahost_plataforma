export interface Inmueble {
  id_inmueble?: number;
  nombre: string;
  descripcion?: string;
  direccion: string;
  ciudad?: string;
  capacidad: number;
  id_propietario: number;
  id_empresa?: number | null;
  estado: 'activo' | 'inactivo';
  edificio?: string;
  apartamento?: string;
  id_prod_sigo?: string;
  comision?: number;
  precio_limpieza?: number;
  capacidad_maxima?: number;
  nro_habitaciones?: number;
  nro_bahnos?: number;
  cocina?: boolean;
  creado_en?: Date;
  actualizado_en?: Date;
}

export interface InmueblesQueryParams {
  id_empresa?: number;
  id?: number;
}

export interface CreateInmuebleData {
  nombre: string;
  descripcion?: string;
  direccion: string;
  ciudad?: string;
  capacidad: number;
  id_propietario: number;
  id_empresa?: number;
  edificio?: string;
  apartamento?: string;
  id_prod_sigo?: string;
  comision?: number;
  precio_limpieza?: number;
  capacidad_maxima?: number;
  nro_habitaciones?: number;
  nro_bahnos?: number;
  cocina?: boolean;
}

export interface EditInmuebleData {
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  capacidad?: number;
  //id_propietario?: number;
  //id_empresa?: number;
  estado?: 'activo' | 'inactivo';
  edificio?: string;
  apartamento?: string;
  id_prod_sigo?: string;
  comision?: number;
  precio_limpieza?: number;
  capacidad_maxima?: number;
  nro_habitaciones?: number;
  nro_bahnos?: number;
  cocina?: boolean;
}