import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../lib/externalApiClient';

interface DeleteMovimientoResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * API Interna: Eliminar movimiento
 * DELETE /api/movimientos/deleteMovimiento?id=123
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteMovimientoResponse>
) {
  if (req.method !== 'DELETE') {
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
      method: 'DELETE'
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al eliminar movimiento',
        error: externalResponse.error
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      message: 'Movimiento eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en API eliminar movimiento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}