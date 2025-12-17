import type { NextApiRequest, NextApiResponse } from 'next';
import { IInmueble, IInmuebleForm } from '../../../interfaces/Inmueble';

// Interfaz para el body que enviaremos a la API externa
interface ExternalInmuebleEditRequest {
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  capacidad?: number;
  edificio?: string;
  apartamento?: string;
  comision?: number;
  precio_limpieza?: number;
  capacidad_maxima?: number;
  nro_habitaciones?: number;
  nro_bahnos?: number;
  cocina?: boolean;
  id_propietario?: number;
  id_empresa?: number;
}

// Interfaz para la respuesta de la API externa
interface ExternalInmuebleResponse {
  id_inmueble: number;
  nombre: string | null;
  descripcion: string | null;
  direccion: string | null;
  ciudad: string | null;
  capacidad: number | null;
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

// Función para validar los datos del inmueble
const validateInmuebleEditData = (inmuebleData: any): string[] => {
  const errors: string[] = [];

  // Validar ID
  if (!inmuebleData.id) {
    errors.push('El ID del inmueble es obligatorio');
    return errors;
  }

  // Solo validar campos que están presentes (actualización parcial)
  if (inmuebleData.nombre !== undefined) {
    if (!inmuebleData.nombre || inmuebleData.nombre.trim() === '') {
      errors.push('El nombre del inmueble no puede estar vacío');
    }
  }

  if (inmuebleData.descripcion !== undefined) {
    if (!inmuebleData.descripcion || inmuebleData.descripcion.trim() === '') {
      errors.push('La descripción del inmueble no puede estar vacía');
    }
  }

  if (inmuebleData.direccion !== undefined) {
    if (!inmuebleData.direccion || inmuebleData.direccion.trim() === '') {
      errors.push('La dirección del inmueble no puede estar vacía');
    }
  }

  if (inmuebleData.ciudad !== undefined) {
    if (!inmuebleData.ciudad || inmuebleData.ciudad.trim() === '') {
      errors.push('La ciudad del inmueble no puede estar vacía');
    }
  }

  if (inmuebleData.edificio !== undefined) {
    if (!inmuebleData.edificio || inmuebleData.edificio.trim() === '') {
      errors.push('El edificio no puede estar vacío');
    }
  }

  if (inmuebleData.apartamento !== undefined) {
    if (!inmuebleData.apartamento || inmuebleData.apartamento.trim() === '') {
      errors.push('El apartamento no puede estar vacío');
    }
  }

  // Validaciones numéricas
  if (inmuebleData.capacidad_maxima !== undefined) {
    if (Number(inmuebleData.capacidad_maxima) <= 0) {
      errors.push('La capacidad máxima debe ser mayor a 0');
    }
  }

  if (inmuebleData.habitaciones !== undefined) {
    if (Number(inmuebleData.habitaciones) < 0) {
      errors.push('El número de habitaciones debe ser mayor o igual a 0');
    }
  }

  if (inmuebleData.banos !== undefined) {
    if (Number(inmuebleData.banos) <= 0) {
      errors.push('El número de baños debe ser mayor a 0');
    }
  }

  if (inmuebleData.precio_limpieza !== undefined) {
    if (Number(inmuebleData.precio_limpieza) < 0) {
      errors.push('El precio de limpieza debe ser mayor o igual a 0');
    }
  }

  if (inmuebleData.comision !== undefined) {
    if (Number(inmuebleData.comision) <= 0) {
      errors.push('La comisión debe ser mayor a 0');
    }
  }

  return errors;
};

// Función para mapear datos del frontend al formato de la API externa (solo campos editables)
const mapToExternalEditFormat = (inmuebleData: any): ExternalInmuebleEditRequest => {
  const mapped: ExternalInmuebleEditRequest = {};

  // Solo incluir campos que están presentes y son editables
  if (inmuebleData.nombre !== undefined) mapped.nombre = inmuebleData.nombre.trim();
  if (inmuebleData.descripcion !== undefined) mapped.descripcion = inmuebleData.descripcion.trim();
  if (inmuebleData.direccion !== undefined) mapped.direccion = inmuebleData.direccion.trim();
  if (inmuebleData.ciudad !== undefined) mapped.ciudad = inmuebleData.ciudad.trim();
  if (inmuebleData.edificio !== undefined) mapped.edificio = inmuebleData.edificio.trim();
  if (inmuebleData.apartamento !== undefined) mapped.apartamento = inmuebleData.apartamento.trim();
  if (inmuebleData.comision !== undefined) mapped.comision = Number(inmuebleData.comision);
  if (inmuebleData.precio_limpieza !== undefined) mapped.precio_limpieza = Number(inmuebleData.precio_limpieza);
  if (inmuebleData.capacidad_maxima !== undefined) {
    mapped.capacidad_maxima = Number(inmuebleData.capacidad_maxima);
    mapped.capacidad = Number(inmuebleData.capacidad_maxima); // La API externa usa 'capacidad'
  }
  if (inmuebleData.habitaciones !== undefined) mapped.nro_habitaciones = Number(inmuebleData.habitaciones);
  if (inmuebleData.banos !== undefined) mapped.nro_bahnos = Number(inmuebleData.banos);
  if (inmuebleData.tiene_cocina !== undefined) mapped.cocina = Boolean(inmuebleData.tiene_cocina);

  return mapped;
};

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
    //id_propietario: (inmuebleAPI.id_propietario ?? 0).toString(),
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
    //id_empresa: (inmuebleAPI.id_empresa ?? 0).toString(),
    nombre_empresa: inmuebleAPI.empresa_nombre || 'Sin empresa',
    fecha_creacion: new Date().toISOString(), // Mock ya que no viene de la API
    fecha_actualizacion: new Date().toISOString()
  };
};

