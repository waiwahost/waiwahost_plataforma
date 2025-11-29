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
    console.log('🔄 editInmuebleApi called with data:', inmueble);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log('🔑 Token for edit request:', token ? 'Token present' : 'No token found');
    
    const response = await fetch('/api/inmuebles/editInmueble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(inmueble),
    });

    console.log('📡 Edit response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Edit response error:', errorText);
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }

    const result: EditInmuebleResponse = await response.json();
    console.log('📥 Edit response result:', result);

    if (!result.success) {
      throw new Error(result.message || 'Error al actualizar inmueble');
    }

    console.log('✅ Inmueble updated successfully from API');
    return result;
  } catch (error) {
    console.error('❌ Error in editInmuebleApi:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al actualizar inmueble');
  }
}
