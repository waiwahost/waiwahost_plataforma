import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../lib/externalApiClient';
import { IMovimiento } from '../../../interfaces/Movimiento';

interface MovimientoApiResponse {
  success: boolean;
  data?: IMovimiento[] | { ingresos: number; egresos: number; movimientos: IMovimiento[] };
  message: string;
  error?: string;
}

/**
 * Valida los parámetros de entrada
 */
const validateParams = (id_inmueble: any, fecha: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!id_inmueble) {
    errors.push('ID de inmueble es requerido');
  }
  
  if (!fecha) {
    errors.push('Fecha es requerida');
  } else {
    // Validar formato de fecha (YYYY-MM-DD)
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha as string)) {
      errors.push('Formato de fecha inválido. Use YYYY-MM-DD');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * API Interna: Obtiene los movimientos de un inmueble para una fecha específica
 * GET /api/inmuebles/movimientos?id_inmueble=1&fecha=2025-10-12
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<MovimientoApiResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const { id_inmueble, fecha } = req.query;
    
    const validation = validateParams(id_inmueble, fecha);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros inválidos',
        error: validation.errors.join(', ')
      });
    }

    // Extraer token
    const token = extractTokenFromRequest(req);

    // Llamar a la API externa
    const endpoint = `/movimientos/inmueble?id_inmueble=${id_inmueble}&fecha=${fecha}`;
    const externalResponse = await externalApiServerFetch(endpoint, {
      method: 'GET'
    }, token);

    // Verificar si la respuesta externa es exitosa
    if (externalResponse.isError) {
      return res.status(400).json({
        success: false,
        message: externalResponse.message || 'Error al obtener movimientos del inmueble',
        error: externalResponse.error
      });
    }

    console.log(`✅ Movimientos del inmueble ${id_inmueble} obtenidos exitosamente:`, {
      cantidad: externalResponse.data.movimientos?.length || 0,
      ingresos: externalResponse.data.ingresos,
      egresos: externalResponse.data.egresos
    });

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: externalResponse.data,
      message: 'Movimientos del inmueble obtenidos exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en API movimientos por inmueble:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}