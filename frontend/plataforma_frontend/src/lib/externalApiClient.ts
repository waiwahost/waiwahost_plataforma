/**
 * Cliente HTTP para que las APIs internas de Next.js se comuniquen con la API externa
 * Este archivo solo debe ser usado desde /pages/api/ (servidor)
 */

// Configuración de la API externa
const API_URL = process.env.API_URL || 'http://localhost:3001';

/**
 * Helper para decodificar base64 compatible con Node.js y navegador
 */
const base64Decode = (str: string): string => {
  // En Node.js 18+ atob está disponible globalmente
  // En versiones anteriores, usar Buffer
  if (typeof atob !== 'undefined') {
    return atob(str);
  }
  // Fallback para Node.js antiguo (aunque Next.js requiere Node 18+)
  return Buffer.from(str, 'base64').toString('utf-8');
};

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
  token?: string,
  asBuffer: boolean = false
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

  try {
    console.log(`[externalApiServerFetch] Fetching: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`[externalApiServerFetch] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error API Externa: ${response.status} - ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    if (asBuffer) {
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    const data = await response.json();
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
 * Función para obtener empresa_id del token
 * Decodifica el JWT y extrae el empresaId del payload
 */
import { jwtDecode } from 'jwt-decode';

/**
 * Función para obtener empresa_id del token
 * Decodifica el JWT y busca el empresaId en el payload
 */
export const getEmpresaIdFromToken = (token?: string): string => {
  if (!token) {
    throw new Error('Token no proporcionado');
  }

  try {
    // Decodificar JWT (formato: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT inválido');
    }

    // Decodificar el payload (segunda parte del token)
    // Normalizar base64 URL-safe a base64 estándar
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(base64Decode(base64));

    // Extraer empresaId del payload
    if (!payload.empresaId) {
      throw new Error('empresaId no encontrado en el token');
    }

    return String(payload.empresaId);
  } catch (error) {
    console.error('Error decodificando token:', error);
    throw new Error('Error al extraer empresaId del token');
  }
};