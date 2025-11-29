import { apiFetch } from './apiFetch';
import { IInmueble, IInmuebleApiResponse } from '../interfaces/Inmueble';

export type { IInmueble } from '../interfaces/Inmueble';

export interface GetInmueblesResponse {
  success: boolean;
  data: IInmueble[];
  message: string;
}

export const getInmueblesApi = async (): Promise<IInmueble[]> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch('/api/inmuebles/getInmuebles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }

    const result: GetInmueblesResponse = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Error al obtener inmuebles');
    }

    return result.data;
  } catch (error) {
    console.error('Error en getInmueblesApi:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al obtener inmuebles');
  }
};
