import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../lib/externalApiClient';

interface GetMovimientoResponse {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}

/**
 * API Interna: Obtener movimiento por ID
 * GET /api/movimientos/getMovimientoById?id=123
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetMovimientoResponse>
) {
  if (req.method !== 'GET') {
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
      method: 'GET'
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al obtener movimiento',
        error: externalResponse.error
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: externalResponse.data,
      message: 'Movimiento obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error en API obtener movimiento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}