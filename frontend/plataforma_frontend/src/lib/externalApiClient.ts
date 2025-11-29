/**
 * Cliente HTTP para que las APIs internas de Next.js se comuniquen con la API externa
 * Este archivo solo debe ser usado desde /pages/api/ (servidor)
 */

// Configuración de la API externa
const API_URL = process.env.API_URL || 'http://localhost:3001';

/**
 * Cliente HTTP para llamadas desde el servidor (APIs internas)
 * @param endpoint - Endpoint relativo (ej: '/movimientos/fecha/2025-10-12')
 * @param options - Opciones de fetch
 * @param token - Token de autorización
 * @returns Promise con la respuesta
 */
export const externalApiServerFetch = async (
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<any> => {
  const url = `${API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Solo agregar Content-Type para peticiones que tienen body
  const method = options.method?.toUpperCase() || 'GET';
  const hasBody = options.body !== undefined && options.body !== null;
  
  if (hasBody || (method !== 'DELETE' && method !== 'GET' && method !== 'HEAD')) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  // Agregar token si está disponible
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  console.log(`🔄 API Interna → API Externa: ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error API Externa: ${response.status} - ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ API Externa exitosa: ${url}`);
    return data;

  } catch (error) {
    console.error(`💥 Error conectando con API externa: ${url}`, error);
    throw error;
  }
};

/**
 * Función para extraer el token del header Authorization
 */
export const extractTokenFromRequest = (req: any): string | undefined => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return undefined;
};

/**
 * Función para obtener empresa_id del token (simplificada)
 * En una implementación real, decodificarías el JWT
 */
export const getEmpresaIdFromToken = (token?: string): string => {
  // Por ahora retornamos un valor por defecto
  // En producción, decodificar el JWT y extraer empresa_id
  const empresaId = '1';
  console.log('🔍 getEmpresaIdFromToken llamada:');
  console.log('  Token recibido:', token ? 'SÍ (length: ' + token.length + ')' : 'NO');
  console.log('  Devolviendo empresa_id:', empresaId);
  return empresaId;
};