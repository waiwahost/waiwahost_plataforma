import { apiFetch } from './apiFetch';
import { PlataformaOrigen } from '../constants/plataformas';
import { IReporteConfig } from '../interfaces/Reporte';

/**
 * ========================================
 * FUNCIONES DE REPORTES POR PLATAFORMA
 * ========================================
 */

export interface IReportePlataformaData {
  [plataforma: string]: {
    total_ingresos: number;
    cantidad_reservas: number;
  };
}

export interface IReportePlataformaResponse {
  success: boolean;
  data?: IReportePlataformaData;
  message: string;
  error?: string;
}

export const getReportePorPlataforma = async (
  fechaInicio: string,
  fechaFin: string
): Promise<IReportePlataformaResponse> => {
  try {
    const data = await apiFetch(
      `/api/reportes/por-plataforma?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
      { method: 'GET' }
    );

    return {
      success: true,
      data: data,
      message: 'Reporte por plataforma obtenido exitosamente'
    };
  } catch (error) {
    console.error('❌ Error al obtener reporte por plataforma:', error);
    return {
      success: false,
      message: 'Error al obtener reporte por plataforma',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

export const getResumenPlataforma = async (
  fechaInicio: string,
  fechaFin: string,
  plataforma: PlataformaOrigen
): Promise<{ success: boolean; data?: { total_ingresos: number; cantidad_reservas: number }; message: string; error?: string }> => {
  try {
    const reporteCompleto = await getReportePorPlataforma(fechaInicio, fechaFin);

    if (!reporteCompleto.success || !reporteCompleto.data) {
      return {
        success: false,
        message: reporteCompleto.message,
        error: reporteCompleto.error
      };
    }

    const dataPlataforma = reporteCompleto.data[plataforma];

    if (!dataPlataforma) {
      return {
        success: true,
        data: { total_ingresos: 0, cantidad_reservas: 0 },
        message: `No se encontraron datos para la plataforma ${plataforma}`
      };
    }

    return {
      success: true,
      data: dataPlataforma,
      message: `Resumen de ${plataforma} obtenido exitosamente`
    };
  } catch (error) {
    console.error('❌ Error al obtener resumen de plataforma:', error);
    return {
      success: false,
      message: 'Error al obtener resumen de plataforma',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Placeholders for future implementation or unused functions
export const getResumenRapido = async (
  tipo: 'empresa' | 'inmueble' | 'propietario',
  id: string,
  año: number,
  mes: number
): Promise<any | null> => {
  return null; // Placeholder
};

export const getComparacionMensual = async (
  tipo: 'empresa' | 'inmueble' | 'propietario',
  id: string,
  año: number
): Promise<any | null> => {
  return null; // Placeholder
};

export const getTendenciasAnuales = async (
  tipo: 'empresa' | 'inmueble' | 'propietario',
  id: string,
  años: number[]
): Promise<any | null> => {
  return null; // Placeholder
};

export const descargarReportePDF = async (config: IReporteConfig): Promise<string | null> => {
  return null; // Placeholder
};

export const descargarReporteExcel = async (config: IReporteConfig): Promise<string | null> => {
  return null; // Placeholder
};