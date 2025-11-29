/**
 * API para Ingresos - Integración con API Externa
 * Sigue el mismo patrón que movimientosExternalApi.ts
 */

import { IIngreso, IIngresoApiResponse, IResumenIngresos, IResumenIngresosApiResponse, IFiltrosIngresos, IInmuebleFiltro, IInmuebleFiltroApiResponse } from '../interfaces/Ingreso';
import { externalApiFetch, getEmpresaIdFromContext, buildQueryParams } from './externalApiFetch';
import { EXTERNAL_API_ENDPOINTS } from './externalApiConfig';

// Interfaces específicas para respuestas de la API externa
interface ExternalMovimientosResponse {
  isError: boolean;
  data: {
    id: string;
    fecha: string;
    tipo: 'ingreso' | 'egreso';
    concepto: string;
    descripcion: string;
    monto: number;
    id_inmueble: string;
    nombre_inmueble?: string;
    id_reserva?: string;
    codigo_reserva?: string;
    metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
    comprobante?: string;
    id_empresa: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
  }[];
  code: number;
  timestamp: string;
  message?: string;
  error?: string;
}

interface ExternalResumenResponse {
  isError: boolean;
  data: {
    fecha: string;
    total_ingresos: number;
    total_egresos: number;
    balance: number;
    cantidad_movimientos: number;
  };
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
    movimientos: ExternalMovimientosResponse['data'];
  };
  code: number;
  timestamp: string;
  message?: string;
  error?: string;
}

interface ExternalInmueblesResponse {
  isError: boolean;
  data: {
    id: string;
    nombre: string;
    direccion: string;
    estado: string;
  }[];
  code: number;
  timestamp: string;
  message?: string;
  error?: string;
}

/**
 * Obtiene todos los ingresos por filtros desde la API externa
 */
export const getIngresosByFiltros = async (filtros: IFiltrosIngresos): Promise<IIngresoApiResponse> => {
  try {
    console.log('🔄 Obteniendo ingresos desde API externa:', filtros);
    
    const empresaId = getEmpresaIdFromContext();
    
    // Si hay filtro por inmueble, usar endpoint específico
    if (filtros.id_inmueble) {
      const queryParams = buildQueryParams({
        id_inmueble: filtros.id_inmueble,
        fecha: filtros.fecha
      });
      
      const url = `${EXTERNAL_API_ENDPOINTS.MOVIMIENTOS.BY_INMUEBLE}${queryParams}`;
      const response: ExternalMovimientosInmuebleResponse = await externalApiFetch(url, {
        method: 'GET',
      });
      
      // Filtrar solo ingresos y transformar al formato esperado
      const ingresos = response.data.movimientos
        .filter(mov => mov.tipo === 'ingreso')
        .map(transformMovimientoToIngreso)
        .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
      
      console.log('✅ Ingresos por inmueble obtenidos exitosamente:', ingresos.length);
      return {
        success: true,
        data: ingresos,
        message: 'Ingresos obtenidos exitosamente desde API externa'
      };
      
    } else {
      // Obtener todos los movimientos de la fecha y filtrar ingresos
      const queryParams = buildQueryParams({ empresa_id: empresaId });
      const url = `${EXTERNAL_API_ENDPOINTS.MOVIMIENTOS.BY_FECHA(filtros.fecha)}${queryParams}`;
      
      const response: ExternalMovimientosResponse = await externalApiFetch(url, {
        method: 'GET',
      });
      
      // Filtrar solo ingresos y transformar al formato esperado
      const ingresos = response.data
        .filter(mov => mov.tipo === 'ingreso')
        .map(transformMovimientoToIngreso)
        .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
      
      console.log('✅ Ingresos obtenidos exitosamente:', ingresos.length);
      return {
        success: true,
        data: ingresos,
        message: 'Ingresos obtenidos exitosamente desde API externa'
      };
    }
    
  } catch (error) {
    console.error('❌ Error al obtener ingresos desde API externa:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Error al conectar con el servidor'
    };
  }
};

/**
 * Obtiene el resumen de ingresos desde la API externa
 */
