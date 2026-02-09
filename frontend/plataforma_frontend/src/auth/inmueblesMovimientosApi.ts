/**
 * API de Inmuebles para Movimientos - Conectado con Backend Externo
 * Este archivo conecta con la API externa a través de las APIs internas de Next.js
 */

import { IInmuebleApiResponse } from '../interfaces/Inmueble';
import { apiFetch } from './apiFetch';

// Interfaz simplificada para selector de inmuebles
interface IInmuebleSelector {
  id: string;
  nombre: string;
  direccion: string;
  estado: string;
}

interface InmueblesSelectorResponse {
  success: boolean;
  data?: IInmuebleSelector[];
  message: string;
  error?: string;
}

// Función para mapear IInmuebleSelector a IInmueble simplificado para compatibilidad
const mapSelectorToInmueble = (selector: IInmuebleSelector): any => ({
  id: selector.id,
  id_inmueble: selector.id,
  nombre: selector.nombre,
  direccion: selector.direccion,
  estado: selector.estado,
  // Campos mínimos necesarios para formularios
  edificio: '',
  apartamento: '',
  comision: 0,
  id_propietario: '1',
  tipo: 'apartamento',
  precio: 0,
  precio_limpieza: 0,
  id_producto_sigo: '',
  descripcion: '',
  capacidad_maxima: 1,
  habitaciones: 1,
  banos: 1,
  area: 0,
  tiene_cocina: true,
  id_empresa: '1',
  nombre_empresa: 'WaiwaHost',
  fecha_creacion: '2025-01-01',
  fecha_actualizacion: '2025-01-01'
});

/**
 * Obtiene inmuebles para usar en formularios de movimientos
 * Conectado a la API externa a través de API interna
 */
export const getInmueblesForMovimientos = async (): Promise<IInmuebleApiResponse> => {
  try {

    const response: any = await apiFetch('/api/inmuebles/getInmueblesSelector', {
      method: 'GET',
    });

    // apiFetch puede devolver directamente el array de data si detecta la propiedad 'data' en la respuesta
    if (Array.isArray(response)) {
      const inmuebles = response.map(mapSelectorToInmueble);
      return {
        success: true,
        data: inmuebles,
        message: 'Inmuebles obtenidos exitosamente'
      };
    }

    // Si apiFetch devuelve el objeto completo
    if (response && response.success && Array.isArray(response.data)) {
      const inmuebles = response.data.map(mapSelectorToInmueble);
      return {
        success: true,
        data: inmuebles,
        message: response.message || 'Inmuebles obtenidos exitosamente'
      };
    }

    return {
      success: false,
      message: response?.message || 'Error al obtener inmuebles',
      error: response?.error
    };



  } catch (error) {
    console.error('❌ Error en getInmueblesForMovimientos:', error);
    return {
      success: false,
      message: 'Error al obtener inmuebles',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};