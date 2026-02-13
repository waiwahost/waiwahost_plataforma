import { MovimientosRepository } from '../../repositories/movimientos.repository';
import { Movimiento } from '../../interfaces/movimiento.interface';
import { isPlataformaValida } from '../../constants/plataformas';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener movimientos por fecha y empresa
 */
export async function getMovimientosFechaService(
  empresaId: string | null | undefined,
  fecha: string,
  plataformaOrigen?: string
): Promise<ServiceResponse<Movimiento[]>> {
  try {
    // Validar plataforma si se especifica
    if (plataformaOrigen && !isPlataformaValida(plataformaOrigen)) {
      return {
        data: null,
        error: {
          message: 'Plataforma de origen inválida',
          status: 400,
          details: 'La plataforma especificada no es válida'
        }
      };
    }

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
    const movimientos = await MovimientosRepository.getMovimientosByFecha(fecha, empresaIdParam, plataformaOrigen);


    // Movimientos solo TIPO= ingreso&egreso
    const movimientosFiltrados = movimientos.filter(movimiento => movimiento.tipo === 'ingreso' || movimiento.tipo === 'egreso' || movimiento.tipo === 'deducible');
    
    return {
      data: movimientosFiltrados,
      error: null
    };

  } catch (error) {
    console.error('Error en getMovimientosFechaService:', error);
    return {
      data: null,
      error: {
        message: 'Error al obtener movimientos',
        status: 500,
        details: error
      }
    };
  }
}
