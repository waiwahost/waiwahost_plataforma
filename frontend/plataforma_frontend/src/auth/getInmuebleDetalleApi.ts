import { IInmueble } from '../interfaces/Inmueble';

export interface GetInmuebleDetalleResponse {
  success: boolean;
  data: IInmueble | null;
  message: string;
}

export const getInmuebleDetalleApi = async (inmuebleId: string): Promise<IInmueble> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const response = await fetch(`/api/inmuebles/getInmuebleDetalle?id=${inmuebleId}`, {
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

    const result: GetInmuebleDetalleResponse = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Error al obtener detalle del inmueble');
    }

    if (!result.data) {
      throw new Error('No se encontró el inmueble');
    }

    return result.data;
  } catch (error) {
    console.error('❌ Error en getInmuebleDetalleApi:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al obtener detalle del inmueble');
  }
};
