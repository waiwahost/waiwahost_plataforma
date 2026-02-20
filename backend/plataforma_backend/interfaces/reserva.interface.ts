export interface Huesped {
  id: number;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  documento_tipo?: string;
  documento_numero?: string;
  fecha_nacimiento?: string;
  es_principal: boolean;
  id_reserva: number;
  ciudad_residencia?: string;
  ciudad_procedencia?: string;
  motivo?:
  'Negocios' |
  'Vacaciones' |
  'Visitas' |
  'Educacion' |
  'Salud' |
  'Religion' |
  'Compras' |
  'Transito' |
  'Otros';
}

export interface HuespedPrincipal {
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  ciudadResidencia?: string,
  ciudadProcedencia?: string,
  motivo?: string
}

export interface Reserva {
  id: number;
  codigo_reserva: string;
  id_inmueble: number;
  nombre_inmueble: string;
  huesped_principal: HuespedPrincipal;
  fecha_inicio: string;
  fecha_fin: string;
  numero_huespedes: number;
  huespedes: Huesped[];
  precio_total: number;
  // Nuevos campos financieros
  total_reserva: number;
  total_pagado: number;
  total_pendiente: number;
  estado: string;
  fecha_creacion: string;
  observaciones: string;
  id_empresa: number;
  // Campo de plataforma de origen
  plataforma_origen: string;
}

export interface ReservasResponse {
  isError: boolean;
  data: Reserva[];
  message: string;
}

export interface GetReservasQuery {
  id?: number;
  id_empresa?: number;
  id_inmueble?: number;
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  plataforma_origen?: string;
}

export interface CreateHuespedData {
  id?: number;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  documento_tipo?: string;
  documento_numero?: string;
  fecha_nacimiento?: string;
  es_principal: boolean;
  ciudad_residencia?: string;
  ciudad_procedencia?: string;
  motivo?:
  'Negocios' |
  'Vacaciones' |
  'Visitas' |
  'Educacion' |
  'Salud' |
  'Religion' |
  'Compras' |
  'Transito' |
  'Otros';
}

export interface CreateReservaRequest {
  id_inmueble: number;
  fecha_inicio: string;
  fecha_fin: string;
  numero_huespedes: number;
  huespedes?: CreateHuespedData[];
  precio_total: number;
  // Nuevos campos financieros
  total_reserva: number;
  total_pagado?: number; // Opcional, por defecto 0
  estado: string;
  observaciones?: string;
  id_empresa: number;
  // Campo de plataforma de origen (opcional)
  plataforma_origen?: string;
}

export interface CreateReservaResponse {
  isError: boolean;
  data: Reserva;
  message: string;
}

export interface EditReservaRequest {
  id_inmueble?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  numero_huespedes?: number;
  huespedes?: CreateHuespedData[];
  precio_total?: number;
  // Nuevos campos financieros
  total_reserva?: number;
  total_pagado?: number;
  estado?: string;
  observaciones?: string;
  // Campo de plataforma de origen (opcional)
  plataforma_origen?: string;
}