// Funciones auxiliares reutilizadas
const mapTipoInmueble = (nombre: string | null): 'apartamento' | 'casa' | 'studio' | 'penthouse' | 'oficina' | 'local' => {
  if (!nombre) return 'apartamento';

  const nombreLower = nombre.toLowerCase();
  if (nombreLower.includes('apartamento')) return 'apartamento';
  if (nombreLower.includes('casa')) return 'casa';
  if (nombreLower.includes('studio') || nombreLower.includes('estudio')) return 'studio';
  if (nombreLower.includes('penthouse') || nombreLower.includes('pent')) return 'penthouse';
  if (nombreLower.includes('oficina')) return 'oficina';
  if (nombreLower.includes('local')) return 'local';
  return 'apartamento';
};

const mapEstadoInmueble = (estado: string | null): 'disponible' | 'ocupado' | 'mantenimiento' | 'inactivo' => {
  if (!estado) return 'disponible';

  const estadoLower = estado.toLowerCase();
  if (estadoLower === 'activo') return 'disponible';
  if (estadoLower === 'ocupado') return 'ocupado';
  if (estadoLower === 'mantenimiento') return 'mantenimiento';
  if (estadoLower === 'inactivo') return 'inactivo';
  return 'disponible';
};

const generateMockPrice = (capacidad: number | null): number => {
  const basePrice = 500000;
  const safeCapacidad = capacidad ?? 1;
  return basePrice + (safeCapacidad * 150000);
};

const generateMockArea = (habitaciones: number | null): number => {
  const baseArea = 35;
  const safeHabitaciones = habitaciones ?? 1;
  return baseArea + (safeHabitaciones * 25);
};

// Función para realizar la llamada a la API externa
const callExternalEditAPI = async (inmuebleId: string, editData: ExternalInmuebleEditRequest, token: string, apiUrl: string): Promise<ExternalApiResponse> => {
  console.log('🚀 Calling external edit API:', `${apiUrl}/inmuebles/editInmueble?id=${inmuebleId}`);
  console.log('🔑 Using token:', token ? 'Token present' : 'No token');
  console.log('📤 Sending edit data:', editData);

  const response = await fetch(`${apiUrl}/inmuebles/editInmueble?id=${inmuebleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(editData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }

  const externalData: ExternalApiResponse = await response.json();

  console.log('📥 External API response:', {
    isError: externalData.isError,
    hasData: !!externalData.data,
    message: externalData.message
  });

  return externalData;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔄 EDIT INMUEBLE API CALLED');
  console.log('📥 Request method:', req.method);
  console.log('📥 Request body:', req.body);
  console.log('📥 Request headers authorization:', req.headers.authorization ? 'Present' : 'Missing');

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({
      success: false,
      message: 'Método no permitido. Solo se permite POST.'
    });
  }

  try {
    const { id, ...inmuebleData } = req.body;

    console.log('📥 Received inmueble edit request for ID:', id);
    console.log('📝 Fields to update:', Object.keys(inmuebleData));

    // Validar los datos del inmueble
    const validationErrors = validateInmuebleEditData({ id, ...inmuebleData });

    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validationErrors
      });
    }

    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    console.log('🌐 API URL:', apiUrl);
    console.log('🔑 Token status:', token ? `Token present (${token.substring(0, 10)}...)` : 'No token');

    // Convertir ID a string para asegurar consistencia
    const inmuebleId = String(id);

    // Mapear los datos al formato esperado por la API externa
    const externalFormatData = mapToExternalEditFormat(inmuebleData);

    // Realizar la llamada a la API externa
    const externalData = await callExternalEditAPI(inmuebleId, externalFormatData, token, apiUrl);

    // Verificar si la API externa retornó error
    if (externalData.isError) {
      console.log('❌ External API returned error:', externalData.message);
      return res.status(400).json({
        success: false,
        message: externalData.message || 'Error actualizando inmueble desde la API externa'
      });
    }

    // Mapear la respuesta al formato esperado por el frontend
    try {
      const inmuebleActualizado = mapInmuebleFromAPI(externalData.data);

      console.log('✅ Inmueble updated successfully:', inmuebleActualizado.id);

      res.status(200).json({
        success: true,
        data: inmuebleActualizado,
        message: externalData.message || 'Inmueble actualizado exitosamente'
      });
    } catch (mapError) {
      console.error('❌ Error mapping updated inmueble:', mapError);
      console.error('📄 Problematic inmueble data:', externalData.data);

      return res.status(500).json({
        success: false,
        message: 'Error procesando respuesta del inmueble actualizado'
      });
    }

  } catch (error) {
    console.error('❌ Error in editInmueble API:', error);

    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      // Error de red o HTTP
      if (error.message.includes('HTTP error!')) {
        return res.status(502).json({
          success: false,
          message: 'Error de comunicación con el servidor externo'
        });
      }

      // Error de parsing o estructura
      if (error.message.includes('JSON')) {
        return res.status(502).json({
          success: false,
          message: 'Error procesando respuesta del servidor externo'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
