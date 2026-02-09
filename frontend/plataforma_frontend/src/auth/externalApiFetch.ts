/**
 * Función para realizar peticiones a la API externa
 * Maneja autenticación, errores y reintentos de forma robusta
 */

import { EXTERNAL_API_ENDPOINTS, API_CONFIG, DEFAULT_EXTERNAL_HEADERS } from './externalApiConfig';

interface ExternalApiResponse<T = any> {
  isError: boolean;
  data?: T;
  code: number;
  message?: string;
  error?: string | any;
  timestamp: string;
}

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  isExternal?: boolean; // Flag para distinguir APIs externas de internas
}

/**
 * Función para realizar peticiones con timeout
 */
const fetchWithTimeout = (url: string, options: RequestInit, timeout: number): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

/**
 * Función para delay entre reintentos
 */
const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Función principal para peticiones a APIs (externas e internas)
 * @param url - URL del endpoint
 * @param options - Opciones de la petición
 * @returns Promise con la respuesta parseada
 */
export const apiExternalFetch = async <T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    timeout = API_CONFIG.TIMEOUT,
    retries = API_CONFIG.RETRY_ATTEMPTS,
    isExternal = false,
    headers: customHeaders = {},
    ...fetchOptions
  } = options;

  // Obtener token de autenticación
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Configurar headers según el tipo de API
  const headers: Record<string, string> = {
    ...(isExternal ? DEFAULT_EXTERNAL_HEADERS : { 'Content-Type': 'application/json' }),
    ...customHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let lastError: Error;

  // Intentar la petición con reintentos
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        ...fetchOptions,
        headers,
      }, timeout);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data: T = await response.json();

      if (isExternal) {
        // Para APIs externas, verificar formato de respuesta estándar
        const externalResponse = data as unknown as ExternalApiResponse<any>;
        if (externalResponse.isError === true) {
          throw new Error(externalResponse.error || externalResponse.message || 'Error en API externa');
        }
        return data;
      } else {
        // Para APIs internas, devolver directamente
        return data;
      }

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Error desconocido');
      console.error(`❌ Error en intento ${attempt + 1}:`, lastError.message);

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < retries) {
        const delayTime = API_CONFIG.RETRY_DELAY * (attempt + 1); // Backoff exponencial simple
        await delay(delayTime);
      }
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error(`💥 Todos los intentos fallaron para: ${url}`);
  throw lastError!;
};

/**
 * Función específica para APIs externas (con isExternal=true por defecto)
 */
export const externalApiFetch = <T = any>(url: string, options: Omit<RequestOptions, 'isExternal'> = {}): Promise<T> => {
  return apiExternalFetch<T>(url, { ...options, isExternal: true });
};

/**
 * Función específica para APIs internas (comportamiento original)
 */
export const internalApiFetch = <T = any>(url: string, options: Omit<RequestOptions, 'isExternal'> = {}): Promise<T> => {
  return apiExternalFetch<T>(url, { ...options, isExternal: false });
};

/**
 * Función de conveniencia para obtener empresa_id del contexto
 */
export const getEmpresaIdFromContext = (): string => {
  // Esta función debe obtener el empresa_id del contexto del usuario
  // Por ahora retornamos un valor por defecto, pero debe implementarse según la lógica del proyecto
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.empresa_id || '1';
      } catch {
        console.warn('Error parsing user data from localStorage');
      }
    }
  }
  return '1'; // Valor por defecto
};

/**
 * Función de utilidad para construir query parameters
 */
export const buildQueryParams = (params: Record<string, string | number | undefined>): string => {
  const validParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return validParams ? `?${validParams}` : '';
};