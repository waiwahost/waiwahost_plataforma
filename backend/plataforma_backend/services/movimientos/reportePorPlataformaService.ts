import { MovimientosRepository } from '../../repositories/movimientos.repository';
import { PLATAFORMAS_ORIGEN, PlataformaOrigen } from '../../constants/plataformas';

interface ReportePorPlataforma {
  [key: string]: {
    total_ingresos: number;
    cantidad_reservas: number;
  };
}

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para generar reporte de ingresos por plataforma
 */
export async function reportePorPlataformaService(
  fechaInicio: string,
  fechaFin: string,
  empresaId: string
): Promise<ServiceResponse<ReportePorPlataforma>> {
  try {
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

    // Obtener reporte por plataforma
    const reporte = await MovimientosRepository.getReportePorPlataforma(fechaInicio, fechaFin, empresaId);

    return {
      data: reporte,
      error: null
    };

  } catch (error) {
    console.error('Error en reportePorPlataformaService:', error);
    return {
      data: null,
      error: {
        message: 'Error al generar reporte por plataforma',
        status: 500,
        details: error
      }
    };
  }
}