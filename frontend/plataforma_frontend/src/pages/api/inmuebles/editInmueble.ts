import type { NextApiRequest, NextApiResponse } from 'next';
import { IInmueble } from '../../../interfaces/Inmueble';

// Interfaz para el body que enviaremos a la API externa
interface ExternalInmuebleEditRequest {
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  capacidad?: number;
  edificio?: string;
  apartamento?: string;
  id_prod_sigo?: string;
  comision?: number;
  precio_limpieza?: number;
  capacidad_maxima?: number;
  nro_habitaciones?: number;
  nro_bahnos?: number;
  cocina?: boolean;
  id_propietario?: number;
  id_empresa?: number;
  tipo_acomodacion?: string;
  especificacion_acomodacion?: string;
  rnt?: string;
  tra_token?: string;
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
  tipo_acomodacion: string | null;
  especificacion_acomodacion: string | null;
  rnt: string | null;
  tra_token: string | null;
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
    if (typeof inmuebleData.nombre !== 'string' || inmuebleData.nombre.trim() === '') {
      errors.push('El nombre del inmueble no puede estar vacío y debe ser un texto');
    }
  }

  if (inmuebleData.descripcion !== undefined) {
    if (typeof inmuebleData.descripcion !== 'string' || inmuebleData.descripcion.trim() === '') {
      errors.push('La descripción del inmueble no puede estar vacía y debe ser un texto');
    }
  }

  if (inmuebleData.direccion !== undefined) {
    if (typeof inmuebleData.direccion !== 'string' || inmuebleData.direccion.trim() === '') {
      errors.push('La dirección del inmueble no puede estar vacía y debe ser un texto');
    }
  }

  if (inmuebleData.ciudad !== undefined) {
    if (typeof inmuebleData.ciudad !== 'string' || inmuebleData.ciudad.trim() === '') {
      errors.push('La ciudad del inmueble no puede estar vacía y debe ser un texto');
    }
  }

  if (inmuebleData.edificio !== undefined) {
    if (typeof inmuebleData.edificio !== 'string' || inmuebleData.edificio.trim() === '') {
      errors.push('El edificio no puede estar vacío y debe ser un texto');
    }
  }

  if (inmuebleData.apartamento !== undefined) {
    if (typeof inmuebleData.apartamento !== 'string' || inmuebleData.apartamento.trim() === '') {
      errors.push('El apartamento no puede estar vacío y debe ser un texto');
    }
  }

  // Validaciones numéricas
  if (inmuebleData.capacidad_maxima !== undefined) {
    const capacidadMaxima = Number(inmuebleData.capacidad_maxima);
    if (isNaN(capacidadMaxima) || capacidadMaxima <= 0) {
      errors.push('La capacidad máxima debe ser un número mayor a 0');
    }
  }

  if (inmuebleData.habitaciones !== undefined) {
    const habitaciones = Number(inmuebleData.habitaciones);
    if (isNaN(habitaciones) || habitaciones < 0) {
      errors.push('El número de habitaciones debe ser un número mayor o igual a 0');
    }
  }

  if (inmuebleData.banos !== undefined) {
    const banos = Number(inmuebleData.banos);
    if (isNaN(banos) || banos <= 0) {
      errors.push('El número de baños debe ser un número mayor a 0');
    }
  }

  if (inmuebleData.precio_limpieza !== undefined) {
    const precioLimpieza = Number(inmuebleData.precio_limpieza);
    if (isNaN(precioLimpieza) || precioLimpieza < 0) {
      errors.push('El precio de limpieza debe ser un número mayor o igual a 0');
    }
  }

  if (inmuebleData.comision !== undefined) {
    const comision = Number(inmuebleData.comision);
    if (isNaN(comision) || comision <= 0) {
      errors.push('La comisión debe ser un número mayor a 0');
    }
  }

  if (inmuebleData.id_propietario !== undefined && inmuebleData.id_propietario !== null && inmuebleData.id_propietario !== '') {
    const idPropietario = Number(inmuebleData.id_propietario);
    if (isNaN(idPropietario) || idPropietario <= 0) {
      errors.push('El ID del propietario debe ser un número mayor a 0');
    }
  }

  if (inmuebleData.id_empresa !== undefined && inmuebleData.id_empresa !== null && inmuebleData.id_empresa !== '') {
    const idEmpresa = Number(inmuebleData.id_empresa);
    if (isNaN(idEmpresa) || idEmpresa <= 0) {
      errors.push('El ID de la empresa debe ser un número mayor a 0');
    }
  }

  if (inmuebleData.rnt !== undefined) {
    if (typeof inmuebleData.rnt !== 'string' || inmuebleData.rnt.trim() === '') {
      errors.push('El RNT no puede estar vacío y debe ser un texto');
    }
  }

  if (inmuebleData.tra_token !== undefined) {
    if (typeof inmuebleData.tra_token !== 'string' || inmuebleData.tra_token.trim() === '') {
      errors.push('El TRA Token no puede estar vacío y debe ser un texto');
    }
  }

  return errors;
};

