import { NextApiRequest, NextApiResponse } from 'next';
import { IPropietarioTableData } from '../../../interfaces/Propietario';

// Función para mapear la respuesta de la API externa a nuestro formato
const mapPropietarioFromAPI = (propietarioAPI: any): IPropietarioTableData => {
  return {
    id: propietarioAPI.id,
    nombre: propietarioAPI.nombre || 'Sin nombre',
    apellido: propietarioAPI.apellido || 'Sin apellido',
    email: propietarioAPI.email || 'Sin email',
    telefono: propietarioAPI.telefono || 'Sin teléfono',
    direccion: propietarioAPI.direccion || 'Sin dirección',
    cedula: propietarioAPI.cedula || 'Sin cédula',
    fecha_registro: propietarioAPI.fecha_registro ? 
      new Date(propietarioAPI.fecha_registro).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0],
    estado: propietarioAPI.estado ? 'activo' : 'inactivo',
    id_empresa: propietarioAPI.id_empresa || 1,
    inmuebles: Array.isArray(propietarioAPI.inmuebles) ? propietarioAPI.inmuebles : []
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      isError: true,
      data: null,
      message: 'Método no permitido'
    });
  }

  try {
    const { id_empresa } = req.query;
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    
    console.log('Calling external API:', `${apiUrl}/propietarios/getPropietarios`);
    
    // Hacer la llamada a la API externa
    const response = await fetch(`${apiUrl}/propietarios/getPropietarios`, {
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
    console.log('External API response:', externalData);

    // Verificar si la API externa retornó error
    if (externalData.isError) {
      return res.status(400).json({
        isError: true,
        data: null,
        message: externalData.message || 'Error desde la API externa'
      });
    }

    // Mapear los datos al formato esperado por el frontend
    let propietarios = externalData.data.map(mapPropietarioFromAPI);

    // Filtrar por empresa si se proporciona
    if (id_empresa) {
      propietarios = propietarios.filter(
        (prop: IPropietarioTableData) => prop.id_empresa === parseInt(id_empresa as string)
      );
    }

    console.log('Mapped propietarios:', propietarios);

    res.status(200).json({
      isError: false,
      data: propietarios,
      message: 'Propietarios obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error in getPropietarios API:', error);
    
    res.status(500).json({
      isError: true,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
