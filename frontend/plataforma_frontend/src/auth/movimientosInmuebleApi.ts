/**
 * API de Movimientos por Inmueble - Conectado con Backend Externo
 * Este archivo conecta con la API externa a través de las APIs internas de Next.js
 */

import { IMovimiento } from '../interfaces/Movimiento';
import { apiFetch } from './apiFetch';

// Interfaz para la respuesta del API de movimientos por inmueble
interface MovimientosInmuebleResponse {
  success: boolean;
  data?: {
    ingresos: number;
    egresos: number;
    movimientos: IMovimiento[];
  };
  message: string;
  error?: string;
}

/**
 * Obtiene los movimientos de un inmueble para una fecha específica
 * Conectado a la API externa a través de API interna
 */
export const getMovimientosInmuebleApi = async (
  idInmueble: string,
  fecha: string
): Promise<{ ingresos: number; egresos: number; movimientos: IMovimiento[] }> => {
  try {
    console.log('🔄 Obteniendo movimientos para inmueble:', idInmueble, 'fecha:', fecha);

    const response = await apiFetch(
      `/api/inmuebles/movimientos?id_inmueble=${idInmueble}&fecha=${fecha}`,
      {
        method: 'GET',
      }
    );

    // apiFetch devuelve directamente la data si la respuesta es exitosa y tiene la propiedad data
    // Por lo tanto, response ya contiene { ingresos, egresos, movimientos }

    if (!response) {
      throw new Error('Error al obtener movimientos del inmueble');
    }

    // Si apiFetch devolvió el objeto completo porque falló algo (ej. success: false)
    if (response.success === false) {
      throw new Error(response.message || 'Error al obtener movimientos del inmueble');
    }

    const { ingresos, egresos, movimientos } = response;

    console.log('✅ Movimientos del inmueble obtenidos exitosamente:', {
      cantidad: movimientos?.length || 0,
      ingresos,
      egresos
    });

    return { ingresos, egresos, movimientos: movimientos || [] };

  } catch (error) {
    console.error('❌ Error en getMovimientosInmuebleApi:', error);
    throw error instanceof Error ? error : new Error('Error al obtener movimientos del inmueble');
  }
};

/**
 * Formatea fechas para el API (YYYY-MM-DD)
 */
export const formatDateForApi = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Obtiene los movimientos de hoy para un inmueble
 */
export const getMovimientosInmuebleHoyApi = async (
  idInmueble: string
): Promise<{ ingresos: number; egresos: number; movimientos: IMovimiento[] }> => {
  const hoy = formatDateForApi(new Date());
  return getMovimientosInmuebleApi(idInmueble, hoy);
};

/**
 * Calcula el balance total de movimientos
 */
export const calcularBalance = (ingresos: number, egresos: number): number => {
  return ingresos - egresos;
};