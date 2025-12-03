import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

interface PagosDetalleResponse {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}

interface ExternalApiResponse {
  success: boolean;
  data: any;
  message?: string;
  error?: any;
}


/**
 * API Interna: Obtener pagos de una reserva para el modal de detalle
 * GET /api/reservas/pagos-detalle?id_reserva=123
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<PagosDetalleResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const { id_reserva } = req.query;

    // Validar ID de reserva
    if (!id_reserva || typeof id_reserva !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de reserva es requerido'
      });
    }

    // Extraer token y empresa_id
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const empresaId = getEmpresaIdFromToken(token);

    // Obtener pagos de una reserva para detalle
    //const endpoint = `/api/v1/pagos/reserva/${id_reserva}?empresa_id=${empresaId}`;

    //const externalResponse = await externalApiServerFetch(endpoint, {
    //  method: 'GET'
    //}, token);

    // Verificar si la respuesta externa es exitosa
    const response = await fetch(`${apiUrl}/pagos/reserva/${id_reserva}?empresa_id=${empresaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }


    // Respuesta exitosa - adaptamos la estructura del backend
    const externalData: ExternalApiResponse = await response.json();

    // Verificar si la API externa retornó error
    if (!externalData.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: externalData.message || 'Error desde la API externa',
        error: JSON.stringify(externalData.error)
      });
    }
    return res.status(200).json({
      success: true,
      data: externalData.data?.pagos || [], // El backend devuelve {pagos: [], resumen: {}}
      message: 'Pagos obtenidos exitosamente para detalle'
    });

  } catch (error) {
    console.error('Error en API pagos detalle:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}