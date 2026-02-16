export interface Pais {
    id_pais?: number;
    nombre: string;
    codigo_iso2: string;
    codigo_iso3?: string;
    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
}

export interface CreatePaisData {
    nombre: string;
    codigo_iso2: string;
    codigo_iso3?: string;
}

export interface EditPaisData {
    nombre?: string;
    codigo_iso2?: string;
    codigo_iso3?: string;
}
