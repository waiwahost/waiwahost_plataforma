import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
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
        message: 'ID del propietario es requerido'
      });
    }

    // Simular verificación de existencia
    const propietarioId = parseInt(id as string);
    if (propietarioId <= 0) {
      return res.status(404).json({
        isError: true,
        data: null,
        message: 'Propietario no encontrado'
      });
    }

    // Simular delay de red
    setTimeout(() => {
      res.status(200).json({
        isError: false,
        data: { id: propietarioId },
        message: 'Propietario eliminado exitosamente'
      });
    }, 500);

  } catch (error) {
    res.status(500).json({
      isError: true,
      data: null,
      message: 'Error interno del servidor'
    });
  }
}
