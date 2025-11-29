export interface IHuesped {
  id_huesped: number;
  nombre: string;
  apellido: string;
  documento_numero: string;
  email: string;
  telefono: string;
  direccion?: string;
  fecha_nacimiento?: string;
  estado: 'activo' | 'inactivo';
  id_empresa?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IHuespedTableData {
  id_huesped: number;
  nombre: string;
  apellido: string;
  documento_numero: string;
  email: string;
  telefono: string;
  estado: 'activo' | 'inactivo';
}

export interface IHuespedEditableFields {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  estado?: 'activo' | 'inactivo';
  id_empresa?: number;
}

export interface IHuespedDetailData extends IHuesped {
  direccion: string;
  fecha_nacimiento: string;
}