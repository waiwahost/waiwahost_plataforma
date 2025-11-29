import type { NextApiRequest, NextApiResponse } from 'next';
import { IReservaForm, IReservaTableData } from '../../../interfaces/Reserva';
import { PlataformaOrigen } from '../../../constants/plataformas';

// Interfaz para la respuesta de la API externa al editar reserva
interface ExternalEditReservaResponse {
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
  data: ExternalEditReservaResponse;
  message?: string;
}

/**
 * Obtiene el nombre del inmueble basado en el ID
 */
const getInmuebleNombre = (id_inmueble: number): string => {
  const inmuebles = [
    { id: 1, nombre: 'Apartamento Centro Histórico' },
    { id: 2, nombre: 'Casa de Playa Cartagena' },
    { id: 3, nombre: 'Loft Zona Rosa' },
    { id: 4, nombre: 'Estudio Chapinero' },
  ];
  
  const inmueble = inmuebles.find(i => i.id === id_inmueble);
  return inmueble?.nombre || 'Inmueble no encontrado';
};

/**
 * Valida los datos de entrada para editar una reserva
 */
const validateReservaData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.id || typeof data.id !== 'number') {
    errors.push('El ID de la reserva es requerido');
  }

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
    data.huespedes.forEach((huesped: any, index: number) => {
      if (!huesped.nombre || typeof huesped.nombre !== 'string' || huesped.nombre.trim().length < 2) {
        errors.push(`El nombre del huésped ${index + 1} es requerido y debe tener al menos 2 caracteres`);
      }

      if (!huesped.apellido || typeof huesped.apellido !== 'string' || huesped.apellido.trim().length < 2) {
        errors.push(`El apellido del huésped ${index + 1} es requerido y debe tener al menos 2 caracteres`);
      }

      if (!huesped.email || typeof huesped.email !== 'string' || !/\S+@\S+\.\S+/.test(huesped.email)) {
        errors.push(`El email del huésped ${index + 1} es requerido y debe ser válido`);
      }

      if (!huesped.telefono || typeof huesped.telefono !== 'string' || huesped.telefono.trim().length < 10) {
        errors.push(`El teléfono del huésped ${index + 1} es requerido y debe tener al menos 10 caracteres`);
      }

      if (!huesped.documento_numero || typeof huesped.documento_numero !== 'string' || huesped.documento_numero.trim().length < 5) {
        errors.push(`El documento del huésped ${index + 1} es requerido y debe tener al menos 5 caracteres`);
      }

      if (!huesped.documento_tipo || !['cedula', 'pasaporte', 'tarjeta_identidad'].includes(huesped.documento_tipo)) {
        errors.push(`El tipo de documento del huésped ${index + 1} es requerido y debe ser válido`);
      }

      if (!huesped.fecha_nacimiento || typeof huesped.fecha_nacimiento !== 'string') {
        errors.push(`La fecha de nacimiento del huésped ${index + 1} es requerida`);
      }
    });
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

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Mapea la respuesta de la API externa al formato interno
 */
const mapReservaFromAPI = (reservaAPI: ExternalEditReservaResponse): IReservaTableData => {
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
    plataforma_origen: (reservaAPI.plataforma_origen as PlataformaOrigen) || 'no_especificada',
  };
};

/**
 * Edita una reserva existente
 * @param req - Request object
 * @param res - Response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false,
      message: 'Método no permitido' 
    });
  }

  try {
    const reservaData = req.body;

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

    // Antes de enviar a la API externa, revertir a los campos que espera la API externa
    let externalBody = { ...reservaData };
    // Si el frontend envió fecha_inicio/fecha_fin, mantenerlos; si no, mapear desde fecha_inicio/fecha_fin
    if (!externalBody.fecha_inicio && externalBody.fecha_inicio) {
      externalBody.fecha_inicio = externalBody.fecha_inicio;
    }
    if (!externalBody.fecha_fin && externalBody.fecha_fin) {
      externalBody.fecha_fin = externalBody.fecha_fin;
    }

    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    
    try {
      const response = await fetch(`${apiUrl}/reservas/${externalBody.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(externalBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      const updatedReserva = mapReservaFromAPI(apiResponse.data);

      console.log('✏️ Reserva actualizada exitosamente:', updatedReserva.codigo_reserva);
      
      res.status(200).json({
        success: true,
        data: updatedReserva,
        message: 'Reserva actualizada exitosamente'
      });
    } catch (apiError) {
      console.error('❌ Error al actualizar reserva en API externa:', apiError);
      throw new Error(`Error al actualizar reserva: ${apiError instanceof Error ? apiError.message : 'Error desconocido'}`);
    }

  } catch (error) {
    console.error('❌ Error in editReserva API:', error);
    
    res.status(500).json({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
