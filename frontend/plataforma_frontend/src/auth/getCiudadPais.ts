import { apiFetch } from './apiFetch';
import { ICiudad } from '../interfaces/Ciudad';

export const getCiudadesByPais = async (id_pais: number): Promise<ICiudad[]> => {
    return await apiFetch(`/api/ciudades/pais/${id_pais}`);
};

export const getCiudades = async (id_pais?: number): Promise<ICiudad[]> => {
    const url = id_pais ? `/api/ciudades?id_pais=${id_pais}` : '/api/ciudades';
    const response = await apiFetch(url);
    // Extraemos la data de la respuesta que viene con success: true, data: [...]
    return response.success ? response.data : response;
};

export const getCiudadById = async (id: number): Promise<ICiudad> => {
    const response = await apiFetch(`/api/ciudades/${id}`);
    return response.success ? response.data : response;
};
