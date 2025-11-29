import { apiFetch } from '../auth/apiFetch';

export interface ReporteFinancieroFilters {
    empresaId?: number;
    inmuebleId?: number;
    propietarioId?: number;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface IOpcionesReporte {
    empresas?: { id: number; nombre: string }[];
    inmuebles?: { id: number; nombre: string }[];
    propietarios?: { id: number; nombre: string }[];
}

export const getReporteFinanciero = async (filters: ReporteFinancieroFilters) => {
    const queryParams = new URLSearchParams();
    if (filters.empresaId) queryParams.append('empresaId', filters.empresaId.toString());
    if (filters.inmuebleId) queryParams.append('inmuebleId', filters.inmuebleId.toString());
    if (filters.propietarioId) queryParams.append('propietarioId', filters.propietarioId.toString());
    if (filters.fechaInicio) queryParams.append('fechaInicio', filters.fechaInicio);
    if (filters.fechaFin) queryParams.append('fechaFin', filters.fechaFin);

    // Call internal Next.js API
    return apiFetch(`/api/reportes/financiero?${queryParams.toString()}`);
};

export const getOpcionesReporte = async (empresaId?: number, tipo?: 'empresas' | 'inmuebles' | 'propietarios'): Promise<IOpcionesReporte | null> => {
    try {
        const params = new URLSearchParams();
        if (empresaId) params.append('empresaId', empresaId.toString());
        if (tipo) params.append('tipo', tipo);

        const response = await apiFetch(`/api/reportes/opciones?${params.toString()}`, {
            method: 'GET',
        });

        if (response.success && response.data) {
            return response.data as IOpcionesReporte;
        }

        console.error('Error al obtener opciones de reporte:', response.message);
        return null;
    } catch (error) {
        console.error('Error en getOpcionesReporte:', error);
        return null;
    }
};
