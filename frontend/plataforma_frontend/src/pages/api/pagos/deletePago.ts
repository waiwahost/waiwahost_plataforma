import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

interface DeletePagoResponse {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}

/**
 * Valida el ID del pago
 */
const validatePagoId = (id: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!id) {
    errors.push('ID de pago es requerido');
  } else if (isNaN(parseInt(id as string))) {
    errors.push('ID de pago debe ser un número válido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * API Interna: Eliminar pago
 * DELETE /api/pagos/deletePago?id=123
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<DeletePagoResponse>) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const { id } = req.query;

    const validation = validatePagoId(id);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'ID de pago inválido',
        error: validation.errors.join(', ')
      });
    }

    const pagoId = parseInt(id as string);
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    // Extraer token y empresa_id
    const token = extractTokenFromRequest(req);
    const empresaId = getEmpresaIdFromToken(token);

    // Eliminar pago en la API externa
    const endpoint = `${apiUrl}/v1/pagos/${pagoId}?empresa_id=${empresaId}`;

    const externalResponse = await externalApiServerFetch(endpoint, {
      method: 'DELETE',
      headers: {
        // No incluir Content-Type para DELETE sin body
      }
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al eliminar pago',
        error: externalResponse.error
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      message: 'Pago eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en API proxy eliminar pago:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}