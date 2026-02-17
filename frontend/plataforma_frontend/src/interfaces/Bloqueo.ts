export interface IBloqueo {
    id: number;
    id_inmueble: number;
    fecha_inicio: string;
    fecha_fin: string;
    tipo_bloqueo: 'mantenimiento' | 'limpieza' | 'reparacion' | 'uso_propietario' | 'otro';
    descripcion?: string;
    created_at?: string;
}

export interface CreateBloqueoRequest {
    id_inmueble: number;
    fecha_inicio: string;
    fecha_fin: string;
    tipo_bloqueo: 'mantenimiento' | 'limpieza' | 'reparacion' | 'uso_propietario' | 'otro';
    descripcion?: string;
}

export interface UpdateBloqueoRequest extends Partial<CreateBloqueoRequest> { }
