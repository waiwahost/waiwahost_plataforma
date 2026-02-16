import { PlataformaOrigen } from '../constants/plataformas';


export interface IHuesped {
  id: number;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  documento_tipo?: 'cedula' | 'pasaporte' | 'tarjeta_identidad';
  documento_numero?: string;
  fecha_nacimiento?: string;
  es_principal: boolean;
  id_reserva: number;
  motivo: string;
  ciudad_residencia: string;
  ciudad_procedencia: string;
}

export interface IReserva {
  id: number;
  codigo_reserva: string;
  id_inmueble: number;
  nombre_inmueble: string;
  huesped_principal: {
    nombre: string;
    apellido: string;
    email?: string;
    telefono?: string;
    motivo: string;
    ciudad_residencia: string;
    ciudad_procedencia: string;
  };
  fecha_inicio: string;
  fecha_fin: string;
  numero_huespedes: number;
  huespedes: IHuesped[];
  precio_total: number; // Mantener por compatibilidad hacia atrás
  total_reserva: number; // Monto total de la reserva
  total_pagado: number; // Monto total pagado/abonado
  total_pendiente: number; // Monto pendiente por pagar
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
  fecha_creacion: string;
  observaciones?: string;
  id_empresa: number;
  plataforma_origen?: PlataformaOrigen;
}

export interface IHuespedForm {
  id?: number;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  documento_tipo?: 'cedula' | 'pasaporte' | 'tarjeta_identidad';
  documento_numero?: string;
  fecha_nacimiento?: string;
  es_principal: boolean;
  motivo: string;
  ciudad_residencia: string;
  ciudad_procedencia: string;
}

export interface IReservaForm {
  id_inmueble: number;
  fecha_inicio: string;
  fecha_fin: string;
  numero_huespedes: number;
  huespedes: IHuespedForm[];
  precio_total: number; // Mantener por compatibilidad hacia atrás
  total_reserva: number; // Monto total de la reserva
  total_pagado: number; // Monto total pagado/abonado
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
  observaciones?: string;
  id_empresa: number;
  plataforma_origen?: PlataformaOrigen;
}

export interface IReservaTableData extends IReserva {
  // Alias para la tabla, extiende directamente de IReserva
}
