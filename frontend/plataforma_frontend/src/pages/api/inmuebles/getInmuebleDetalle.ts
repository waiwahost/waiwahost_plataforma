import type { NextApiRequest, NextApiResponse } from 'next';
import { IInmueble } from '../../../interfaces/Inmueble';

// Interfaz para la respuesta de la API externa (un solo inmueble)
interface ExternalInmuebleResponse {
  id_inmueble: number;
  nombre: string | null;
  descripcion: string | null;
  direccion: string | null;
  ciudad: string | null;
  capacidad: number | null;
  id_propietario: number | null;
  id_empresa: number | null;
  estado: string | null;
  edificio: string | null;
  apartamento: string | null;
  id_prod_sigo: string | null;
  comision: number | null;
  precio_limpieza: number | null;
  capacidad_maxima: number | null;
  nro_habitaciones: number | null;
  nro_bahnos: number | null;
  cocina: boolean | null;
  empresa_nombre: string | null;
  propietario_nombre: string | null;
  propietario_email: string | null;
}

interface ExternalApiResponse {
  isError: boolean;
  data: ExternalInmuebleResponse;
  message?: string;
}

// Función para mapear la respuesta de la API externa a nuestro formato interno
const mapInmuebleFromAPI = (inmuebleAPI: ExternalInmuebleResponse): IInmueble => {
  return {
    id: (inmuebleAPI.id_inmueble ?? 0).toString(),
    id_inmueble: (inmuebleAPI.id_inmueble ?? 0).toString(),
    nombre: inmuebleAPI.nombre || 'Sin nombre',
    direccion: inmuebleAPI.direccion || 'Sin dirección',
    ciudad: inmuebleAPI.ciudad || 'Sin ciudad',
    edificio: inmuebleAPI.edificio || 'Sin edificio',
    apartamento: inmuebleAPI.apartamento || 'Sin apartamento',
    comision: (inmuebleAPI.comision ?? 0) * 1000, // Convertir porcentaje a valor monetario
    id_propietario: (inmuebleAPI.id_propietario ?? 0).toString(),
    tipo: mapTipoInmueble(inmuebleAPI.nombre), // Mockeo basado en el nombre
    estado: mapEstadoInmueble(inmuebleAPI.estado),
    precio: generateMockPrice(inmuebleAPI.capacidad_maxima ?? inmuebleAPI.capacidad ?? 1), // Mockeo basado en capacidad
    precio_limpieza: inmuebleAPI.precio_limpieza ?? 0,
    id_producto_sigo: inmuebleAPI.id_prod_sigo || 'SIN_ID',
    descripcion: inmuebleAPI.descripcion || 'Sin descripción',
    capacidad_maxima: inmuebleAPI.capacidad_maxima ?? inmuebleAPI.capacidad ?? 1,
    habitaciones: inmuebleAPI.nro_habitaciones ?? 1,
    banos: inmuebleAPI.nro_bahnos ?? 1,
    area: generateMockArea(inmuebleAPI.nro_habitaciones ?? 1), // Mockeo basado en habitaciones
    tiene_cocina: inmuebleAPI.cocina ?? false,
    id_empresa: (inmuebleAPI.id_empresa ?? 0).toString(),
    nombre_empresa: inmuebleAPI.empresa_nombre || 'Sin empresa',
    fecha_creacion: new Date().toISOString(), // Mockeo - no viene en la API
    fecha_actualizacion: new Date().toISOString() // Mockeo - no viene en la API
  };
};

// Función auxiliar para mapear tipo de inmueble basado en el nombre
const mapTipoInmueble = (nombre: string | null): 'apartamento' | 'casa' | 'studio' | 'penthouse' | 'oficina' | 'local' => {
  if (!nombre) return 'apartamento'; // Por defecto si es null

  const nombreLower = nombre.toLowerCase();
  if (nombreLower.includes('apartamento')) return 'apartamento';
  if (nombreLower.includes('casa')) return 'casa';
  if (nombreLower.includes('studio') || nombreLower.includes('estudio')) return 'studio';
  if (nombreLower.includes('penthouse') || nombreLower.includes('pent')) return 'penthouse';
  if (nombreLower.includes('oficina')) return 'oficina';
  if (nombreLower.includes('local')) return 'local';
  return 'apartamento'; // Por defecto
};

// Función auxiliar para mapear estado del inmueble
const mapEstadoInmueble = (estado: string | null): 'disponible' | 'ocupado' | 'mantenimiento' | 'inactivo' => {
  if (!estado) return 'disponible'; // Por defecto si es null

  const estadoLower = estado.toLowerCase();
  if (estadoLower === 'activo') return 'disponible';
  if (estadoLower === 'ocupado') return 'ocupado';
  if (estadoLower === 'mantenimiento') return 'mantenimiento';
  if (estadoLower === 'inactivo') return 'inactivo';
  return 'disponible'; // Por defecto
};

// Función auxiliar para generar precio mock basado en capacidad
const generateMockPrice = (capacidad: number | null): number => {
  const basePrice = 500000;
  const safeCapacidad = capacidad ?? 1;
  return basePrice + (safeCapacidad * 150000);
};

// Función auxiliar para generar área mock basada en habitaciones
const generateMockArea = (habitaciones: number | null): number => {
  const baseArea = 35;
  const safeHabitaciones = habitaciones ?? 1;
  return baseArea + (safeHabitaciones * 25);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de inmueble requerido'
      });
    }

    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    console.log('🚀 Calling external API for inmueble detail:', `${apiUrl}/inmuebles/getInmuebles?id=${id}`);
    console.log('🔑 Using token:', token ? 'Token present' : 'No token');

    // Realizar la llamada a la API externa
    const response = await fetch(`${apiUrl}/inmuebles/getInmuebles?id=${id}`, {
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
    console.log('📥 External API response for inmueble detail:', {
      isError: externalData.isError,
      hasData: !!externalData.data,
      message: externalData.message
    });

    // Verificar si la API externa retornó error
    if (externalData.isError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: externalData.message || 'Error desde la API externa'
      });
    }

    // Verificar si se encontró el inmueble
    if (!externalData.data) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Inmueble no encontrado'
      });
    }

    // Mapear los datos al formato esperado por el frontend
    try {
      const inmueble = mapInmuebleFromAPI(externalData.data);
      console.log('✅ Mapped inmueble detail successfully');

      res.status(200).json({
        success: true,
        data: inmueble,
        message: 'Inmueble obtenido exitosamente'
      });
    } catch (mapError) {
      console.error('❌ Error mapping inmueble detail:', mapError);
      console.error('📄 Problematic inmueble data:', externalData.data);

      return res.status(500).json({
        success: false,
        data: null,
        message: 'Error procesando datos del inmueble'
      });
    }

  } catch (error) {
    console.error('❌ Error in getInmuebleDetalle API:', error);

    res.status(500).json({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
