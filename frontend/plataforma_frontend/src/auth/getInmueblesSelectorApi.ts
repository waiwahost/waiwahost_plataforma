import { apiFetch } from './apiFetch';

export interface InmuebleSelector {
  id: number;
  nombre: string;
}

export const getInmueblesSelectorApi = async (): Promise<InmuebleSelector[]> => {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const res = await apiFetch<{
    isError: boolean;
    data: any[];
  }>(`${backendUrl}inmuebles/selector`, {
    method: 'GET',
  });

  // apiFetch devuelve data directamente si existe
  if (!res || !Array.isArray(res)) {
    throw new Error('Respuesta inválida del backend');
  }

  return res.map((i: any) => ({
    id: Number(i.id),
    nombre: i.nombre,
  }));
};
