import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
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

    console.log('Deleting huesped with ID (MOCK):', id);
    
    // Simular pequeña demora
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Simular eliminación exitosa
    console.log('Mock huesped deleted successfully');

    res.status(200).json({
      isError: false,
      data: null,
      message: 'Huésped eliminado exitosamente (simulado)'
    });

  } catch (error) {
    console.error('Error in deleteHuesped API:', error);
    
    res.status(500).json({
      isError: true,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}