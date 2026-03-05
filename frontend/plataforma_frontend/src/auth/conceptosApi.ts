import { apiFetch } from './apiFetch';

export interface IConcepto {
    id_concepto: number;
    nombre: string;
    slug: string;
    tipo_movimiento: ('ingreso' | 'egreso' | 'deducible')[];
    id_empresa: number | null;
    estado: 'activo' | 'inactivo';
}

export interface CreateConceptoPayload {
    nombre: string;
    tipo_movimiento: ('ingreso' | 'egreso' | 'deducible')[];
}

export async function getConceptos(params?: {
    tipo?: 'ingreso' | 'egreso' | 'deducible';
    busqueda?: string;
}): Promise<{ success: boolean; data: IConcepto[]; message?: string }> {
    try {
        const query = new URLSearchParams();
        if (params?.tipo) query.set('tipo', params.tipo);
        if (params?.busqueda) query.set('busqueda', params.busqueda);
        const url = `/api/conceptos/getConceptos${query.toString() ? `?${query.toString()}` : ''}`;
        const data = await apiFetch(url, { method: 'GET' });
        return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
        console.error('Error al obtener conceptos:', error);
        return { success: false, data: [], message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function createConcepto(payload: CreateConceptoPayload): Promise<{ success: boolean; data?: IConcepto; message?: string }> {
    try {
        const data = await apiFetch('/api/conceptos/createConcepto', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return { success: true, data };
    } catch (error) {
        console.error('Error al crear concepto:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Error al crear concepto' };
    }
}
