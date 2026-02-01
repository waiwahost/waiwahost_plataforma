export type EstadoTarjeta =
  | 'pendiente'
  | 'enviado'
  | 'confirmado'
  | 'error'
  | 'reintento';


export type TipoAcomodacion=
  | 'Apartamento'
  | 'Casa'
  | 'Habitación'
  | 'Suite'
  | 'Cama'
  | 'Finca'
  | 'Camping'
  | 'Otro';


export type MotivoViaje = 
 'Negocios'
  | 'Vacaciones'
  | 'Visitas'
  | 'Educacion'
  | 'Salud'
  | 'Religion'
  | 'Compras'
  | 'Transito'
  | 'Otros';

export interface PayloadTarjeta {
    tipo_identificacion: string;
    numero_identificacion: string;
    nombres: string;
    apellidos: string;
    ciudad_residencia: string;
    ciudad_procedencia: string;
    motivo: MotivoViaje;
    numero_habitacion: string;
    tipo_acomodacion: TipoAcomodacion;
    nombre_establecimiento: string;
    rnt_establecimiento: string;
    costo: number;
    check_in: string;
    check_out: string;
}
export interface ResponseTarjeta {
    isError: boolean;
    data?: unknown;
    message: string;
}

export interface TarjetaRegistro {
    id: number;
    id_reserva: number;
    id_huesped: number;
    id_inmueble: number;

    estado: EstadoTarjeta;
    fecha: string;
    intentos: number;
    ultimo_error: string | null;

    payload: PayloadTarjeta;
    respuesta_tra: Record<string, unknown> | null;

    created_at: string;
    updated_at: string;
}

export interface CreateTarjetaRegistro {
    id_reserva: number;
    id_huesped: number;
    id_inmueble: number;
    payload: PayloadTarjeta;
}

export interface TarjetaResponse {
    isError: boolean;
    data: TarjetaRegistro[];
    message: string;
}

export interface GetTarjetaQuery {
  id?: number;
  id_reserva?: number;
  id_huesped?: number;
  id_inmueble?: number;
  estado?: EstadoTarjeta;
  fecha?: string;
}
export interface EditTarjeta {
  id: number;
  payload?: Partial<PayloadTarjeta>;
  estado?: EstadoTarjeta;
  intentos?: number;
  ultimo_error?: string | null;
  respuesta_tra?: unknown;
}
