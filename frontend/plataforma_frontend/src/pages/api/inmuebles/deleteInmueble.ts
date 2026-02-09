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


  return externalData;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido. Solo se permite POST.'
    });
  }

  try {
    const { id } = req.body;

    // Validar el ID del inmueble
    const validationErrors = validateInmuebleId(id);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validationErrors
      });
    }

    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';


    // Convertir ID a string para asegurar consistencia
    const inmuebleId = String(id);

    // Realizar la llamada a la API externa
    const externalData = await callExternalDeleteAPI(inmuebleId, token, apiUrl);

    // Verificar si la API externa retornó error
    if (externalData.isError) {
      return res.status(400).json({
        success: false,
        message: externalData.message || 'Error eliminando inmueble desde la API externa'
      });
    }

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
