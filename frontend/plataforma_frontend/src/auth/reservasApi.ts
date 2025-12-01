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
    let url = '/api/reservas/getReservas';
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

    console.log('URL final:', url);
    const data = await apiFetch(url, {
      method: 'GET',
    });

    console.log('✅ Reservas obtenidas exitosamente:', Array.isArray(data) ? data.length : 'Data received');
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
    console.log('🔄 Llamando API getReservaDetalle para ID:', id);

    const data = await apiFetch(`/api/reservas/getReservaDetalle?id=${id}`, {
      method: 'GET',
    });

    console.log('✅ Detalle de reserva obtenido exitosamente:', (data as any).codigo_reserva);
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
    console.log('🔄 Llamando API createReserva...');

    const data = await apiFetch('/api/reservas/createReserva', {
      method: 'POST',
      body: JSON.stringify(reservaData),
    });

    console.log('✅ Reserva creada exitosamente:', (data as any).codigo_reserva);
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
    console.log('🔄 Llamando API editReserva para ID:', reservaData.id);

    const data = await apiFetch(`/api/reservas/editReserva/${reservaData.id}`, {
      method: 'PUT',
      body: JSON.stringify(reservaData),
    });

    console.log('✅ Reserva editada exitosamente:', (data as any).codigo_reserva);
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
    console.log('🔄 Llamando API deleteReserva para ID:', id);

    const data = await apiFetch(`/api/reservas/deleteReserva?id=${id}`, {
      method: 'DELETE',
    });

    console.log('✅ Reserva eliminada exitosamente, ID:', (data as any).id);
    return data as { id: number };

  } catch (error) {
    console.error('❌ Error en deleteReservaApi:', error);
    throw error instanceof Error ? error : new Error('Error al eliminar reserva');
  }
};
