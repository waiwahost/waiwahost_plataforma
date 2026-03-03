export interface UnitKpis {
    id_inmueble: number;
    nombre: string;
    ocupacion: number; // Percentage (%)
    adr: number; // Average Daily Rate
    revpar: number; // Revenue Per Available Room
    ingreso_neto: number; // after platform commission
    costo_limpieza: number;
    utilidad: number;
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
    utilidad_total: number;
    margen_neto: number; // Percentage (%)
    total_area_m2: number;
    unidades: UnitKpis[];
    noches_disponibles_total: number;
    noches_ocupadas_total: number;
}

export interface KpiFilters {
    id_empresa: number;
    id_inmueble?: number; // Can be a building or a unit
    fecha_inicio: string;
    fecha_fin: string;
}