// Función para mapear datos del frontend al formato de la API externa (solo campos editables)
const mapToExternalEditFormat = (inmuebleData: any): ExternalInmuebleEditRequest => {
  const mapped: ExternalInmuebleEditRequest = {};

  // Solo incluir campos que están presentes y son editables
  if (inmuebleData.nombre !== undefined && inmuebleData.nombre !== null) mapped.nombre = String(inmuebleData.nombre).trim();
  if (inmuebleData.descripcion !== undefined && inmuebleData.descripcion !== null) mapped.descripcion = String(inmuebleData.descripcion).trim();
  if (inmuebleData.direccion !== undefined && inmuebleData.direccion !== null) mapped.direccion = String(inmuebleData.direccion).trim();
  if (inmuebleData.ciudad !== undefined && inmuebleData.ciudad !== null) mapped.ciudad = String(inmuebleData.ciudad).trim();
  if (inmuebleData.edificio !== undefined && inmuebleData.edificio !== null) mapped.edificio = String(inmuebleData.edificio).trim();
  if (inmuebleData.apartamento !== undefined && inmuebleData.apartamento !== null) mapped.apartamento = String(inmuebleData.apartamento).trim();
  if (inmuebleData.comision !== undefined && inmuebleData.comision !== null) mapped.comision = Number(inmuebleData.comision);
  if (inmuebleData.precio_limpieza !== undefined && inmuebleData.precio_limpieza !== null) mapped.precio_limpieza = Number(inmuebleData.precio_limpieza);
  if (inmuebleData.capacidad_maxima !== undefined && inmuebleData.capacidad_maxima !== null) {
    mapped.capacidad_maxima = Number(inmuebleData.capacidad_maxima);
    mapped.capacidad = Number(inmuebleData.capacidad_maxima); // La API externa usa 'capacidad'
  }
  if (inmuebleData.habitaciones !== undefined && inmuebleData.habitaciones !== null) mapped.nro_habitaciones = Number(inmuebleData.habitaciones);
  if (inmuebleData.banos !== undefined && inmuebleData.banos !== null) mapped.nro_bahnos = Number(inmuebleData.banos);
  if (inmuebleData.tiene_cocina !== undefined && inmuebleData.tiene_cocina !== null) mapped.cocina = Boolean(inmuebleData.tiene_cocina);
  if (inmuebleData.id_producto_sigo !== undefined && inmuebleData.id_producto_sigo !== null) mapped.id_prod_sigo = String(inmuebleData.id_producto_sigo).trim();
  if (inmuebleData.id_propietario !== undefined && inmuebleData.id_propietario !== null && inmuebleData.id_propietario !== '') mapped.id_propietario = Number(inmuebleData.id_propietario);
  if (inmuebleData.id_empresa !== undefined && inmuebleData.id_empresa !== null && inmuebleData.id_empresa !== '') mapped.id_empresa = Number(inmuebleData.id_empresa);
  if (inmuebleData.tipo_acomodacion !== undefined && inmuebleData.tipo_acomodacion !== null) mapped.tipo_acomodacion = String(inmuebleData.tipo_acomodacion).trim();
  if (inmuebleData.especificacion_acomodacion !== undefined && inmuebleData.especificacion_acomodacion !== null) mapped.especificacion_acomodacion = String(inmuebleData.especificacion_acomodacion).trim();
  if (inmuebleData.rnt !== undefined && inmuebleData.rnt !== null) mapped.rnt = String(inmuebleData.rnt).trim();
  if (inmuebleData.tra_token !== undefined && inmuebleData.tra_token !== null) mapped.tra_token = String(inmuebleData.tra_token).trim();

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
    comision: inmuebleAPI.comision ?? 0, // El valor ya viene como porcentaje
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
    nombre_empresa: inmuebleAPI.empresa_nombre || 'Sin empresa',
    fecha_creacion: new Date().toISOString(), // Mock ya que no viene de la API
    fecha_actualizacion: new Date().toISOString(),
    tipo_acomodacion: inmuebleAPI.tipo_acomodacion || 'Sin tipo de acomodación',
    especificacion_acomodacion: inmuebleAPI.especificacion_acomodacion || 'Sin especificación de acomodación',
    rnt: inmuebleAPI.rnt || 'Sin RNT',
    tra_token: inmuebleAPI.tra_token || 'Sin TRA Token',
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
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const parsedError = JSON.parse(errorText);
      if (parsedError.error && parsedError.error.name === 'ZodError') {
        const zodErrors = parsedError.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        errorMessage = `Validation Error: ${zodErrors}`;
      } else if (parsedError.message) {
        errorMessage = parsedError.message;
      }
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(`BACKEND_ERROR: ${errorMessage}`);
  }

  const externalData: ExternalApiResponse = await response.json();

  return externalData;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido. Solo se permite PUT.'
    });
  }

  try {
    const { id, ...inmuebleData } = req.body;

    // Validar los datos del inmueble
    const validationErrors = validateInmuebleEditData({ id, ...inmuebleData });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validationErrors
      });
    }

    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    // Convertir ID a string para asegurar consistencia
    const inmuebleId = String(id);

    // Mapear los datos al formato esperado por la API externa
    const externalFormatData = mapToExternalEditFormat(inmuebleData);

    // Realizar la llamada a la API externa
    const externalData = await callExternalEditAPI(inmuebleId, externalFormatData, token, apiUrl);

    // Verificar si la API externa retornó error
    if (externalData.isError) {
      return res.status(400).json({
        success: false,
        message: externalData.message || 'Error actualizando inmueble desde la API externa'
      });
    }

    // Mapear la respuesta al formato esperado por el frontend
    try {
      const inmuebleActualizado = mapInmuebleFromAPI(externalData.data);

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
      // Error de red o HTTP proveniente de la API externa
      if (error.message.includes('BACKEND_ERROR:')) {
        return res.status(502).json({
          success: false,
          message: error.message.replace('BACKEND_ERROR: ', '')
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
