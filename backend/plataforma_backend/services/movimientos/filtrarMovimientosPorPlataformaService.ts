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
 * Servicio para filtrar movimientos por plataforma y fecha
 */
export async function filtrarMovimientosPorPlataformaService(
  fecha: string,
  plataforma: string,
  empresaId: string
): Promise<ServiceResponse<Movimiento[]>> {
  try {
    // Validar plataforma
    if (!isPlataformaValida(plataforma)) {
      return {
        data: null,
        error: {
          message: 'Plataforma de origen inválida',
          status: 400,
          details: 'La plataforma especificada no es válida'
        }
      };
    }

    // Verificar que la empresa existe
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

    // Obtener movimientos filtrados por plataforma
    const movimientos = await MovimientosRepository.getMovimientosByFecha(fecha, empresaId, plataforma);

    return {
      data: movimientos,
      error: null
    };

  } catch (error) {
    console.error('Error en filtrarMovimientosPorPlataformaService:', error);
    return {
      data: null,
      error: {
        message: 'Error al filtrar movimientos por plataforma',
        status: 500,
        details: error
      }
    };
  }
}