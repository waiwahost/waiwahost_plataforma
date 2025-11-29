import { MovimientosRepository } from '../../repositories/movimientos.repository';
import { ResumenDiario } from '../../interfaces/movimiento.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener resumen diario por fecha y empresa
 */
export async function getResumenDiarioService(
  empresaId: string | null | undefined,
  fecha: string
): Promise<ServiceResponse<ResumenDiario>> {
  try {
    // Si empresaId está definido y no es vacío, validar existencia
    if (empresaId && empresaId !== '' && empresaId !== 'null') {
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

    // Si empresaId es null, undefined o vacío, pasar undefined al repositorio para no filtrar por empresa
    const empresaIdParam = (empresaId && empresaId !== '' && empresaId !== 'null') ? empresaId : undefined;
    const resumen = await MovimientosRepository.getResumenDiario(fecha, empresaIdParam);

    return {
      data: resumen,
      error: null
    };

  } catch (error) {
    console.error('Error en getResumenDiarioService:', error);
    return {
      data: null,
      error: {
        message: 'Error al obtener resumen diario',
        status: 500,
        details: error
      }
    };
  }
}