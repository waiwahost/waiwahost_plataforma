import { apiFetch } from './apiFetch';
import { ITarjetaResponseApi, IEstadoTarjetaResponseApi } from '../interfaces/Tarjeta';


/**
 * Obtiene todas las tarjetas con Id de una Reserva
 */
export const getTarjetaRegistroApi = async (idReserva: number): Promise<ITarjetaResponseApi> => {
    try {
        const response = await apiFetch(`/api/tarjeta-registro/${idReserva}`, {
            method: 'GET',
        });
        const data = response.data[0] as ITarjetaResponseApi;
        return data;
    } catch (error) {
        console.error('❌ Error en getTarjetaRegistroApi:', error);
        throw error instanceof Error ? error : new Error('Error al obtener tarjeta de registro');
    }
};

/**
 * Obtiene el estado de una tarjeta con Id de una Reserva
 */

// tarjetaRegistroApi.ts
export const getEstadoTarjetaApi = async (idReserva: number): Promise<IEstadoTarjetaResponseApi[]> => {
    try {
        const response = await apiFetch(`/api/tarjetas/${idReserva}`, {
            method: 'GET',
        });
        
        // El proxy de Next.js que hicimos arriba devuelve { success, data, message }
        // apiFetch ya extrae el primer nivel, así que 'response' es el objeto con 'data'
        const arrayDeTarjetas = response?.data || [];
        
        return Array.isArray(arrayDeTarjetas) ? arrayDeTarjetas : [];
    } catch (error) {
        console.error('❌ Error en getEstadoTarjetaApi:', error);
        return [];
    }
};