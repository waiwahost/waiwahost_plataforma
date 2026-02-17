import { apiFetch } from './apiFetch';
import { CreateBloqueoRequest, IBloqueo, UpdateBloqueoRequest } from '../interfaces/Bloqueo';

const API_URL = '/api/bloqueos';

export const getBloqueosApi = async (params: any = {}): Promise<IBloqueo[]> => {
    const queryParams = new URLSearchParams(params).toString();
    return apiFetch(`${API_URL}?${queryParams}`, {
        method: 'GET',
    });
};

export const createBloqueoApi = async (data: CreateBloqueoRequest): Promise<IBloqueo> => {
    return apiFetch(`${API_URL}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateBloqueoApi = async (id: number, data: UpdateBloqueoRequest): Promise<IBloqueo> => {
    return apiFetch(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const deleteBloqueoApi = async (id: number): Promise<void> => {
    return apiFetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
};
