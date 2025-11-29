import { MovimientosRepository } from '../../repositories/movimientos.repository';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para eliminar un movimiento
 */
export async function deleteMovimientoService(
  id: string
): Promise<ServiceResponse<{ message: string }>> {
  try {
    // Verificar que el movimiento existe antes de eliminarlo
    try {
      await MovimientosRepository.getMovimientoById(id);
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Movimiento no encontrado',
          status: 404,
          details: 'El movimiento especificado no existe'
        }
      };
    }

    // Eliminar el movimiento
    await MovimientosRepository.deleteMovimiento(id);

    return {
      data: { message: 'Movimiento eliminado exitosamente' },
      error: null
    };

  } catch (error) {
    console.error('Error en deleteMovimientoService:', error);
    return {
      data: null,
      error: {
        message: 'Error al eliminar movimiento',
        status: 500,
        details: error
      }
    };
  }
}