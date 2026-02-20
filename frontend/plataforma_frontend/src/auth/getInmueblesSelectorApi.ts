export interface InmuebleSelector {
  id: number;
  nombre: string;
}

/**
 * Obtiene los inmuebles para el selector a través de la API interna de Next.js.
 * Usa el proxy /api/inmuebles/getInmueblesSelector para que funcione en producción,
 * ya que el backend no es accesible directamente desde el cliente.
 */
export const getInmueblesSelectorApi = async (): Promise<InmuebleSelector[]> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch('/api/inmuebles/getInmueblesSelector', {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al obtener inmuebles: ${errorText}`);
  }

  const json = await res.json();

  if (!json.success || !Array.isArray(json.data)) {
    throw new Error('Respuesta inválida del servidor');
  }

  return json.data.map((i: any) => ({
    id: Number(i.id),
    nombre: i.nombre,
  }));
};
