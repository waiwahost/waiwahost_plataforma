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
  fecha_inicio?: string;
  fecha_fin?: string;
}

/**
 * Obtiene todas las reservas con filtros opcionales
 */
export const getReservasApi = async (filters?: ReservasFilters): Promise<IReservaTableData[]> => {
  try {
    console.log('🔄 Llamando API getReservas...', filters ? 'con filtros:' : 'sin filtros', filters);

    // Construir URL con parámetros de query
    let url = '/api/reservas';
    const queryParams = new URLSearchParams();

    if (filters) {
      if (filters.estado) {
        queryParams.append('estado', filters.estado);
      }
      if (filters.id_empresa) {
        queryParams.append('id_empresa', filters.id_empresa.toString());
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

    const response: ReservaApiResponse<IReservaTableData[]> = await apiFetch(url, {
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al obtener reservas');
    }

    console.log('✅ Reservas obtenidas exitosamente:', response.data.length);
    return response.data;

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
    console.log('🔄 Llamando API getReservaDetalle para ID:', id);

    const response: ReservaApiResponse<IReservaTableData> = await apiFetch(`/api/reservas/${id}`, {
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al obtener detalle de reserva');
    }

    console.log('✅ Detalle de reserva obtenido exitosamente:', response.data.codigo_reserva);
    return response.data;

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
    console.log('🔄 Llamando API createReserva...');

    const response: ReservaApiResponse<IReservaTableData> = await apiFetch('/api/reservas', {
      method: 'POST',
      body: JSON.stringify(reservaData),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al crear reserva');
    }

    console.log('✅ Reserva creada exitosamente:', response.data.codigo_reserva);
    return response.data;

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
    console.log('🔄 Llamando API editReserva para ID:', reservaData.id);

    const response: ReservaApiResponse<IReservaTableData> = await apiFetch(`/api/reservas/${reservaData.id}`, {
      method: 'PUT',
      body: JSON.stringify(reservaData),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al editar reserva');
    }

    console.log('✅ Reserva editada exitosamente:', response.data.codigo_reserva);
    return response.data;

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
    console.log('🔄 Llamando API deleteReserva para ID:', id);

    const response: ReservaApiResponse<{ id: number }> = await apiFetch(`/api/reservas/${id}`, {
      method: 'DELETE',
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al eliminar reserva');
    }

    console.log('✅ Reserva eliminada exitosamente, ID:', response.data.id);
    return response.data;

  } catch (error) {
    console.error('❌ Error en deleteReservaApi:', error);
    throw error instanceof Error ? error : new Error('Error al eliminar reserva');
  }
};
