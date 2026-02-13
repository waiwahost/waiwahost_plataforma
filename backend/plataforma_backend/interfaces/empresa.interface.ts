export interface Empresa {
    id_empresa?: number;
    nombre: string;
    nit: string;
    plan_actual: string;
    estado: 'activa' | 'inactiva';
    fecha_creacion?: Date;
    fecha_final?: Date | null;
}

export interface CreateEmpresaData {
    nombre: string;
    nit: string;
    plan_actual: string;
    estado?: 'activa' | 'inactiva';
}

export interface EditEmpresaData {
    nombre?: string;
    nit?: string;
    plan_actual?: string;
    estado?: 'activa' | 'inactiva';
    fecha_final?: Date | null;
}
