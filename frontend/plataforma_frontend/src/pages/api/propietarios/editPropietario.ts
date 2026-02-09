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
    estado: propietarioAPI.estado === 'activo' ? 'activo' : 'inactivo',
    id_empresa: propietarioAPI.id_empresa || 1,
    inmuebles: Array.isArray(propietarioAPI.inmuebles) ? propietarioAPI.inmuebles : []
  };
};

// Interface para los campos editables (sin cedula y username)
interface IPropietarioEditableFields {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  estado?: 'activo' | 'inactivo';
  id_empresa?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      isError: true,
      data: null,
      message: 'Método no permitido'
    });
  }

  try {
    const { id } = req.query;
    const propietarioData = req.body;

    if (!id) {
      return res.status(400).json({
        isError: true,
        data: null,
        message: 'ID del propietario es requerido'
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

    // Filtrar solo los campos editables (excluir cedula y username)
    const editableFields: IPropietarioEditableFields = {};

    if (propietarioData.nombre !== undefined) editableFields.nombre = propietarioData.nombre;
    if (propietarioData.apellido !== undefined) editableFields.apellido = propietarioData.apellido;
    if (propietarioData.email !== undefined) editableFields.email = propietarioData.email;
    if (propietarioData.telefono !== undefined) editableFields.telefono = propietarioData.telefono;
    if (propietarioData.direccion !== undefined) editableFields.direccion = propietarioData.direccion;
    if (propietarioData.estado !== undefined) editableFields.estado = propietarioData.estado;
    if (propietarioData.id_empresa !== undefined) editableFields.id_empresa = propietarioData.id_empresa;

    // Validar que al menos un campo editable esté presente
    if (Object.keys(editableFields).length === 0) {
      return res.status(400).json({
        isError: true,
        data: null,
        message: 'Al menos un campo editable debe ser proporcionado'
      });
    }

    // Hacer la llamada a la API externa
    const response = await fetch(`${apiUrl}/propietarios/editPropietario?id=${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editableFields),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const externalData = await response.json();

    // Verificar si la API externa retornó error
    if (externalData.isError) {
      return res.status(externalData.code || 400).json({
        isError: true,
        data: null,
        message: externalData.message || 'Error desde la API externa'
      });
    }

    // Mapear la respuesta al formato esperado por el frontend
    const updatedPropietario = mapPropietarioFromAPI(externalData.data);

    res.status(200).json({
      isError: false,
      data: updatedPropietario,
      message: 'Propietario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error in editPropietario API:', error);

    res.status(500).json({
      isError: true,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
