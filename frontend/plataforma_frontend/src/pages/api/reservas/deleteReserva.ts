import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Valida el ID de la reserva
 */
const validateReservaId = (id: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!id) {
    errors.push('El ID de la reserva es requerido');
  }

  const numericId = parseInt(id as string);
  if (isNaN(numericId) || numericId <= 0) {
    errors.push('El ID de la reserva debe ser un número válido mayor a 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Elimina una reserva existente
 * @param req - Request object
 * @param res - Response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false,
      message: 'Método no permitido' 
    });
  }

  try {
    const { id } = req.query;

    // Validar ID
    const validation = validateReservaId(id);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de reserva inválido',
        errors: validation.errors
      });
    }

    const reservaId = parseInt(id as string);

    // Llamada real a la API externa para eliminar la reserva
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    try {
      const response = await fetch(`${apiUrl}/reservas/${reservaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('response', response);

      if (response.status === 404) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Reserva no encontrada'
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(400).json({
          success: false,
          data: null,
          message: errorData.message || 'No se pudo eliminar la reserva'
        });
      }

      console.log('🗑️ Reserva eliminada exitosamente, ID:', reservaId);
      res.status(200).json({
        success: true,
        data: { id: reservaId },
        message: 'Reserva eliminada exitosamente'
      });
    } catch (apiError) {
      console.error('❌ Error al eliminar reserva en API externa:', apiError);
      res.status(500).json({
        success: false,
        data: null,
        message: apiError instanceof Error ? apiError.message : 'Error interno del servidor'
      });
    }

  } catch (error) {
    console.error('❌ Error in deleteReserva API:', error);
    
    res.status(500).json({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
