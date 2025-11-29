import type { NextApiRequest, NextApiResponse } from 'next';

// Interfaz para la respuesta de la API externa
interface ExternalApiDeleteResponse {
  isError: boolean;
  message?: string;
  data?: any;
}

// Función para validar el ID del inmueble
const validateInmuebleId = (id: any): string[] => {
  const errors: string[] = [];

  if (!id) {
    errors.push('El ID del inmueble es obligatorio');
    return errors;
  }

  // Verificar que el ID sea válido (string no vacío o número válido)
  if (typeof id === 'string' && id.trim() === '') {
    errors.push('El ID del inmueble no puede estar vacío');
  }

  if (typeof id === 'number' && id <= 0) {
    errors.push('El ID del inmueble debe ser mayor a 0');
  }

  return errors;
};

// Función para realizar la llamada a la API externa
const callExternalDeleteAPI = async (inmuebleId: string, token: string, apiUrl: string): Promise<ExternalApiDeleteResponse> => {
  console.log('🚀 Calling external delete API:', `${apiUrl}/inmuebles/deleteInmueble?id=${inmuebleId}`);
  console.log('🔑 Using token:', token ? 'Token present' : 'No token');

  const response = await fetch(`${apiUrl}/inmuebles/deleteInmueble?id=${inmuebleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }

  const externalData: ExternalApiDeleteResponse = await response.json();
  
  console.log('📥 External API response:', {
    isError: externalData.isError,
    message: externalData.message,
    hasData: !!externalData.data
  });

  return externalData;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🚀 DELETE INMUEBLE API CALLED');
  console.log('📥 Request method:', req.method);
  console.log('📥 Request body:', req.body);
  console.log('📥 Request headers authorization:', req.headers.authorization ? 'Present' : 'Missing');

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ 
      success: false,
      message: 'Método no permitido. Solo se permite POST.' 
    });
  }

  try {
    const { id } = req.body;

    console.log('📥 Received inmueble deletion request for ID:', id);

    // Validar el ID del inmueble
    const validationErrors = validateInmuebleId(id);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validationErrors
      });
    }

    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    
    console.log('🌐 API URL:', apiUrl);
    console.log('🔑 Token status:', token ? `Token present (${token.substring(0, 10)}...)` : 'No token');
    
    // Convertir ID a string para asegurar consistencia
    const inmuebleId = String(id);

    // Realizar la llamada a la API externa
    const externalData = await callExternalDeleteAPI(inmuebleId, token, apiUrl);

    // Verificar si la API externa retornó error
    if (externalData.isError) {
      console.log('❌ External API returned error:', externalData.message);
      return res.status(400).json({
        success: false,
        message: externalData.message || 'Error eliminando inmueble desde la API externa'
      });
    }

    console.log('✅ Inmueble deleted successfully:', inmuebleId);

    // Retornar respuesta exitosa
    res.status(200).json({
      success: true,
      message: externalData.message || 'Inmueble eliminado exitosamente',
      data: {
        id: inmuebleId,
        deleted: true,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in deleteInmueble API:', error);
    
    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      // Error de red o HTTP
      if (error.message.includes('HTTP error!')) {
        return res.status(502).json({
          success: false,
          message: 'Error de comunicación con el servidor externo'
        });
      }
      
      // Error de parsing o estructura
      if (error.message.includes('JSON')) {
        return res.status(502).json({
          success: false,
          message: 'Error procesando respuesta del servidor externo'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
