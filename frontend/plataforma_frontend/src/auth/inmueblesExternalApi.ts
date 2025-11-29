/**
 * API de Inmuebles Selector - Integración con API Externa
 * Servicio para obtener inmuebles para formularios y selectores
 */

import { externalApiFetch, getEmpresaIdFromContext, buildQueryParams } from './externalApiFetch';
import { EXTERNAL_API_ENDPOINTS } from './externalApiConfig';

// Interfaces para inmuebles selector
export interface IInmuebleSelector {
  id: string;
  nombre: string;
  direccion: string;
  estado: string;
}

interface ExternalInmueblesSelectorResponse {
  isError: boolean;
  data: IInmuebleSelector[];
  code: number;
  timestamp: string;
  message?: string;
  error?: string;
}

/**
 * Obtiene lista simplificada de inmuebles activos para formularios
 * desde la API externa
 */
export const getInmueblesSelectorExternal = async (): Promise<{
  success: boolean;
  data?: IInmuebleSelector[];
  message: string;
  error?: string;
}> => {
  try {
    console.log('🔄 Obteniendo inmuebles selector desde API externa');
    
    const empresaId = getEmpresaIdFromContext();
    const queryParams = buildQueryParams({ empresa_id: empresaId });
    const url = `${EXTERNAL_API_ENDPOINTS.INMUEBLES.SELECTOR}${queryParams}`;
    
    const response: ExternalInmueblesSelectorResponse = await externalApiFetch(url, {
      method: 'GET',
    });

    console.log('✅ Inmuebles selector obtenidos exitosamente:', response.data.length);
    
    return {
      success: true,
      data: response.data,
      message: 'Inmuebles obtenidos exitosamente'
    };
    
  } catch (error) {
    console.error('❌ Error al obtener inmuebles selector:', error);
    return {
      success: false,
      message: 'Error al obtener inmuebles',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};