import { NextApiRequest, NextApiResponse } from 'next';
import { IHuespedTableData } from '../../../interfaces/Huesped';

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
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        isError: true,
        data: null,
        message: 'ID del huésped es requerido'
      });
    }


    // Simular pequeña demora
    await new Promise(resolve => setTimeout(resolve, 600));

    // Simular actualización exitosa - combinar datos existentes con nuevos
    const updatedHuesped: IHuespedTableData = {
      id_huesped: parseInt(id as string),
      nombre: updateData.nombre || 'Nombre Actualizado',
      apellido: updateData.apellido || 'Apellido Actualizado',
      documento_numero: updateData.documento_numero || '12345678',
      email: updateData.email || 'actualizado@email.com',
      telefono: updateData.telefono || '+57 300 000 0000',
      estado: updateData.estado || 'activo'
    };


    res.status(200).json({
      isError: false,
      data: updatedHuesped,
      message: 'Huésped actualizado exitosamente (simulado)'
    });

  } catch (error) {
    console.error('Error in editHuesped API:', error);

    res.status(500).json({
      isError: true,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}