export const getResumenIngresos = async (filtros: IFiltrosIngresos): Promise<IResumenIngresosApiResponse> => {
  try {
    console.log('🔄 Obteniendo resumen de ingresos desde API externa:', filtros);
    
    const empresaId = getEmpresaIdFromContext();
    
    if (filtros.id_inmueble) {
      // Para un inmueble específico, obtener los movimientos detallados
      const queryParams = buildQueryParams({
        id_inmueble: filtros.id_inmueble,
        fecha: filtros.fecha
      });
      
      const url = `${EXTERNAL_API_ENDPOINTS.MOVIMIENTOS.BY_INMUEBLE}${queryParams}`;
      const response: ExternalMovimientosInmuebleResponse = await externalApiFetch(url, {
        method: 'GET',
      });
      
      const movimientosIngreso = response.data.movimientos.filter(mov => mov.tipo === 'ingreso');
      
      const resumen: IResumenIngresos = {
        fecha: filtros.fecha,
        total_ingresos: response.data.ingresos,
        cantidad_ingresos: movimientosIngreso.length,
        promedio_ingreso: movimientosIngreso.length > 0 ? response.data.ingresos / movimientosIngreso.length : 0,
        inmueble_seleccionado: filtros.id_inmueble,
        ingresos_por_inmueble: []
      };
      
      console.log('✅ Resumen de ingresos por inmueble obtenido exitosamente');
      return {
        success: true,
        data: resumen,
        message: 'Resumen de ingresos obtenido exitosamente desde API externa'
      };
      
    } else {
      // Para todos los inmuebles, obtener el resumen general
      const queryParams = buildQueryParams({ empresa_id: empresaId });
      const url = `${EXTERNAL_API_ENDPOINTS.MOVIMIENTOS.RESUMEN(filtros.fecha)}${queryParams}`;
      
      const response: ExternalResumenResponse = await externalApiFetch(url, {
        method: 'GET',
      });
      
      // También obtener movimientos detallados para calcular promedio
      const movimientosUrl = `${EXTERNAL_API_ENDPOINTS.MOVIMIENTOS.BY_FECHA(filtros.fecha)}${queryParams}`;
      const movimientosResponse: ExternalMovimientosResponse = await externalApiFetch(movimientosUrl, {
        method: 'GET',
      });
      
      const movimientosIngreso = movimientosResponse.data.filter(mov => mov.tipo === 'ingreso');
      
      const resumen: IResumenIngresos = {
        fecha: filtros.fecha,
        total_ingresos: response.data.total_ingresos,
        cantidad_ingresos: movimientosIngreso.length,
        promedio_ingreso: movimientosIngreso.length > 0 ? response.data.total_ingresos / movimientosIngreso.length : 0,
        inmueble_seleccionado: null,
        ingresos_por_inmueble: calcularIngresosPorInmueble(movimientosIngreso)
      };
      
      console.log('✅ Resumen general de ingresos obtenido exitosamente');
      return {
        success: true,
        data: resumen,
        message: 'Resumen de ingresos obtenido exitosamente desde API externa'
      };
    }
    
  } catch (error) {
    console.error('❌ Error al obtener resumen de ingresos desde API externa:', error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Error al conectar con el servidor'
    };
  }
};

/**
 * Obtiene la lista de inmuebles para el filtro desde la API externa
 */
export const getInmueblesParaFiltro = async (): Promise<IInmuebleFiltroApiResponse> => {
  try {
    console.log('🔄 Obteniendo inmuebles para filtro desde API externa...');
    
    const empresaId = getEmpresaIdFromContext();
    const queryParams = buildQueryParams({ empresa_id: empresaId });
    const url = `${EXTERNAL_API_ENDPOINTS.INMUEBLES.SELECTOR}${queryParams}`;
    
    const response: ExternalInmueblesResponse = await externalApiFetch(url, {
      method: 'GET',
    });
    
    // Transformar al formato esperado por el frontend
    const inmuebles: IInmuebleFiltro[] = response.data.map(inmueble => ({
      id: inmueble.id,
      nombre: inmueble.nombre,
      direccion: inmueble.direccion
    }));
    
    console.log('✅ Inmuebles para filtro obtenidos exitosamente:', inmuebles.length);
    return {
      success: true,
      data: inmuebles,
      message: 'Inmuebles obtenidos exitosamente desde API externa'
    };
    
  } catch (error) {
    console.error('❌ Error al obtener inmuebles desde API externa:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Error al conectar con el servidor'
    };
  }
};

/**
 * Transforma un movimiento de la API externa al formato de ingreso del frontend
 */
const transformMovimientoToIngreso = (movimiento: ExternalMovimientosResponse['data'][0]): IIngreso => {
  return {
    id: movimiento.id,
    fecha: movimiento.fecha,
    concepto: movimiento.concepto,
    descripcion: movimiento.descripcion,
    monto: movimiento.monto,
    id_inmueble: movimiento.id_inmueble,
    nombre_inmueble: movimiento.nombre_inmueble || 'Inmueble no especificado',
    id_reserva: movimiento.id_reserva,
    codigo_reserva: movimiento.codigo_reserva,
    metodo_pago: movimiento.metodo_pago,
    comprobante: movimiento.comprobante,
    tipo_ingreso: 'movimiento' as const, // Los de API externa son siempre movimientos
    id_empresa: movimiento.id_empresa,
    fecha_creacion: movimiento.fecha_creacion,
    fecha_actualizacion: movimiento.fecha_actualizacion
  };
};

/**
 * Calcula el resumen de ingresos por inmueble
 */
const calcularIngresosPorInmueble = (movimientos: ExternalMovimientosResponse['data']): IResumenIngresos['ingresos_por_inmueble'] => {
  const agrupados = movimientos.reduce((acc, mov) => {
    const key = mov.id_inmueble;
    if (!acc[key]) {
      acc[key] = {
        id_inmueble: mov.id_inmueble,
        nombre_inmueble: mov.nombre_inmueble || 'Inmueble no especificado',
        total_ingresos: 0,
        cantidad_ingresos: 0
      };
    }
    acc[key].total_ingresos += mov.monto;
    acc[key].cantidad_ingresos += 1;
    return acc;
  }, {} as Record<string, IResumenIngresos['ingresos_por_inmueble'][0]>);
  
  return Object.values(agrupados).sort((a, b) => b.total_ingresos - a.total_ingresos);
};

// Legacy functions for backward compatibility
export const getResumenIngresosByCriteria = async (fecha: string, id_inmueble?: string): Promise<{ success: boolean; data?: IResumenIngresos; message: string; error?: string }> => {
  const filtros: IFiltrosIngresos = { fecha, id_inmueble };
  const response = await getResumenIngresos(filtros);
  return {
    success: response.success,
    data: response.data || undefined,
    message: response.message,
    error: response.success ? undefined : response.message
  };
};