import { NextApiRequest, NextApiResponse } from 'next';
import { IHuespedDetailData } from '../../../interfaces/Huesped';

// Datos simulados detallados para desarrollo
const mockHuespedesDetalle = [
  {
    id_huesped: 1,
    nombre: 'Juan Carlos',
    apellido: 'Pérez González',
    documento_numero: '12345678',
    email: 'juan.perez@email.com',
    telefono: '+57 300 123 4567',
    direccion: 'Calle 123 #45-67, Bogotá, Colombia',
    fecha_nacimiento: '1985-03-15',
    estado: 'activo',
    id_empresa: 1,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-10-07T14:22:00Z'
  },
  {
    id_huesped: 2,
    nombre: 'María Elena',
    apellido: 'García Rodríguez',
    documento_numero: '23456789',
    email: 'maria.garcia@email.com',
    telefono: '+57 301 234 5678',
    direccion: 'Carrera 45 #23-12, Medellín, Colombia',
    fecha_nacimiento: '1992-07-22',
    estado: 'activo',
    id_empresa: 1,
    created_at: '2024-02-20T09:15:00Z',
    updated_at: '2024-09-30T16:45:00Z'
  },
  {
    id_huesped: 3,
    nombre: 'Carlos Alberto',
    apellido: 'López Martínez',
    documento_numero: '34567890',
    email: 'carlos.lopez@email.com',
    telefono: '+57 302 345 6789',
    direccion: 'Avenida 80 #12-34, Cali, Colombia',
    fecha_nacimiento: '1978-11-08',
    estado: 'inactivo',
    id_empresa: 1,
    created_at: '2024-03-10T11:20:00Z',
    updated_at: '2024-08-15T13:30:00Z'
  },
  {
    id_huesped: 4,
    nombre: 'Ana Sofía',
    apellido: 'Hernández Silva',
    documento_numero: '45678901',
    email: 'ana.hernandez@email.com',
    telefono: '+57 303 456 7890',
    direccion: 'Transversal 15 #67-89, Barranquilla, Colombia',
    fecha_nacimiento: '1995-05-30',
    estado: 'activo',
    id_empresa: 1,
    created_at: '2024-04-05T08:45:00Z',
    updated_at: '2024-10-01T12:15:00Z'
  },
  {
    id_huesped: 5,
    nombre: 'Roberto',
    apellido: 'Morales Castro',
    documento_numero: '56789012',
    email: 'roberto.morales@email.com',
    telefono: '+57 304 567 8901',
    direccion: 'Calle 67 #89-12, Cartagena, Colombia',
    fecha_nacimiento: '1980-12-03',
    estado: 'activo',
    id_empresa: 1,
    created_at: '2024-05-18T14:10:00Z',
    updated_at: '2024-09-25T17:20:00Z'
  },
  {
    id_huesped: 6,
    nombre: 'Patricia',
    apellido: 'Vargas Ruiz',
    documento_numero: '67890123',
    email: 'patricia.vargas@email.com',
    telefono: '+57 305 678 9012',
    direccion: 'Diagonal 34 #56-78, Bucaramanga, Colombia',
    fecha_nacimiento: '1988-09-18',
    estado: 'activo',
    id_empresa: 1,
    created_at: '2024-06-22T15:35:00Z',
    updated_at: '2024-10-05T10:50:00Z'
  }
];

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
        message: 'ID del huésped es requerido'
      });
    }


    // Simular pequeña demora
    await new Promise(resolve => setTimeout(resolve, 400));

    // Buscar el huésped en los datos simulados
    const huespedDetail = mockHuespedesDetalle.find(h => h.id_huesped === parseInt(id as string));

    if (!huespedDetail) {
      return res.status(404).json({
        isError: true,
        data: null,
        message: 'Huésped no encontrado'
      });
    }

    const mappedDetail: IHuespedDetailData = {
      id_huesped: huespedDetail.id_huesped,
      nombre: huespedDetail.nombre,
      apellido: huespedDetail.apellido,
      documento_numero: huespedDetail.documento_numero,
      email: huespedDetail.email,
      telefono: huespedDetail.telefono,
      direccion: huespedDetail.direccion,
      fecha_nacimiento: huespedDetail.fecha_nacimiento,
      estado: huespedDetail.estado as 'activo' | 'inactivo',
      id_empresa: huespedDetail.id_empresa,
      created_at: huespedDetail.created_at,
      updated_at: huespedDetail.updated_at
    };

    res.status(200).json({
      isError: false,
      data: mappedDetail,
      message: 'Detalle del huésped obtenido exitosamente (simulado)'
    });

  } catch (error) {
    console.error('Error in getHuespedDetalle API:', error);

    res.status(500).json({
      isError: true,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}