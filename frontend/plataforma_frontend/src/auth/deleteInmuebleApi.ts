/* eslint-disable @typescript-eslint/no-explicit-any */
// src/auth/deleteInmuebleApi.ts

export interface DeleteInmuebleResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function deleteInmuebleApi(id: string): Promise<DeleteInmuebleResponse> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const response = await fetch('/api/inmuebles/deleteInmueble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }

    const result: DeleteInmuebleResponse = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Error al eliminar inmueble');
    }
    return result;
  } catch (error) {
    console.error('❌ Error in deleteInmuebleApi:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al eliminar inmueble');
  }
}
