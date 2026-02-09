import { NextApiRequest, NextApiResponse } from 'next';

// Redirigir a la nueva API de inmuebles para mantener compatibilidad
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      isError: true,
      data: null,
      message: 'Método no permitido'
    });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        isError: true,
        data: null,
        message: 'ID del inmueble es requerido'
      });
    }

    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    // Realizar la llamada a la API externa (misma que usa getInmuebleDetalle)
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

    const externalData = await response.json();

    // Verificar si la API externa retornó error
    if (externalData.isError) {
      return res.status(400).json({
        isError: true,
        data: null,
        message: externalData.message || 'Error desde la API externa'
      });
    }

    // Verificar si se encontró el inmueble
    if (!externalData.data) {
      return res.status(404).json({
        isError: true,
        data: null,
        message: 'Inmueble no encontrado'
      });
    }

    // Convertir el formato de respuesta de inmuebles al formato esperado por propietarios
    const inmuebleFormatted = {
      id: externalData.data.id_inmueble?.toString() || 'sin_id',
      nombre: externalData.data.nombre || 'Sin nombre',
      direccion: externalData.data.direccion || 'Sin dirección',
      tipo: externalData.data.tipo || 'apartamento',
      estado: externalData.data.estado || 'disponible',
      precio: externalData.data.precio || 0,
      descripcion: externalData.data.descripcion || 'Sin descripción',
      habitaciones: externalData.data.nro_habitaciones || 1,
      banos: externalData.data.nro_bahnos || 1,
      area: externalData.data.area || 0,
      id_propietario: externalData.data.id_propietario || 0,
      fecha_creacion: new Date().toISOString().split('T')[0],
      fecha_actualizacion: new Date().toISOString().split('T')[0]
    };

    res.status(200).json({
      isError: false,
      data: inmuebleFormatted,
      message: 'Detalle del inmueble obtenido exitosamente'
    });

  } catch (error) {
    console.error('❌ Error in legacy getInmuebleDetalle API:', error);

    res.status(500).json({
      isError: true,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
