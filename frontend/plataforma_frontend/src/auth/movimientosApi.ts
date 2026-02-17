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
    // Construir URL con parámetros de consulta
    let url = `/api/movimientos/getMovimientosByFecha?fecha=${fecha}`;
    if (plataformaOrigen) {
      url += `&plataforma_origen=${plataformaOrigen}`;
    }

    const data = await apiFetch(url, {
      method: 'GET',
    });

    // apiFetch devuelve la data directamente, pero la interfaz espera { success, data }
    // Ajustamos para devolver la estructura esperada por el frontend
    return {
      success: true,
      data: data,
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
 * Obtiene resumen diario
 * Conectado a la API externa a través de API interna
 */
export const getResumenDiario = async (fecha: string): Promise<{ success: boolean; data?: IResumenDiario; message: string; error?: string }> => {
  try {
    const data = await apiFetch(
      `/api/movimientos/getResumenDiario?fecha=${fecha}`,
      {
        method: 'GET',
      }
    );

    return {
      success: true,
      data: data,
      message: 'Resumen diario obtenido exitosamente'
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
 * Crea un movimiento
 * Conectado a la API externa a través de API interna
 */
export const createMovimiento = async (movimientoData: IMovimientoForm): Promise<IMovimientoApiResponse> => {
  try {
    const data = await apiFetch('/api/movimientos/createMovimiento', {
      method: 'POST',
      body: JSON.stringify(movimientoData),
    });

    return {
      success: true,
      data: data,
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
 * Actualiza un movimiento
 * Conectado a la API externa a través de API interna
 */
export const updateMovimiento = async (id: string, movimientoData: Partial<IMovimientoForm>): Promise<IMovimientoApiResponse> => {
  try {
    const data = await apiFetch(`/api/movimientos/updateMovimiento?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(movimientoData),
    });
    return {
      success: true,
      data: data,
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
 * Elimina un movimiento
 * Conectado a la API externa a través de API interna
 */
export const deleteMovimiento = async (id: string): Promise<IMovimientoApiResponse> => {
  try {
    const data = await apiFetch(`/api/movimientos/deleteMovimiento?id=${id}`, {
      method: 'DELETE',
    });
    return {
      success: true,
      data: { id } as any,
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
 * Filtra movimientos por plataforma de origen específica
 * Conectado a la API externa a través de API interna
 */
export const filtrarMovimientosPorPlataforma = async (fecha: string, plataforma: string): Promise<IMovimientoApiResponse> => {
  try {
    const data = await apiFetch(
      `/api/movimientos/filtrarPorPlataforma?fecha=${fecha}&plataforma=${plataforma}`,
      {
        method: 'GET',
      }
    );

    return {
      success: true,
      data: data,
      message: 'Movimientos filtrados exitosamente'
    };

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
    const data = await apiFetch(`/api/movimientos/getMovimientoById?id=${id}`, {
      method: 'GET',
    });

    return {
      success: true,
      data: data,
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

/**
 * Exporta movimientos a Excel filtrados
 * Realiza la descarga directa del archivo
 */
export const exportMovimientosToExcel = async (filters: {
  fecha_inicio: string;
  fecha_fin: string;
  id_inmueble?: string;
  tipo?: string;
}): Promise<void> => {
  try {
    const queryParams = new URLSearchParams({
      fecha_inicio: filters.fecha_inicio,
      fecha_fin: filters.fecha_fin
    });

    if (filters.id_inmueble) queryParams.append('id_inmueble', filters.id_inmueble);
    if (filters.tipo && filters.tipo !== 'todos') queryParams.append('tipo', filters.tipo);

    const url = `/api/movimientos/exportExcel?${queryParams.toString()}`;

    // Obtener token para la petición
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Realizar la petición
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al generar el reporte de Excel', { cause: response.statusText });
    }

    // Obtener el blob
    const blob = await response.blob();

    // Crear un link temporal para la descarga
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    // El nombre del archivo lo da el header Content-Disposition si es posible, 
    // si no ponemos uno por defecto
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `Reporte_Caja_${new Date().toISOString().split('T')[0]}.xlsx`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename=(.+)/);
      if (match && match[1]) fileName = match[1];
    }

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    // Limpieza
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

  } catch (error) {
    console.error('❌ Error al exportar movimientos a Excel:', error);
    throw error;
  }
};