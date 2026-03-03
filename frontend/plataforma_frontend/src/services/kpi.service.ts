import { apiFetch } from '../auth/apiFetch';
import { KpiFilters, KpiResponse } from '../interfaces/Kpi';

export const getKpis = async (filters: KpiFilters): Promise<KpiResponse | null> => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('id_inmueble', filters.id_inmueble.toString());
        queryParams.append('fecha_inicio', filters.fecha_inicio);
        queryParams.append('fecha_fin', filters.fecha_fin);

        const response = await apiFetch(`/api/kpis?${queryParams.toString()}`);
        return response as KpiResponse;
    } catch (error) {
        console.error('Error en getKpis service:', error);
        return null;
    }
};
