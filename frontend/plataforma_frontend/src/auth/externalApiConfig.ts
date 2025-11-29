/**
 * Configuración para la API externa
 * Centraliza las URLs y configuraciones de la API backend real
 */

// URL base de la API externa - debe configurarse según el ambiente
export const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_EXTERNAL_API_URL || 'http://localhost:3001';

/**
 * URLs de endpoints externos organizados por módulo
 */
export const EXTERNAL_API_ENDPOINTS = {
  // Endpoints de Movimientos Generales
  MOVIMIENTOS: {
    BY_FECHA: (fecha: string) => `${EXTERNAL_API_BASE_URL}/movimientos/fecha/${fecha}`,
    BY_INMUEBLE: `${EXTERNAL_API_BASE_URL}/movimientos/inmueble`,
    RESUMEN: (fecha: string) => `${EXTERNAL_API_BASE_URL}/movimientos/resumen/${fecha}`,
    CREATE: `${EXTERNAL_API_BASE_URL}/movimientos`,
    UPDATE: (id: string) => `${EXTERNAL_API_BASE_URL}/movimientos/${id}`,
    DELETE: (id: string) => `${EXTERNAL_API_BASE_URL}/movimientos/${id}`,
    BY_ID: (id: string) => `${EXTERNAL_API_BASE_URL}/movimientos/${id}`,
  },
  
  // Endpoints específicos para Ingresos (filtrados del sistema de movimientos)
  INGRESOS: {
    BY_FECHA_EMPRESA: (fecha: string) => `${EXTERNAL_API_BASE_URL}/movimientos/fecha/${fecha}`,
    BY_FECHA_INMUEBLE: `${EXTERNAL_API_BASE_URL}/movimientos/inmueble`,
    RESUMEN_FECHA: (fecha: string) => `${EXTERNAL_API_BASE_URL}/movimientos/resumen/${fecha}`,
  },
  
  // Endpoints específicos para Egresos (filtrados del sistema de movimientos)
  EGRESOS: {
    BY_FECHA_EMPRESA: (fecha: string) => `${EXTERNAL_API_BASE_URL}/movimientos/fecha/${fecha}`,
    BY_FECHA_INMUEBLE: `${EXTERNAL_API_BASE_URL}/movimientos/inmueble`,
    RESUMEN_FECHA: (fecha: string) => `${EXTERNAL_API_BASE_URL}/movimientos/resumen/${fecha}`,
  },
  
  // Endpoints de Inmuebles
  INMUEBLES: {
    SELECTOR: `${EXTERNAL_API_BASE_URL}/inmuebles/selector`,
    GET_INMUEBLES: `${EXTERNAL_API_BASE_URL}/inmuebles/getInmuebles`,
    CREATE: `${EXTERNAL_API_BASE_URL}/inmuebles/createInmueble`,
    UPDATE: `${EXTERNAL_API_BASE_URL}/inmuebles/editInmueble`,
    DELETE: `${EXTERNAL_API_BASE_URL}/inmuebles/deleteInmueble`,
  },
  
  // Endpoints de Reservas (si se necesitan en el futuro)
  RESERVAS: {
    LIST: `${EXTERNAL_API_BASE_URL}/reservas`,
    CREATE: `${EXTERNAL_API_BASE_URL}/reservas`,
    UPDATE: (id: string) => `${EXTERNAL_API_BASE_URL}/reservas/${id}`,
    DELETE: (id: string) => `${EXTERNAL_API_BASE_URL}/reservas/${id}`,
    BY_ID: (id: string) => `${EXTERNAL_API_BASE_URL}/reservas/${id}`,
  },

  // Endpoints de Pagos de Reservas
  PAGOS: {
    // Gestión principal de pagos
    BY_RESERVA: (idReserva: string | number) => `${EXTERNAL_API_BASE_URL}/api/v1/pagos/reserva/${idReserva}`,
    CREATE: `${EXTERNAL_API_BASE_URL}/api/v1/pagos`,
    UPDATE: (id: string | number) => `${EXTERNAL_API_BASE_URL}/api/v1/pagos/${id}`,
    DELETE: (id: string | number) => `${EXTERNAL_API_BASE_URL}/api/v1/pagos/${id}`,
    BY_ID: (id: string | number) => `${EXTERNAL_API_BASE_URL}/api/v1/pagos/${id}`,
    
    // Consultas y reportes
    LIST: `${EXTERNAL_API_BASE_URL}/api/v1/pagos`,
    BY_FECHA: (fecha: string) => `${EXTERNAL_API_BASE_URL}/api/v1/pagos/fecha/${fecha}`,
    ESTADISTICAS_METODOS: `${EXTERNAL_API_BASE_URL}/api/v1/pagos/estadisticas/metodos-pago`,
    
    // Integración con movimientos
    FROM_PAGO: `${EXTERNAL_API_BASE_URL}/api/v1/movimientos/from-pago`,
    RESUMEN_FINANCIERO: (idReserva: string | number) => `${EXTERNAL_API_BASE_URL}/api/v1/reservas/${idReserva}/resumen-financiero`,
  }
} as const;

/**
 * Configuración de timeouts y reintentos
 */
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
} as const;

/**
 * Headers por defecto para la API externa
 */
export const DEFAULT_EXTERNAL_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;