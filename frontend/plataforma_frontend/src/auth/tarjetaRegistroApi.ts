import { apiFetch } from './apiFetch';
import { ITarjetaResponseApi, IEstadoTarjetaResponseApi } from '../interfaces/Tarjeta';

/**
 * Envía una tarjeta a la API
 */
export const sendTarjetaApi = async (idReserva: number): Promise<ITarjetaResponseApi[]> => {
    try {
        const response = await apiFetch(`/api/tarjetas-registro/sendTarjeta/${idReserva}`, {
            method: 'POST',
        });
        
        const arrayDeTarjetas = response?.data || [];
        
        return Array.isArray(arrayDeTarjetas) ? arrayDeTarjetas : [];
    } catch (error) {
        console.error('❌ Error en sendTarjetaApi:', error);
        return [];
    }
};





/**
 * Obtiene todas las tarjetas con Id de una Reserva
 */
export const getTarjetaRegistroApi = async (idReserva: number): Promise<ITarjetaResponseApi[]> => {
    try {
        const response = await apiFetch(`/api/tarjetas-registro/${idReserva}`, {
            method: 'GET',
        });
        
        const arrayDeTarjetas = response?.data || [];
        
        return Array.isArray(arrayDeTarjetas) ? arrayDeTarjetas : [];
    } catch (error) {
        console.error('❌ Error en getEstadoTarjetaApi:', error);
        return [];
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
        
        const arrayDeTarjetas = response?.data || [];
        
        return Array.isArray(arrayDeTarjetas) ? arrayDeTarjetas : [];
    } catch (error) {
        console.error('❌ Error en getEstadoTarjetaApi:', error);
        return [];
    }
};