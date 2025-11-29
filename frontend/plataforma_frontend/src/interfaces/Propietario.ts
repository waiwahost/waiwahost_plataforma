export interface IPropietario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  cedula: string;
  fecha_registro: string;
  estado: 'activo' | 'inactivo';
  id_empresa: number;
}

export interface IPropietarioForm {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  cedula: string;
  estado: 'activo' | 'inactivo';
  id_empresa: number;
}

// Interface para campos editables (sin cedula y username)
export interface IPropietarioEditableFields {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  estado?: 'activo' | 'inactivo';
  id_empresa?: number;
}

export interface IPropietarioTableData {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  cedula: string;
  fecha_registro: string;
  estado: 'activo' | 'inactivo';
  id_empresa: number;
  inmuebles?: string[]; // IDs de los inmuebles que posee
}