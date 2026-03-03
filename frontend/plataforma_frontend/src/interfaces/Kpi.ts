export interface UnitKpis {
    id_inmueble: number;
    nombre: string;
    ocupacion: number;
    adr: number;
    revpar: number;
    ingreso_neto: number;
    ingreso_total: number;
    costo_limpieza: number;
    utilidad: number;
    gasto_proporcional_asignado?: number;
    noches_disponibles: number;
    noches_ocupadas: number;
    total_reservas: number;
    area_m2: number;
}

export interface BuildingKpis {
    id_edificio: number;
    nombre: string;
    ocupacion_global: number;
    revpar_edificio: number;
    ingresos_totales: number;
    ingresos_brutos: number;
    utilidad_total: number;
    margen_neto: number;
    total_area_m2: number;
    noches_disponibles_total: number;
    noches_ocupadas_total: number;
    unidades: (UnitKpis & { gasto_proporcional_asignado: number })[];
}

export interface KpiResponse {
    type: 'unit' | 'building';
    data: UnitKpis | BuildingKpis;
}

export interface KpiFilters {
    id_inmueble: number;
    fecha_inicio: string;
    fecha_fin: string;
}
