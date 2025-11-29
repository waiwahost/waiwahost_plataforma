import { NextApiRequest, NextApiResponse } from 'next';

// Data mockeada para inmuebles
const mockInmuebles = {
  'INM001': {
    id: 'INM001',
    nombre: 'Apartamento Vista Norte',
    direccion: 'Carrera 15 #85-23, Bogotá',
    tipo: 'apartamento',
    estado: 'disponible',
    precio: 1500000,
    descripcion: 'Hermoso apartamento con vista panorámica de la ciudad, ubicado en zona exclusiva.',
    habitaciones: 3,
    banos: 2,
    area: 85,
    id_propietario: 1
  },
  'INM002': {
    id: 'INM002',
    nombre: 'Casa Familiar Los Rosales',
    direccion: 'Calle 72 #11-45, Bogotá',
    tipo: 'casa',
    estado: 'ocupado',
    precio: 2800000,
    descripcion: 'Casa familiar de dos pisos en barrio residencial tranquilo.',
    habitaciones: 4,
    banos: 3,
    area: 150,
    id_propietario: 2
  },
  'INM003': {
    id: 'INM003',
    nombre: 'Studio Moderno Centro',
    direccion: 'Carrera 10 #20-30, Bogotá',
    tipo: 'studio',
    estado: 'mantenimiento',
    precio: 900000,
    descripcion: 'Studio moderno en el centro de la ciudad, ideal para profesionales.',
    habitaciones: 1,
    banos: 1,
    area: 45,
    id_propietario: 1
  },
  'INM004': {
    id: 'INM004',
    nombre: 'Penthouse Luxury',
    direccion: 'Carrera 10 #30-55, Cali',
    tipo: 'penthouse',
    estado: 'disponible',
    precio: 4500000,
    descripcion: 'Lujoso penthouse con terraza privada y acabados de primera calidad.',
    habitaciones: 5,
    banos: 4,
    area: 220,
    id_propietario: 4
  },
  'INM005': {
    id: 'INM005',
    nombre: 'Oficina Ejecutiva',
    direccion: 'Avenida El Poblado #45-67, Cali',
    tipo: 'oficina',
    estado: 'disponible',
    precio: 1200000,
    descripcion: 'Oficina ejecutiva en edificio corporativo con excelente ubicación.',
    habitaciones: 0,
    banos: 1,
    area: 60,
    id_propietario: 4
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      isError: true,
      data: null,
      message: 'Método no permitido'
    });
  }

  try {
    const { propietario_id } = req.query;

    if (!propietario_id) {
      return res.status(400).json({
        isError: true,
        data: null,
        message: 'ID del propietario es requerido'
      });
    }

    // Filtrar inmuebles por propietario
    const propietarioIdNum = parseInt(propietario_id as string);
    const inmueblesDelPropietario = Object.values(mockInmuebles).filter(
      inmueble => inmueble.id_propietario === propietarioIdNum
    );

    // Simular delay de red
    setTimeout(() => {
      res.status(200).json({
        isError: false,
        data: inmueblesDelPropietario,
        message: 'Inmuebles del propietario obtenidos exitosamente'
      });
    }, 300);

  } catch (error) {
    res.status(500).json({
      isError: true,
      data: null,
      message: 'Error interno del servidor'
    });
  }
}
