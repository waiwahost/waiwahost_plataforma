import { MovimientosRepository } from '../../repositories/movimientos.repository';
import { Movimiento } from '../../interfaces/movimiento.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener un movimiento por ID
 */
export async function getMovimientoByIdService(
  id: string
): Promise<ServiceResponse<Movimiento>> {
  try {
    const movimiento = await MovimientosRepository.getMovimientoById(id);

    return {
      data: movimiento,
      error: null
    };

  } catch (error) {
    console.error('Error en getMovimientoByIdService:', error);
    
    // Si el error es que no se encontró el movimiento
    if (error instanceof Error && error.message === 'Movimiento no encontrado') {
      return {
        data: null,
        error: {
          message: 'Movimiento no encontrado',
          status: 404,
          details: 'El movimiento especificado no existe'
        }
      };
    }

    return {
      data: null,
      error: {
        message: 'Error al obtener movimiento',
        status: 500,
        details: error
      }
    };
  }
}