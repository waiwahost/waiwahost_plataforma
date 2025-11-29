import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

interface FiltrarMovimientosResponse {
  success: boolean;
  data?: any[];
  message: string;
  error?: string;
}

/**
 * API Interna: Filtrar movimientos por plataforma y fecha
 * GET /api/movimientos/filtrarPorPlataforma?fecha=2025-10-12&plataforma=airbnb
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FiltrarMovimientosResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const { fecha, plataforma } = req.query;
    
    // Validar parámetros requeridos
    if (!fecha || typeof fecha !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Fecha es requerida'
      });
    }

    if (!plataforma || typeof plataforma !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Plataforma es requerida'
      });
    }

    // Validar que la plataforma sea válida
    const plataformasValidas = ['airbnb', 'booking', 'pagina_web', 'directa'];
    if (!plataformasValidas.includes(plataforma)) {
      return res.status(400).json({
        success: false,
        message: 'Plataforma no válida. Valores permitidos: ' + plataformasValidas.join(', ')
      });
    }

    // Extraer token y empresa_id
    const token = extractTokenFromRequest(req);
    const empresaId = getEmpresaIdFromToken(token);

    // Llamar a la API externa usando el endpoint específico
    const endpoint = `/movimientos/filtrar-por-plataforma?fecha=${fecha}&plataforma=${plataforma}&empresa_id=${empresaId}`;
    const externalResponse = await externalApiServerFetch(endpoint, {
      method: 'GET'
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al filtrar movimientos por plataforma',
        error: externalResponse.error
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: externalResponse.data,
      message: 'Movimientos filtrados exitosamente'
    });

  } catch (error) {
    console.error('Error en API filtrar movimientos por plataforma:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}