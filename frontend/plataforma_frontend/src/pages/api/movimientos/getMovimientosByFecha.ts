import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

interface MovimientosResponse {
  success: boolean;
  data?: any[];
  message: string;
  error?: string;
}

/**
 * API Interna: Obtener movimientos por fecha
 * GET /api/movimientos/getMovimientosByFecha?fecha=2025-10-12
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MovimientosResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const { fecha, plataforma_origen } = req.query;
    
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

    // Construir endpoint con filtro opcional de plataforma
    let endpoint = `/movimientos/fecha/${fecha}?empresa_id=${empresaId}`;
    
    // Agregar filtro de plataforma si se proporciona
    if (plataforma_origen && typeof plataforma_origen === 'string') {
      endpoint += `&plataforma_origen=${plataforma_origen}`;
    }

    // Llamar a la API externa
    const externalResponse = await externalApiServerFetch(endpoint, {
      method: 'GET'
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al obtener movimientos',
        error: externalResponse.error
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: externalResponse.data,
      message: 'Movimientos obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error en API movimientos por fecha:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}