import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

interface CreateMovimientoResponse {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}

/**
 * API Interna: Crear movimiento
 * POST /api/movimientos/createMovimiento
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateMovimientoResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    // Extraer token y empresa_id
    const token = extractTokenFromRequest(req);
    const empresaId = getEmpresaIdFromToken(token);

    // Agregar empresa_id al payload
    const payload = {
      ...req.body,
      id_empresa: empresaId
    };

    // Llamar a la API externa
    const endpoint = `/movimientos`;
    const externalResponse = await externalApiServerFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al crear movimiento',
        error: externalResponse.error
      });
    }

    // Respuesta exitosa
    return res.status(201).json({
      success: true,
      data: externalResponse.data,
      message: 'Movimiento creado exitosamente'
    });

  } catch (error) {
    console.error('Error en API crear movimiento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}