import type { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

interface EgresosResponse {
  success: boolean;
  data?: any[];
  message: string;
  error?: string;
}

/**
 * API Interna: Obtener egresos por filtros
 * GET /api/egresos/getEgresos?fecha=2025-10-12&id_inmueble=123
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EgresosResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const { fecha, id_inmueble } = req.query;

    // Validar parámetros
    if (!fecha || typeof fecha !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Fecha es requerida'
      });
    }

    // Extraer token y empresa_id (EXACTAMENTE igual que movimientos)
    const token = extractTokenFromRequest(req);

    if (!token) {
      console.error('❌ NO SE ENCONTRÓ TOKEN en headers');
      return res.status(401).json({
        success: false,
        message: 'Token de autorización requerido'
      });
    }

    const empresaId = getEmpresaIdFromToken(token);


    // Construir endpoint EXACTAMENTE como movimientos
    let endpoint = `/egresos?fecha=${fecha}&empresa_id=${empresaId}`;

    // Agregar filtro por inmueble si está presente
    if (id_inmueble && typeof id_inmueble === 'string') {
      endpoint += `&id_inmueble=${id_inmueble}`;
    }

    // Llamar a la API externa
    const externalResponse = await externalApiServerFetch(endpoint, {
      method: 'GET'
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al obtener egresos',
        error: externalResponse.error
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: externalResponse.data || [],
      message: 'Egresos obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error en API egresos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}