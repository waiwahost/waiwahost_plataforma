import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

interface ReportePlataformaData {
  [plataforma: string]: {
    total_ingresos: number;
    cantidad_reservas: number;
  };
}

interface ReportePlataformaResponse {
  success: boolean;
  data?: ReportePlataformaData;
  message: string;
  error?: string;
}

/**
 * API Interna: Reporte de ingresos por plataforma
 * GET /api/reportes/porPlataforma?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReportePlataformaResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    // Validar parámetros requeridos
    if (!fecha_inicio || typeof fecha_inicio !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Fecha de inicio es requerida'
      });
    }

    if (!fecha_fin || typeof fecha_fin !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Fecha de fin es requerida'
      });
    }

    // Validar formato de fechas
    const fechaInicioDate = new Date(fecha_inicio);
    const fechaFinDate = new Date(fecha_fin);
    
    if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    if (fechaFinDate < fechaInicioDate) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      });
    }

    // Extraer token y empresa_id
    const token = extractTokenFromRequest(req);
    const empresaId = getEmpresaIdFromToken(token);

    // Llamar a la API externa
    const endpoint = `/reportes/por-plataforma?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}&empresa_id=${empresaId}`;
    const externalResponse = await externalApiServerFetch(endpoint, {
      method: 'GET'
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al generar reporte por plataforma',
        error: externalResponse.error
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: externalResponse.data,
      message: 'Reporte por plataforma generado exitosamente'
    });

  } catch (error) {
    console.error('Error en API reporte por plataforma:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}