import { IMovimiento, IMovimientoForm, IMovimientoApiResponse, IResumenDiario } from '../interfaces/Movimiento';
import { apiFetch } from './apiFetch';

/**
 * API de Movimientos Financieros - Conectado con Backend Externo
 * Estas funciones llaman a las APIs internas de Next.js que se conectan con la API externa
 */

/**
 * Obtiene movimientos por fecha con filtro opcional por plataforma
 * Conectado a la API externa a través de API interna
 */
export const getMovimientosByFecha = async (fecha: string, plataformaOrigen?: string): Promise<IMovimientoApiResponse> => {
  try {
    console.log('🔄 Obteniendo movimientos por fecha:', fecha, plataformaOrigen ? `con filtro de plataforma: ${plataformaOrigen}` : 'sin filtro de plataforma');
    
    // Construir URL con parámetro opcional de plataforma
    let url = `/api/movimientos/getMovimientosByFecha?fecha=${fecha}`;
    if (plataformaOrigen) {
      url += `&plataforma_origen=${plataformaOrigen}`;
    }
    
    const response: IMovimientoApiResponse = await apiFetch(url, {
      method: 'GET',
    });

    console.log('✅ Movimientos por fecha obtenidos exitosamente:', Array.isArray(response.data) ? response.data.length : 1);
    return response;
    
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
 * Obtiene resumen diario
 * Conectado a la API externa a través de API interna
 */
export const getResumenDiario = async (fecha: string): Promise<{ success: boolean; data?: IResumenDiario; message: string; error?: string }> => {
  try {
    console.log('🔄 Obteniendo resumen diario:', fecha);
    
    const response: { success: boolean; data?: IResumenDiario; message: string; error?: string } = await apiFetch(
      `/api/movimientos/getResumenDiario?fecha=${fecha}`, 
      {
        method: 'GET',
      }
    );

    console.log('✅ Resumen diario obtenido exitosamente:', response.data);
    return response;
    
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
 * Crea un movimiento
 * Conectado a la API externa a través de API interna
 */
export const createMovimiento = async (movimientoData: IMovimientoForm): Promise<IMovimientoApiResponse> => {
  try {
    console.log('🔄 Creando movimiento:', movimientoData);
    
    const response: IMovimientoApiResponse = await apiFetch('/api/movimientos/createMovimiento', {
      method: 'POST',
      body: JSON.stringify(movimientoData),
    });

    console.log('✅ Movimiento creado exitosamente:', response.data);
    return response;
    
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
 * Actualiza un movimiento
 * Conectado a la API externa a través de API interna
 */
export const updateMovimiento = async (id: string, movimientoData: Partial<IMovimientoForm>): Promise<IMovimientoApiResponse> => {
  try {
    console.log('🔄 Actualizando movimiento:', { id, data: movimientoData });
    
    const response: IMovimientoApiResponse = await apiFetch(`/api/movimientos/updateMovimiento?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(movimientoData),
    });

    console.log('✅ Movimiento actualizado exitosamente:', response.data);
    return response;
    
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
 * Elimina un movimiento
 * Conectado a la API externa a través de API interna
 */
export const deleteMovimiento = async (id: string): Promise<IMovimientoApiResponse> => {
  try {
    console.log('🔄 Eliminando movimiento:', id);
    
    const response: IMovimientoApiResponse = await apiFetch(`/api/movimientos/deleteMovimiento?id=${id}`, {
      method: 'DELETE',
    });

    console.log('✅ Movimiento eliminado exitosamente:', id);
    return response;
    
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
 * Filtra movimientos por plataforma de origen específica
 * Conectado a la API externa a través de API interna
 */
export const filtrarMovimientosPorPlataforma = async (fecha: string, plataforma: string): Promise<IMovimientoApiResponse> => {
  try {
    console.log('🔄 Filtrando movimientos por plataforma:', { fecha, plataforma });
    
    const response: IMovimientoApiResponse = await apiFetch(
      `/api/movimientos/filtrarPorPlataforma?fecha=${fecha}&plataforma=${plataforma}`, 
      {
        method: 'GET',
      }
    );

    console.log('✅ Movimientos filtrados por plataforma exitosamente:', Array.isArray(response.data) ? response.data.length : 1);
    return response;
    
  } catch (error) {
    console.error('❌ Error al filtrar movimientos por plataforma:', error);
    return {
      success: false,
      message: 'Error al filtrar movimientos por plataforma',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Obtiene un movimiento por ID
 * Conectado a la API externa a través de API interna
 */
export const getMovimientoById = async (id: string): Promise<IMovimientoApiResponse> => {
  try {
    console.log('🔄 Obteniendo movimiento por ID:', id);
    
    const response: IMovimientoApiResponse = await apiFetch(`/api/movimientos/getMovimientoById?id=${id}`, {
      method: 'GET',
    });

    console.log('✅ Movimiento por ID obtenido exitosamente:', response.data);
    return response;
    
  } catch (error) {
    console.error('❌ Error al obtener movimiento por ID:', error);
    return {
      success: false,
      message: 'Error al obtener movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};