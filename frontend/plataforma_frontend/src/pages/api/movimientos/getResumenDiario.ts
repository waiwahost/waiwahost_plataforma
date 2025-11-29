import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

interface ResumenResponse {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}

/**
 * API Interna: Obtener resumen diario
 * GET /api/movimientos/getResumenDiario?fecha=2025-10-12
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResumenResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const { fecha } = req.query;
    
    // Validar parámetros
    if (!fecha || typeof fecha !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Fecha es requerida'
      });
    }

    // Extraer token y empresa_id
    const token = extractTokenFromRequest(req);
    const empresaId = getEmpresaIdFromToken(token);

    // Llamar a la API externa
    const endpoint = `/movimientos/resumen/${fecha}?empresa_id=${empresaId}`;
    const externalResponse = await externalApiServerFetch(endpoint, {
      method: 'GET'
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al obtener resumen',
        error: externalResponse.error
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: externalResponse.data,
      message: 'Resumen obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error en API resumen diario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}