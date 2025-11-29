import { MovimientosRepository } from '../../repositories/movimientos.repository';
import { InmuebleSelector } from '../../interfaces/movimiento.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener inmuebles para selector
 */
export async function getInmueblesSelectorsService(
  empresaId?: string | null
): Promise<ServiceResponse<InmuebleSelector[]>> {
  try {
    // Verificar que la empresa existe si se proporciona un ID
    if (empresaId) {
      const empresaExists = await MovimientosRepository.existsEmpresa(empresaId);
      if (!empresaExists) {
        return {
          data: null,
          error: {
            message: 'Empresa no encontrada',
            status: 404,
            details: 'La empresa especificada no existe'
          }
        };
      }
    }

    // Obtener inmuebles
    const inmuebles = await MovimientosRepository.getInmueblesSelector(empresaId);

    return {
      data: inmuebles,
      error: null
    };

  } catch (error) {
    console.error('Error en getInmueblesSelectorsService:', error);
    return {
      data: null,
      error: {
        message: 'Error al obtener inmuebles',
        status: 500,
        details: error
      }
    };
  }
}