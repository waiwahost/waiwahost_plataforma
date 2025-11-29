import { NextApiRequest, NextApiResponse } from 'next';
import { IHuespedTableData } from '../../../interfaces/Huesped';

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
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        isError: true,
        data: null,
        message: 'No autorizado'
      });
    }

    // Construir URL del backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    let url = `${backendUrl}/huespedes`;

    // Si hay id_empresa, lo pasamos como query param (aunque el backend usa el token principalmente)
    if (id_empresa) {
      url += `?id_empresa=${id_empresa}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener huéspedes del backend');
    }

    res.status(200).json({
      isError: false,
      data: data.data, // Asumiendo que el backend devuelve { data: [...] }
      message: 'Huéspedes obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error in getHuespedes API:', error);

    res.status(500).json({
      isError: true,
      data: null,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}