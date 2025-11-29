import type { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

interface IngresosResponse {
  success: boolean;
  data?: any[];
  message: string;
  error?: string;
}

/**
 * API Interna: Obtener ingresos por filtros
 * GET /api/ingresos/getIngresos?fecha=2025-10-12&id_inmueble=123
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IngresosResponse>
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

    console.log('🔍 DEBUG INGRESOS:');
    console.log('  Token extraído:', token ? 'SÍ' : 'NO');
    console.log('  Empresa ID obtenido:', empresaId);
    console.log('  Tipo de empresaId:', typeof empresaId);

    // Construir endpoint EXACTAMENTE como movimientos
    let endpoint = `/ingresos?fecha=${fecha}&empresa_id=${empresaId}`;

    // Agregar filtro por inmueble si está presente
    if (id_inmueble && typeof id_inmueble === 'string') {
      endpoint += `&id_inmueble=${id_inmueble}`;
    }

    console.log('  Endpoint construido:', endpoint);

    // Llamar a la API externa
    const externalResponse = await externalApiServerFetch(endpoint, {
      method: 'GET'
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al obtener ingresos',
        error: externalResponse.error
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: externalResponse.data || [],
      message: 'Ingresos obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error en API ingresos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}