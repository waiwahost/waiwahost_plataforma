export interface Bloqueo {
    id_bloqueo: number;
    id_inmueble: number;
    fecha_inicio: string;
    fecha_fin: string;
    tipo_bloqueo: 'mantenimiento' | 'aseo' | 'uso_propietario' | 'administrativo' | 'otro';
    descripcion?: string;
    fecha_creacion?: string;
}

export interface CreateBloqueoRequest {
    id_inmueble: number;
    fecha_inicio: string;
    fecha_fin: string;
    tipo_bloqueo: string;
    descripcion?: string;
}

export interface UpdateBloqueoRequest extends Partial<CreateBloqueoRequest> { }

export interface GetBloqueosQuery {
    id_inmueble?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    tipo_bloqueo?: string;
}
