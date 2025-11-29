import { MovimientosRepository } from '../../repositories/movimientos.repository';
import { EditMovimientoData, Movimiento, isConceptoValido } from '../../interfaces/movimiento.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para actualizar un movimiento
 */
export async function editMovimientoService(
  id: string,
  data: EditMovimientoData
): Promise<ServiceResponse<Movimiento>> {
  try {
    // Verificar que el movimiento existe
    let movimientoActual: Movimiento;
    try {
      movimientoActual = await MovimientosRepository.getMovimientoById(id);
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

    // Validar concepto según tipo si se especifican ambos
    if (data.tipo && data.concepto) {
      if (!isConceptoValido(data.tipo, data.concepto)) {
        return {
          data: null,
          error: {
            message: 'Concepto inválido',
            status: 400,
            details: `El concepto '${data.concepto}' no es válido para el tipo '${data.tipo}'`
          }
        };
      }
    }

    // Si se cambia el inmueble, verificar que existe y pertenece a la empresa
    if (data.id_inmueble) {
      const inmuebleExists = await MovimientosRepository.existsInmuebleInEmpresa(
        data.id_inmueble, 
        movimientoActual.id_empresa
      );
      if (!inmuebleExists) {
        return {
          data: null,
          error: {
            message: 'Inmueble no encontrado',
            status: 404,
            details: 'El inmueble especificado no existe o no pertenece a la empresa'
          }
        };
      }
    }

    // Si se especifica reserva, verificar que existe y pertenece a la empresa
    if (data.id_reserva) {
      const reservaExists = await MovimientosRepository.existsReservaInEmpresa(
        data.id_reserva, 
        movimientoActual.id_empresa
      );
      if (!reservaExists) {
        return {
          data: null,
          error: {
            message: 'Reserva no encontrada',
            status: 404,
            details: 'La reserva especificada no existe o no pertenece a la empresa'
          }
        };
      }
    }

    // Actualizar el movimiento
    const movimientoActualizado = await MovimientosRepository.updateMovimiento(id, data);

    return {
      data: movimientoActualizado,
      error: null
    };

  } catch (error) {
    console.error('Error en editMovimientoService:', error);
    return {
      data: null,
      error: {
        message: 'Error al actualizar movimiento',
        status: 500,
        details: error
      }
    };
  }
}