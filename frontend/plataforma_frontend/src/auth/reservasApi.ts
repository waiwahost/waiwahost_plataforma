import { apiFetch } from './apiFetch';
import { IReservaForm, IReservaTableData } from '../interfaces/Reserva';

/**
 * Respuesta estándar de las APIs de reservas
 */
interface ReservaApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

/**
 * Parámetros de filtrado para reservas
 */
export interface ReservasFilters {
  estado?: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
  id_empresa?: number;
  id_inmueble?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

/**
 * Obtiene todas las reservas con filtros opcionales
 */
export const getReservasApi = async (filters?: ReservasFilters): Promise<IReservaTableData[]> => {
  try {
    // Construir URL con parámetros de query
    let url = '/api/reservas/getReservas';
    const queryParams = new URLSearchParams();

    if (filters) {
      if (filters.estado) {
        queryParams.append('estado', filters.estado);
      }
      if (filters.id_empresa) {
        queryParams.append('id_empresa', filters.id_empresa.toString());
      }
      if (filters.id_inmueble) {
        queryParams.append('id_inmueble', filters.id_inmueble.toString());
      }
      if (filters.fecha_inicio) {
        queryParams.append('fecha_inicio', filters.fecha_inicio);
      }
      if (filters.fecha_fin) {
        queryParams.append('fecha_fin', filters.fecha_fin);
      }
    }

    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const data = await apiFetch(url, {
      method: 'GET',
    });
    return data as IReservaTableData[];

  } catch (error) {
    console.error('❌ Error en getReservasApi:', error);
    throw error instanceof Error ? error : new Error('Error al obtener reservas');
  }
};

/**
 * Obtiene el detalle de una reserva específica
 */
export const getReservaDetalleApi = async (id: number): Promise<IReservaTableData> => {
  try {
    const data = await apiFetch(`/api/reservas/${id}`, {
      method: 'GET',
    });

    return data as IReservaTableData;

  } catch (error) {
    console.error('❌ Error en getReservaDetalleApi:', error);
    throw error instanceof Error ? error : new Error('Error al obtener detalle de reserva');
  }
};

/**
 * Crea una nueva reserva
 */
export const createReservaApi = async (reservaData: IReservaForm): Promise<IReservaTableData> => {
  try {
    const data = await apiFetch('/api/reservas', {
      method: 'POST',
      body: JSON.stringify(reservaData),
    });
    return data as IReservaTableData;

  } catch (error) {
    console.error('❌ Error en createReservaApi:', error);
    throw error instanceof Error ? error : new Error('Error al crear reserva');
  }
};

/**
 * Edita una reserva existente
 */
export const editReservaApi = async (reservaData: IReservaForm & { id: number; codigo_reserva?: string; fecha_creacion?: string; huespedes?: any[] }): Promise<IReservaTableData> => {
  try {
    const data = await apiFetch(`/api/reservas/${reservaData.id}`, {
      method: 'PUT',
      body: JSON.stringify(reservaData),
    });

    return data as IReservaTableData;

  } catch (error) {
    console.error('❌ Error en editReservaApi:', error);
    throw error instanceof Error ? error : new Error('Error al editar reserva');
  }
};

/**
 * Elimina una reserva
 */
export const deleteReservaApi = async (id: number): Promise<{ id: number }> => {
  try {
    const data = await apiFetch(`/api/reservas/${id}`, {
      method: 'DELETE',
    });

    return data as { id: number };

  } catch (error) {
    console.error('❌ Error en deleteReservaApi:', error);
    throw error instanceof Error ? error : new Error('Error al eliminar reserva');
  }
};

/**
 * Exporta reservas a Excel filtradas
 * Realiza la descarga directa del archivo
 */
export const exportReservasToExcel = async (filters: {
  fecha_inicio: string;
  fecha_fin: string;
  id_inmueble?: string;
  estado?: string;
  plataforma_origen?: string;
}): Promise<void> => {
  try {
    const queryParams = new URLSearchParams({
      fecha_inicio: filters.fecha_inicio,
      fecha_fin: filters.fecha_fin
    });

    if (filters.id_inmueble) queryParams.append('id_inmueble', filters.id_inmueble);
    if (filters.estado && filters.estado !== 'todas') queryParams.append('estado', filters.estado);
    if (filters.plataforma_origen && filters.plataforma_origen !== 'todas') queryParams.append('plataforma_origen', filters.plataforma_origen);

    const url = `/api/reservas/exportExcel?${queryParams.toString()}`;

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
    let fileName = `Reporte_Reservas_${new Date().toISOString().split('T')[0]}.xlsx`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename=(.+)/);
      if (match && match[1]) fileName = match[1].replace(/['"]/g, ''); // Limpiar comillas si existen
    }

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    // Limpieza
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

  } catch (error) {
    console.error('❌ Error al exportar reservas a Excel:', error);
    throw error;
  }
};
