export interface Concepto {
    id_concepto?: number;
    nombre: string;
    slug: string;
    tipo_movimiento: ('ingreso' | 'egreso' | 'deducible')[];
    id_empresa?: number | null; // null = concepto global del sistema
    estado: 'activo' | 'inactivo';
    creado_en?: Date;
}

export interface CreateConceptoData {
    nombre: string;
    slug?: string; // Se genera automáticamente del nombre si no se provee
    tipo_movimiento: ('ingreso' | 'egreso' | 'deducible')[];
    id_empresa?: number | null;
}

export interface EditConceptoData {
    nombre?: string;
    slug?: string;
    tipo_movimiento?: ('ingreso' | 'egreso' | 'deducible')[];
    estado?: 'activo' | 'inactivo';
}

export interface ConceptosQueryParams {
    tipo?: 'ingreso' | 'egreso' | 'deducible';
    busqueda?: string;
    id_empresa?: number;
}
