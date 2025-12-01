import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

interface PagosResponse {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}

/**
 * API Interna: Obtener pagos por reserva o crear nuevo pago
 * GET /api/pagos/[id_reserva] - Obtener pagos de una reserva
 * POST /api/pagos/[id_reserva] - Crear nuevo pago en una reserva
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PagosResponse>
) {
  try {
    const { id_reserva } = req.query;

    // Validar ID de reserva
    if (!id_reserva || typeof id_reserva !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de reserva es requerido'
      });
    }
    const apiUrl = process.env.API_URL || 'http://localhost:3001';

    // Extraer token y empresa_id
    const token = extractTokenFromRequest(req);
    const empresaId = getEmpresaIdFromToken(token);

    if (req.method === 'GET') {
      // Obtener pagos de una reserva
      const endpoint = `${apiUrl}/v1/pagos/reserva/${id_reserva}?empresa_id=${empresaId}`;

      const externalResponse = await externalApiServerFetch(endpoint, {
        method: 'GET'
      }, token);

      // Verificar si la respuesta externa es exitosa
      if (externalResponse.isError) {
        console.error('❌ Error backend al obtener pagos:', externalResponse);
        return res.status(400).json({
          success: false,
          message: externalResponse.message || 'Error al obtener pagos',
          error: externalResponse.error
        });
      }

      // Respuesta exitosa - adaptamos la estructura del backend
      return res.status(200).json({
        success: true,
        data: externalResponse.data?.pagos || [], // El backend devuelve {pagos: [], resumen: {}}
        message: 'Pagos obtenidos exitosamente'
      });

    } else if (req.method === 'POST') {
      // Crear nuevo pago
      const pagoData = req.body;

      // Validaciones básicas
      if (!pagoData.monto || pagoData.monto <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto debe ser mayor a 0'
        });
      }

      if (!pagoData.metodo_pago) {
        return res.status(400).json({
          success: false,
          message: 'Método de pago es requerido'
        });
      }

      // Preparar payload para el backend
      const payload = {
        id_reserva: parseInt(id_reserva),
        ...pagoData,
        id_empresa: parseInt(empresaId),
        concepto: pagoData.concepto || 'Pago de reserva',
        fecha_pago: pagoData.fecha_pago || new Date().toISOString().split('T')[0]
      };

      const endpoint = `${apiUrl}/v1/pagos`;

      const externalResponse = await externalApiServerFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      }, token);

      // Verificar si la respuesta externa es exitosa
      if (externalResponse.isError) {
        return res.status(400).json({
          success: false,
          message: externalResponse.message || 'Error al crear pago',
          error: externalResponse.error
        });
      }

      // Respuesta exitosa
      return res.status(201).json({
        success: true,
        data: externalResponse.data?.pago || externalResponse.data, // Adaptamos la estructura
        message: 'Pago registrado exitosamente'
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'Método no permitido'
      });
    }

  } catch (error) {
    console.error('Error en API pagos por reserva:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}