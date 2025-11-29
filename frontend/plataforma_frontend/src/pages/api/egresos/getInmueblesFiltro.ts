import type { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

interface InmueblesResponse {
  success: boolean;
  data?: any[];
  message: string;
  error?: string;
}

/**
 * API Interna: Obtener inmuebles para filtro
 * GET /api/egresos/getInmueblesFiltro
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InmueblesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    // Extraer token (sin empresa_id por ahora)
    const token = extractTokenFromRequest(req);

    // Llamar a la API externa para obtener inmuebles (sin empresa_id)
    const endpoint = `/inmuebles/selector`;
    const externalResponse = await externalApiServerFetch(endpoint, {
      method: 'GET'
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al obtener inmuebles',
        error: externalResponse.error
      });
    }

    // Transformar al formato esperado por el frontend
    const inmuebles = externalResponse.data?.map((inmueble: any) => ({
      id: inmueble.id,
      nombre: inmueble.nombre,
      direccion: inmueble.direccion
    })) || [];

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: inmuebles,
      message: 'Inmuebles obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error en API inmuebles filtro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}