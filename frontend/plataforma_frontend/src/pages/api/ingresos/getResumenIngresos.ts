import type { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

interface ResumenIngresosResponse {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}

/**
 * API Interna: Obtener resumen de ingresos
 * GET /api/ingresos/getResumenIngresos?fecha=2025-10-12&id_inmueble=123
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResumenIngresosResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const { fecha, id_inmueble } = req.query;
    
    // Validar parámetros
    if (!fecha || typeof fecha !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Fecha es requerida'
      });
    }

    // Extraer token (sin empresa_id por ahora)
    const token = extractTokenFromRequest(req);

    // Construir parámetros de consulta (sin empresa_id)
    const params = new URLSearchParams({
      fecha: fecha
    });

    // Agregar filtro por inmueble si está presente
    if (id_inmueble && typeof id_inmueble === 'string') {
      params.append('id_inmueble', id_inmueble);
    }

    // Endpoint específico para resumen de ingresos
    const endpoint = `/ingresos/resumen?${params.toString()}`;
    
    console.log('🔍 DEBUG - URL final que se va a llamar:', endpoint);
    console.log('🔍 DEBUG - Parámetros:', params.toString());
    console.log('🔍 DEBUG - Token presente:', token ? 'SÍ' : 'NO');

    // Llamar a la API externa
    const externalResponse = await externalApiServerFetch(endpoint, {
      method: 'GET'
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al obtener resumen de ingresos',
        error: externalResponse.error
      });
    }

    // Transformar los datos del backend al formato que espera el frontend
    const backendData = externalResponse.data;
    console.log('✅ Datos recibidos del backend:', backendData);
    console.log('Datos a transformar .data', externalResponse.data);
    const transformedData = {
      fecha: backendData.data.fecha,
      total_ingresos: backendData.data.total_ingresos,
      cantidad_ingresos: backendData.data.cantidad_ingresos,
      promedio_ingreso: backendData.data.promedio_ingreso,
      inmueble_seleccionado: backendData.data.inmueble_filtro,
      ingresos_por_inmueble: backendData.data.desglose_inmuebles?.map((inmueble: any) => ({
        id_inmueble: inmueble.id_inmueble.toString(),
        nombre_inmueble: inmueble.nombre_inmueble,
        total_ingresos: inmueble.total,
        cantidad_ingresos: inmueble.cantidad
      })) || []
    };

    console.log('✅ Datos transformados para frontend:', transformedData);

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: transformedData,
      message: 'Resumen de ingresos obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error en API resumen ingresos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}