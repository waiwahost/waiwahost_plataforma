/**
 * API de Movimientos Financieros - Integración con API Externa
 * Este archivo reemplaza las funciones mockeadas de movimientosApi.ts
 * conectándose directamente con el backend externo real
 */

import { IMovimiento, IMovimientoForm, IMovimientoApiResponse, IResumenDiario } from '../interfaces/Movimiento';
import { externalApiFetch, getEmpresaIdFromContext, buildQueryParams } from './externalApiFetch';
import { EXTERNAL_API_ENDPOINTS } from './externalApiConfig';

// Interfaces específicas para respuestas de la API externa
interface ExternalMovimientosResponse {
  isError: boolean;
  data: IMovimiento[];
  code: number;
  timestamp: string;
  message?: string;
  error?: string;
}

interface ExternalMovimientoResponse {
  isError: boolean;
  data: IMovimiento;
  code: number;
  timestamp: string;
  message?: string;
  error?: string;
}

interface ExternalResumenResponse {
  isError: boolean;
  data: IResumenDiario;
  code: number;
  timestamp: string;
  message?: string;
  error?: string;
}

interface ExternalMovimientosInmuebleResponse {
  isError: boolean;
  data: {
    ingresos: number;
    egresos: number;
    movimientos: IMovimiento[];
  };
  code: number;
  timestamp: string;
  message?: string;
  error?: string;
}

/**
 * Obtiene movimientos por fecha desde la API externa
 * Reemplaza la función mockeada getMovimientosByFecha
 */
export const getMovimientosByFechaExternal = async (fecha: string): Promise<IMovimientoApiResponse> => {
  try {
    const empresaId = getEmpresaIdFromContext();
    const queryParams = buildQueryParams({ empresa_id: empresaId });
    const url = `${EXTERNAL_API_ENDPOINTS.MOVIMIENTOS.BY_FECHA(fecha)}${queryParams}`;

    const response: ExternalMovimientosResponse = await externalApiFetch(url, {
      method: 'GET',
    });

    return {
      success: true,
      data: response.data,
      message: 'Movimientos obtenidos exitosamente'
    };

  } catch (error) {
    console.error('❌ Error al obtener movimientos por fecha:', error);
    return {
      success: false,
      message: 'Error al obtener movimientos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Obtiene resumen diario desde la API externa
 * Reemplaza la función mockeada getResumenDiario
 */
export const getResumenDiarioExternal = async (fecha: string): Promise<{ success: boolean; data?: IResumenDiario; message: string; error?: string }> => {
  try {
    const empresaId = getEmpresaIdFromContext();
    const queryParams = buildQueryParams({ empresa_id: empresaId });
    const url = `${EXTERNAL_API_ENDPOINTS.MOVIMIENTOS.RESUMEN(fecha)}${queryParams}`;

    const response: ExternalResumenResponse = await externalApiFetch(url, {
      method: 'GET',
    });

    return {
      success: true,
      data: response.data,
      message: 'Resumen obtenido exitosamente'
    };

  } catch (error) {
    console.error('❌ Error al obtener resumen diario:', error);
    return {
      success: false,
      message: 'Error al obtener resumen',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Obtiene movimientos por inmueble y fecha desde la API externa
 * Nueva función para el modal de inmuebles
 */
export const getMovimientosByInmuebleExternal = async (
  idInmueble: string,
  fecha: string
): Promise<{ ingresos: number; egresos: number; movimientos: IMovimiento[] }> => {
  try {
    const queryParams = buildQueryParams({
      id_inmueble: idInmueble,
      fecha: fecha
    });
    const url = `${EXTERNAL_API_ENDPOINTS.MOVIMIENTOS.BY_INMUEBLE}${queryParams}`;

    const response: ExternalMovimientosInmuebleResponse = await externalApiFetch(url, {
      method: 'GET',
    });

    return response.data;

  } catch (error) {
    console.error('❌ Error al obtener movimientos por inmueble:', error);
    throw error instanceof Error ? error : new Error('Error al obtener movimientos del inmueble');
  }
};

/**
 * Crea un movimiento en la API externa
 * Reemplaza la función mockeada createMovimiento
 */
export const createMovimientoExternal = async (movimientoData: IMovimientoForm): Promise<IMovimientoApiResponse> => {
  try {
    // Agregar empresa_id al payload
    const payload = {
      ...movimientoData,
      id_empresa: getEmpresaIdFromContext()
    };

    const response: ExternalMovimientoResponse = await externalApiFetch(EXTERNAL_API_ENDPOINTS.MOVIMIENTOS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      data: response.data,
      message: 'Movimiento creado exitosamente'
    };

  } catch (error) {
    console.error('❌ Error al crear movimiento:', error);
    return {
      success: false,
      message: 'Error al crear movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Actualiza un movimiento en la API externa
 * Reemplaza la función mockeada updateMovimiento
 */
export const updateMovimientoExternal = async (id: string, movimientoData: Partial<IMovimientoForm>): Promise<IMovimientoApiResponse> => {
  try {
    const response: ExternalMovimientoResponse = await externalApiFetch(EXTERNAL_API_ENDPOINTS.MOVIMIENTOS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(movimientoData),
    });

    return {
      success: true,
      data: response.data,
      message: 'Movimiento actualizado exitosamente'
    };

  } catch (error) {
    console.error('❌ Error al actualizar movimiento:', error);
    return {
      success: false,
      message: 'Error al actualizar movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Elimina un movimiento en la API externa
 * Reemplaza la función mockeada deleteMovimiento
 */
export const deleteMovimientoExternal = async (id: string): Promise<IMovimientoApiResponse> => {
  try {
    await externalApiFetch(EXTERNAL_API_ENDPOINTS.MOVIMIENTOS.DELETE(id), {
      method: 'DELETE',
    });

    return {
      success: true,
      message: 'Movimiento eliminado exitosamente'
    };

  } catch (error) {
    console.error('❌ Error al eliminar movimiento:', error);
    return {
      success: false,
      message: 'Error al eliminar movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Obtiene un movimiento por ID desde la API externa
 * Reemplaza la función mockeada getMovimientoById
 */
export const getMovimientoByIdExternal = async (id: string): Promise<IMovimientoApiResponse> => {
  try {
    const response: ExternalMovimientoResponse = await externalApiFetch(EXTERNAL_API_ENDPOINTS.MOVIMIENTOS.BY_ID(id), {
      method: 'GET',
    });

    return {
      success: true,
      data: response.data,
      message: 'Movimiento obtenido exitosamente'
    };

  } catch (error) {
    console.error('❌ Error al obtener movimiento por ID:', error);
    return {
      success: false,
      message: 'Error al obtener movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};