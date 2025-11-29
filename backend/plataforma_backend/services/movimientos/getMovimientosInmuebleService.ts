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
 * Servicio para obtener movimientos por inmueble y fecha
 */
export async function getMovimientosInmuebleService(
  idInmueble: string,
  fecha: string
): Promise<ServiceResponse<Movimiento[]>> {
  try {
    // Obtener movimientos
    const movimientos = await MovimientosRepository.getMovimientosByInmuebleFecha(idInmueble, fecha);

    return {
      data: movimientos,
      error: null
    };

  } catch (error) {
    console.error('Error en getMovimientosInmuebleService:', error);
    return {
      data: null,
      error: {
        message: 'Error al obtener movimientos del inmueble',
        status: 500,
        details: error
      }
    };
  }
}