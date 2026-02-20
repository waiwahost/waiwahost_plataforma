/**
 * Función principal para peticiones HTTP
 * Maneja tanto APIs internas (Next.js) como externas (backend)
 * Mantiene compatibilidad con código existente
 */

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const baseHeaders = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Solo agregar Content-Type para métodos que normalmente tienen body
  const method = options.method?.toUpperCase() || 'GET';
  const hasBody = options.body !== undefined && options.body !== null;

  const headers = {
    ...baseHeaders,
    // No agregar Content-Type para DELETE, GET, HEAD a menos que explícitamente tenga body
    ...(hasBody || (method !== 'DELETE' && method !== 'GET' && method !== 'HEAD')
      ? { 'Content-Type': 'application/json' }
      : {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());

  // Manejar respuestas sin body (ej: 204 No Content en DELETE)
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json') || res.status === 204) {
    return undefined;
  }

  const resJson = await res.json();
  // Si la respuesta tiene la estructura { data: ... }, devolvemos data
  // Esto maneja la respuesta directa del backend
  if (resJson && typeof resJson === 'object' && 'data' in resJson) {
    return resJson.data;
  }
  return resJson;
};
