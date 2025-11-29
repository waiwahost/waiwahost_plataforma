/* eslint-disable @typescript-eslint/no-explicit-any */
// src/auth/deleteInmuebleApi.ts

export interface DeleteInmuebleResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function deleteInmuebleApi(id: string): Promise<DeleteInmuebleResponse> {
  try {
    console.log('🗑️ deleteInmuebleApi called with ID:', id);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log('🔑 Token for delete request:', token ? 'Token present' : 'No token found');
    
    const response = await fetch('/api/inmuebles/deleteInmueble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ id }),
    });

    console.log('📡 Delete response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Delete response error:', errorText);
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }

    const result: DeleteInmuebleResponse = await response.json();
    console.log('📥 Delete response result:', result);

    if (!result.success) {
      throw new Error(result.message || 'Error al eliminar inmueble');
    }

    console.log('✅ Inmueble deleted successfully from API');
    return result;
  } catch (error) {
    console.error('❌ Error in deleteInmuebleApi:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al eliminar inmueble');
  }
}
