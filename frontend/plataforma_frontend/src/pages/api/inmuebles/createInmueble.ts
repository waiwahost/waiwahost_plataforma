import type { NextApiRequest, NextApiResponse } from 'next';
import { IInmueble, IInmuebleForm } from '../../../interfaces/Inmueble';

// Interfaz para el body que espera la API externa
interface ExternalInmuebleCreateRequest {
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  capacidad: number;
  id_propietario: number;
  id_empresa: number;
  edificio: string;
  apartamento: string;
  id_prod_sigo: string;
  comision: number;
  precio_limpieza: number;
  capacidad_maxima: number;
  nro_habitaciones: number;
  nro_bahnos: number;
  cocina: boolean;
  rnt: string;
  tra_token: string;
  tipo_acomodacion: string;
  especificacion_acomodacion: string;
  area_m2: number;
  parent_id: number | null;
  tipo_registro: 'edificio' | 'unidad' | 'independiente';
}

// Interfaz para la respuesta de la API externa
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
  rnt: string | null;
  tra_token: string | null;
  tipo_acomodacion: string | null;
  especificacion_acomodacion: string | null;
  area_m2: string | number | null;
  parent_id: number | string | null;
  tipo_registro: 'edificio' | 'unidad' | 'independiente' | null;
}

interface ExternalApiResponse {
  isError: boolean;
  data: ExternalInmuebleResponse;
  message?: string;
}

// Función para validar los datos del inmueble
const validateInmuebleData = (inmuebleData: any): string[] => {
  const errors: string[] = [];

  // Campos obligatorios
  if (!inmuebleData.nombre || inmuebleData.nombre.trim() === '') {
    errors.push('El nombre del inmueble es obligatorio');
  }

  //if (!inmuebleData.descripcion || inmuebleData.descripcion.trim() === '') {
  //  errors.push('La descripción del inmueble es obligatoria');
  //}

  if (!inmuebleData.direccion || inmuebleData.direccion.trim() === '') {
    errors.push('La dirección del inmueble es obligatoria');
  }

  if (!inmuebleData.ciudad || inmuebleData.ciudad.trim() === '') {
    errors.push('La ciudad del inmueble es obligatoria');
  }


  if (!inmuebleData.tipo_acomodacion || inmuebleData.tipo_acomodacion.trim() === '') {
    errors.push('El tipo de acomodación es obligatorio');
  }
  if (!inmuebleData.especificacion_acomodacion || inmuebleData.especificacion_acomodacion.trim() === '') {
    errors.push('La especificación del inmueble es obligatoria');
  }

  if (!inmuebleData.especificacion_acomodacion || inmuebleData.especificacion_acomodacion.trim() === '') {
    if (inmuebleData.tipo_acomodacion !== 'Apartamento') {
      errors.push('La especificación del inmueble es obligatoria');
    }
  }

  if (!inmuebleData.rnt || inmuebleData.rnt.trim() === '') {
    errors.push('El RNT es obligatorio');
  }

  if (!inmuebleData.tra_token || inmuebleData.tra_token.trim() === '') {
    errors.push('El TRA Token es obligatorio');
  }

  if (!inmuebleData.id_producto_sigo || inmuebleData.id_producto_sigo.trim() === '') {
    errors.push('El ID de producto Sigo es obligatorio');
  }

  // Validaciones numéricas
  if (!inmuebleData.capacidad_maxima || Number(inmuebleData.capacidad_maxima) <= 0) {
    errors.push('La capacidad máxima debe ser mayor a 0');
  }

  if (inmuebleData.habitaciones === undefined || Number(inmuebleData.habitaciones) < 0) {
    errors.push('El número de habitaciones debe ser mayor o igual a 0');
  }

  if (!inmuebleData.banos || Number(inmuebleData.banos) <= 0) {
    errors.push('El número de baños debe ser mayor a 0');
  }

  if (inmuebleData.precio_limpieza === undefined || Number(inmuebleData.precio_limpieza) < 0) {
    errors.push('El precio de limpieza debe ser mayor o igual a 0');
  }

  if (!inmuebleData.comision || Number(inmuebleData.comision) <= 0) {
    errors.push('La comisión debe ser mayor a 0');
  }

  if (!inmuebleData.id_propietario || Number(inmuebleData.id_propietario) <= 0) {
    errors.push('El ID del propietario es obligatorio');
  }

  if (!inmuebleData.id_empresa || Number(inmuebleData.id_empresa) <= 0) {
    errors.push('El ID de la empresa es obligatorio');
  }

  return errors;
};

