import { NextApiRequest, NextApiResponse } from 'next';
import { IHuespedTableData } from '../../../interfaces/Huesped';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      isError: true,
      data: null,
      message: 'Método no permitido'
    });
  }

  try {
    const huespedData = req.body;

    // Simular validaciones básicas
    if (!huespedData.nombre || !huespedData.apellido || !huespedData.documento_numero || !huespedData.email || !huespedData.telefono) {
      return res.status(400).json({
        isError: true,
        data: null,
        message: 'Faltan campos obligatorios: nombre, apellido, documento_numero, email, telefono'
      });
    }

    // Simular pequeña demora
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simular creación exitosa - generar ID aleatorio
    const newId = Math.floor(Math.random() * 1000) + 100;

    const newHuesped: IHuespedTableData = {
      id_huesped: newId,
      nombre: huespedData.nombre,
      apellido: huespedData.apellido,
      documento_numero: huespedData.documento_numero,
      email: huespedData.email,
      telefono: huespedData.telefono,
      estado: huespedData.estado || 'activo'
    };

    res.status(201).json({
      isError: false,
      data: newHuesped,
      message: 'Huésped creado exitosamente (simulado)'
    });

  } catch (error) {
    console.error('Error in createHuesped API:', error);

    res.status(500).json({
      isError: true,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}