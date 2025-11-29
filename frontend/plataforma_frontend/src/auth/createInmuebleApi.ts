import { IInmueble, IInmuebleForm, IInmuebleApiResponse } from '../interfaces/Inmueble';

export interface CreateInmuebleResponse {
  success: boolean;
  data?: IInmueble;
  message: string;
}

export const createInmuebleApi = async (inmuebleData: IInmuebleForm): Promise<IInmueble> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch('/api/inmuebles/createInmueble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(inmuebleData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }

    const result: CreateInmuebleResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.message || 'Error al crear inmueble');
    }

    return result.data;
  } catch (error) {
    console.error('Error en createInmuebleApi:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al crear inmueble');
  }
};
