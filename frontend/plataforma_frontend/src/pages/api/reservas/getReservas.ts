import type { NextApiRequest, NextApiResponse } from 'next';
import { IReservaTableData } from '../../../interfaces/Reserva';
import { PlataformaOrigen } from '../../../constants/plataformas';

// Interfaz para la respuesta de la API externa
interface ExternalReservaResponse {
  id: number;
  codigo_reserva: string;
  id_inmueble: number;
  nombre_inmueble: string;
  huesped_principal: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  };
  fecha_inicio: string;
  fecha_fin: string;
  numero_huespedes: number;
  huespedes: Array<{
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    documento_tipo: 'cedula' | 'pasaporte' | 'tarjeta_identidad';
    documento_numero: string;
    fecha_nacimiento: string;
    es_principal: boolean;
    id_reserva: number;
  }>;
  precio_total: number; // Mantener por compatibilidad hacia atrás
  total_reserva: number; // Monto total de la reserva
  total_pagado: number; // Monto total pagado/abonado
  total_pendiente: number; // Monto pendiente por pagar
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
  fecha_creacion: string;
  observaciones?: string;
  id_empresa: number;
  plataforma_origen?: string;
}

interface ExternalApiResponse {
  isError: boolean;
  data: ExternalReservaResponse[];
  message?: string;
}

/**
 * Construye la URL con parámetros de query
 */
const buildApiUrl = (baseUrl: string, queryParams: Record<string, string>): string => {
  const url = new URL('/reservas', baseUrl);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
};

/**
 * Mapea los datos de la API externa al formato interno
 */
const mapReservaFromAPI = (reservaAPI: ExternalReservaResponse): IReservaTableData => {
  // Helper para asegurar string ISO válido o string vacío
  const toIsoOrEmpty = (val: any) => {
    if (!val) return '';
    const d = new Date(val);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  };
  return {
    id: reservaAPI.id,
    codigo_reserva: reservaAPI.codigo_reserva,
    id_inmueble: reservaAPI.id_inmueble,
    nombre_inmueble: reservaAPI.nombre_inmueble,
    huesped_principal: reservaAPI.huesped_principal,
    fecha_inicio: toIsoOrEmpty(reservaAPI.fecha_inicio),
    fecha_fin: toIsoOrEmpty(reservaAPI.fecha_fin),
    numero_huespedes: reservaAPI.numero_huespedes,
    huespedes: reservaAPI.huespedes,
    precio_total: reservaAPI.precio_total,
    total_reserva: reservaAPI.total_reserva,
    total_pagado: reservaAPI.total_pagado,
    total_pendiente: reservaAPI.total_pendiente,
    estado: reservaAPI.estado,
    fecha_creacion: toIsoOrEmpty(reservaAPI.fecha_creacion),
    observaciones: reservaAPI.observaciones || '',
    id_empresa: reservaAPI.id_empresa,
    plataforma_origen: (reservaAPI.plataforma_origen as PlataformaOrigen) || 'no_especificada',
  };
};

/**
 * Obtiene todas las reservas desde la API externa
 * @param req - Request object
 * @param res - Response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    // Extraer parámetros de query de la request
    const { estado, id_empresa, id_inmueble, fecha_inicio, fecha_fin } = req.query;
    
    // Construir parámetros de query para la API externa
    const queryParams: Record<string, string> = {};

    if (estado && typeof estado === 'string') {
      queryParams.estado = estado;
    }

    if (id_empresa && typeof id_empresa === 'string') {
      queryParams.id_empresa = id_empresa;
    }

    if (id_inmueble && typeof id_inmueble === 'string') {
      queryParams.id_inmueble = id_inmueble;
    }
    
    if (fecha_inicio && typeof fecha_inicio === 'string') {
      queryParams.fecha_inicio = fecha_inicio;
    }

    if (fecha_fin && typeof fecha_fin === 'string') {
      queryParams.fecha_fin = fecha_fin;
    }

    // Construir URL completa con parámetros
    const fullUrl = buildApiUrl(apiUrl, queryParams);

    // Realizar la llamada a la API externa
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const externalData: ExternalApiResponse = await response.json();

    // Verificar si la API externa retornó error
    if (externalData.isError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: externalData.message || 'Error desde la API externa'
      });
    }

    // Mapear los datos al formato esperado por el frontend
    const reservas = externalData.data.map((reservaAPI, index) => {
      try {
        return mapReservaFromAPI(reservaAPI);
      } catch (mapError) {
        console.error(`❌ Error mapeando reserva en índice ${index}:`, mapError);
        console.error('📄 Datos problemáticos:', reservaAPI);
        // Retornar null para filtrar después
        return null;
      }
    }).filter((reserva): reserva is IReservaTableData => reserva !== null);

    res.status(200).json({
      success: true,
      data: reservas,
      message: 'Reservas obtenidas exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en getReservas API:', error);

    res.status(500).json({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
