import type { NextApiRequest, NextApiResponse } from 'next';
import { IReservaForm, IReservaTableData } from '../../../interfaces/Reserva';

// Interfaz para la respuesta de la API externa al crear reserva
interface ExternalCreateReservaResponse {
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
  precio_total: number; // Mantener por compatibilidad
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
  data: ExternalCreateReservaResponse;
  message?: string;
}

/**
 * Valida los datos de entrada para crear una reserva
 */
const validateReservaData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.id_inmueble || typeof data.id_inmueble !== 'number') {
    errors.push('El ID del inmueble es requerido y debe ser un número');
  }

  // Validar huéspedes
  if (!data.huespedes || !Array.isArray(data.huespedes) || data.huespedes.length === 0) {
    errors.push('Debe incluir al menos un huésped');
  } else {
    // Validar que exista un huésped principal
    const huespedesPrincipales = data.huespedes.filter((h: any) => h.es_principal);
    if (huespedesPrincipales.length !== 1) {
      errors.push('Debe haber exactamente un huésped principal');
    }

    // Validar cada huésped
    //data.huespedes.forEach((huesped: any, index: number) => {
    //if (!huesped.nombre || typeof huesped.nombre !== 'string' || huesped.nombre.trim().length < 2) {
    //  errors.push(`El nombre del huésped ${index + 1} es requerido y debe tener al menos 2 caracteres`);
    //}

    //if (!huesped.apellido || typeof huesped.apellido !== 'string' || huesped.apellido.trim().length < 2) {
    //  errors.push(`El apellido del huésped ${index + 1} es requerido y debe tener al menos 2 caracteres`);
    //}

    //if (!huesped.email || typeof huesped.email !== 'string' || !/\S+@\S+\.\S+/.test(huesped.email)) {
    //  errors.push(`El email del huésped ${index + 1} es requerido y debe ser válido`);
    //}

    //if (!huesped.telefono || typeof huesped.telefono !== 'string' || huesped.telefono.trim().length < 10) {
    //  errors.push(`El teléfono del huésped ${index + 1} es requerido y debe tener al menos 10 caracteres`);
    //}

    //if (!huesped.documento_numero || typeof huesped.documento_numero !== 'string' || huesped.documento_numero.trim().length < 5) {
    //  errors.push(`El documento del huésped ${index + 1} es requerido y debe tener al menos 5 caracteres`);
    //}

    //if (!huesped.documento_tipo || !['cedula', 'pasaporte', 'tarjeta_identidad'].includes(huesped.documento_tipo)) {
    //  errors.push(`El tipo de documento del huésped ${index + 1} es requerido y debe ser válido`);
    //}

    //if (!huesped.fecha_nacimiento || typeof huesped.fecha_nacimiento !== 'string') {
    //  errors.push(`La fecha de nacimiento del huésped ${index + 1} es requerida`);
    //}
    //});
  }

  if (!data.fecha_inicio || typeof data.fecha_inicio !== 'string') {
    errors.push('La fecha de entrada es requerida');
  }

  if (!data.fecha_fin || typeof data.fecha_fin !== 'string') {
    errors.push('La fecha de salida es requerida');
  }

  if (data.fecha_inicio && data.fecha_fin && new Date(data.fecha_inicio) >= new Date(data.fecha_fin)) {
    errors.push('La fecha de salida debe ser posterior a la fecha de entrada');
  }

  if (!data.numero_huespedes || typeof data.numero_huespedes !== 'number' || data.numero_huespedes < 1) {
    errors.push('El número de huéspedes es requerido y debe ser mayor a 0');
  }

  // Validar que el número de huéspedes coincida con el array
  if (data.huespedes && data.numero_huespedes !== data.huespedes.length) {
    errors.push('El número de huéspedes no coincide con la cantidad de huéspedes proporcionados');
  }

  if (!data.precio_total || typeof data.precio_total !== 'number' || data.precio_total <= 0) {
    errors.push('El precio total es requerido y debe ser mayor a 0');
  }

  if (!data.estado || !['pendiente', 'confirmada', 'en_proceso', 'completada', 'cancelada'].includes(data.estado)) {
    errors.push('El estado es requerido y debe ser válido');
  }

  if (!data.id_empresa || typeof data.id_empresa !== 'number') {
    errors.push('El ID de la empresa es requerido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Mapea la respuesta de la API externa al formato interno
 */
const mapReservaFromAPI = (reservaAPI: ExternalCreateReservaResponse): IReservaTableData => {
  return {
    id: reservaAPI.id,
    codigo_reserva: reservaAPI.codigo_reserva,
    id_inmueble: reservaAPI.id_inmueble,
    nombre_inmueble: reservaAPI.nombre_inmueble,
    huesped_principal: reservaAPI.huesped_principal,
    fecha_inicio: reservaAPI.fecha_inicio,
    fecha_fin: reservaAPI.fecha_fin,
    numero_huespedes: reservaAPI.numero_huespedes,
    huespedes: reservaAPI.huespedes,
    precio_total: reservaAPI.precio_total,
    total_reserva: reservaAPI.total_reserva,
    total_pagado: reservaAPI.total_pagado,
    total_pendiente: reservaAPI.total_pendiente,
    estado: reservaAPI.estado,
    fecha_creacion: reservaAPI.fecha_creacion,
    observaciones: reservaAPI.observaciones || '',
    id_empresa: reservaAPI.id_empresa,
    plataforma_origen: reservaAPI.plataforma_origen as any, // Mapear plataforma_origen
  };
};

/**
 * Crea una nueva reserva llamando a la API externa
 * @param req - Request object
 * @param res - Response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const reservaData: IReservaForm = req.body;

    // Validar datos de entrada
    const validation = validateReservaData(reservaData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Datos de entrada inválidos',
        errors: validation.errors
      });
    }

    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';


    // Realizar la llamada a la API externa
    const response = await fetch(`${apiUrl}/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reservaData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        success: false,
        data: null,
        message: errorData.message || `HTTP error! status: ${response.status}`,
        errors: errorData.errors
      });
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
    const nuevaReserva = mapReservaFromAPI(externalData.data);

    res.status(201).json({
      success: true,
      data: nuevaReserva,
      message: 'Reserva creada exitosamente'
    });

  } catch (error) {
    console.error(' Error en createReserva API:', error);

    res.status(500).json({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
