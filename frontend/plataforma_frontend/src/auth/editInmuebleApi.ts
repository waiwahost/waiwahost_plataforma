/* eslint-disable @typescript-eslint/no-explicit-any */
// src/auth/editInmuebleApi.ts
import { IInmueble } from '../interfaces/Inmueble';

export interface EditInmuebleResponse {
  success: boolean;
  message: string;
  data?: IInmueble;
}

export async function editInmuebleApi(inmueble: any): Promise<EditInmuebleResponse> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch('/api/inmuebles/editInmueble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(inmueble),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }

    const result: EditInmuebleResponse = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Error al actualizar inmueble');
    }
    return result;
  } catch (error) {
    console.error('❌ Error in editInmuebleApi:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al actualizar inmueble');
  }
}