// Función para mapear datos del frontend al formato de la API externa
const mapToExternalFormat = (inmuebleData: any): ExternalInmuebleCreateRequest => {
  return {
    nombre: inmuebleData.nombre.trim(),
    descripcion: inmuebleData.descripcion.trim(),
    direccion: inmuebleData.direccion.trim(),
    ciudad: inmuebleData.ciudad.trim(),
    capacidad: Number(inmuebleData.capacidad_maxima),
    id_propietario: Number(inmuebleData.id_propietario),
    id_empresa: Number(inmuebleData.id_empresa),
    edificio: inmuebleData.edificio.trim(),
    apartamento: inmuebleData.apartamento.trim(),
    id_prod_sigo: inmuebleData.id_producto_sigo.trim(),
    comision: Number(inmuebleData.comision),
    precio_limpieza: Number(inmuebleData.precio_limpieza || 0),
    capacidad_maxima: Number(inmuebleData.capacidad_maxima),
    nro_habitaciones: Number(inmuebleData.habitaciones),
    nro_bahnos: Number(inmuebleData.banos),
    cocina: Boolean(inmuebleData.tiene_cocina),
    rnt: inmuebleData.rnt.trim(),
    tra_token: inmuebleData.tra_token.trim(),
    tipo_acomodacion: inmuebleData.tipo_acomodacion.trim(),
    especificacion_acomodacion: inmuebleData.especificacion_acomodacion.trim(),
    area_m2: Number(inmuebleData.area_m2 || 0),
    parent_id: inmuebleData.parent_id ? Number(inmuebleData.parent_id) : null,
    tipo_registro: inmuebleData.tipo_registro || 'independiente'
  };
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
    comision: inmuebleAPI.comision ?? 0,
    id_propietario: (inmuebleAPI.id_propietario ?? 0).toString(),
    tipo: mapTipoInmueble(inmuebleAPI.nombre),
    estado: mapEstadoInmueble(inmuebleAPI.estado),
    precio: 0,
    precio_limpieza: inmuebleAPI.precio_limpieza ?? 0,
    id_producto_sigo: inmuebleAPI.id_prod_sigo || 'SIN_ID',
    descripcion: inmuebleAPI.descripcion || 'Sin descripción',
    capacidad_maxima: inmuebleAPI.capacidad_maxima ?? inmuebleAPI.capacidad ?? 1,
    habitaciones: inmuebleAPI.nro_habitaciones ?? 1,
    banos: inmuebleAPI.nro_bahnos ?? 1,
    area_m2: parseFloat(inmuebleAPI.area_m2?.toString() || '0'),
    tiene_cocina: inmuebleAPI.cocina ?? false,
    id_empresa: (inmuebleAPI.id_empresa ?? 0).toString(),
    nombre_empresa: inmuebleAPI.empresa_nombre || 'Sin empresa',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    rnt: inmuebleAPI.rnt || 'SIN_RNT',
    tra_token: inmuebleAPI.tra_token || 'SIN_TRA_TOKEN',
    tipo_acomodacion: inmuebleAPI.tipo_acomodacion || 'SIN_TIPO_ACOMODACION',
    especificacion_acomodacion: inmuebleAPI.especificacion_acomodacion || 'SIN_ESPECIFICACION_ACOMODACION',
    parent_id: inmuebleAPI.parent_id ? parseInt(inmuebleAPI.parent_id.toString(), 10) : null,
    tipo_registro: inmuebleAPI.tipo_registro || 'independiente'
  };
};

// Funciones auxiliares (reutilizadas de getInmuebles.ts)
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido. Solo se permite POST.'
    });
  }

  try {
    const inmuebleData = req.body;

    // Validar los datos del inmueble
    const validationErrors = validateInmuebleData(inmuebleData);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validationErrors
      });
    }

    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    // Mapear los datos al formato esperado por la API externa
    const externalFormatData = mapToExternalFormat(inmuebleData);

    // Realizar la llamada a la API externa
    const response = await fetch(`${apiUrl}/inmuebles/createInmueble`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(externalFormatData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const externalData: ExternalApiResponse = await response.json();


    // Verificar si la API externa retornó error
    if (externalData.isError) {
      return res.status(400).json({
        success: false,
        message: externalData.message || 'Error desde la API externa'
      });
    }

    // Mapear la respuesta al formato esperado por el frontend
    try {
      const nuevoInmueble = mapInmuebleFromAPI(externalData.data);

      res.status(201).json({
        success: true,
        data: nuevoInmueble,
        message: 'Inmueble creado exitosamente'
      });
    } catch (mapError) {
      console.error('❌ Error mapping created inmueble:', mapError);
      console.error('📄 Problematic inmueble data:', externalData.data);

      return res.status(500).json({
        success: false,
        message: 'Error procesando respuesta del inmueble creado'
      });
    }

  } catch (error) {
    console.error('❌ Error in createInmueble API:', error);

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
