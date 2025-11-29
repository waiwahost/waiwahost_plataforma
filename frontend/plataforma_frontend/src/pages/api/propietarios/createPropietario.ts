import { NextApiRequest, NextApiResponse } from 'next';
import { IPropietarioForm, IPropietarioTableData } from '../../../interfaces/Propietario';

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
    estado: propietarioAPI.estado === 'activo' ? 'activo' : 'inactivo',
    id_empresa: propietarioAPI.id_empresa || 1,
    inmuebles: Array.isArray(propietarioAPI.inmuebles) ? propietarioAPI.inmuebles : []
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      isError: true,
      data: null,
      message: 'Método no permitido'
    });
  }

  try {
    const propietarioData: IPropietarioForm = req.body;

    // Validaciones básicas
    if (!propietarioData.nombre || !propietarioData.apellido || !propietarioData.email || !propietarioData.cedula) {
      return res.status(400).json({
        isError: true,
        data: null,
        message: 'Faltan campos obligatorios: nombre, apellido, email, cedula'
      });
    }

    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        isError: true,
        data: null,
        message: 'No autorizado: token faltante'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const apiUrl = process.env.API_URL || 'http://localhost:3001';

    console.log('Creating propietario with data:', propietarioData);
    console.log('Calling external API:', `${apiUrl}/propietarios/createPropietario`);

    // Preparar el body para la API externa
    const bodyForExternalAPI = {
      nombre: propietarioData.nombre,
      apellido: propietarioData.apellido,
      email: propietarioData.email,
      telefono: propietarioData.telefono,
      direccion: propietarioData.direccion,
      cedula: propietarioData.cedula,
      estado: propietarioData.estado,
      id_empresa: propietarioData.id_empresa
    };
    console.log('Token: ' + token);

    // Hacer la llamada a la API externa
    const response = await fetch(`${apiUrl}/propietarios/createPropietario`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyForExternalAPI),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const externalData = await response.json();
    console.log('External API response:', externalData);

    // Verificar si la API externa retornó error
    if (externalData.isError) {
      return res.status(externalData.code || 400).json({
        isError: true,
        data: null,
        message: externalData.message || 'Error desde la API externa'
      });
    }

    // Mapear la respuesta al formato esperado por el frontend
    const newPropietario = mapPropietarioFromAPI(externalData.data);

    console.log('Mapped propietario:', newPropietario);

    res.status(201).json({
      isError: false,
      data: newPropietario,
      message: 'Propietario creado exitosamente'
    });

  } catch (error) {
    console.error('Error in createPropietario API:', error);
    
    res.status(500).json({
      isError: true,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
