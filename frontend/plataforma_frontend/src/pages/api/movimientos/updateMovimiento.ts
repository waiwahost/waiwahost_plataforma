import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../lib/externalApiClient';

interface UpdateMovimientoResponse {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}

/**
 * API Interna: Actualizar movimiento
 * PUT /api/movimientos/updateMovimiento?id=123
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateMovimientoResponse>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const { id } = req.query;
    
    // Validar parámetros
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID del movimiento es requerido'
      });
    }

    // Extraer token
    const token = extractTokenFromRequest(req);

    // Llamar a la API externa
    const endpoint = `/movimientos/${id}`;
    const externalResponse = await externalApiServerFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(req.body)
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al actualizar movimiento',
        error: externalResponse.error
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: externalResponse.data,
      message: 'Movimiento actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error en API actualizar movimiento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}