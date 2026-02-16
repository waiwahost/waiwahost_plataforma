export interface Ciudad {
    id_ciudad?: number;
    nombre: string;
    id_pais: number;
    pais_nombre?: string;
    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
}

export interface CreateCiudadData {
    nombre: string;
    id_pais: number;
}

export interface EditCiudadData {
    nombre?: string;
}
