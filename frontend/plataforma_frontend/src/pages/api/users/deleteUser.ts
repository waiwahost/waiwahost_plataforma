/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  const { id } = req.body;
  const apiUrl = process.env.API_URL;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID de usuario requerido' });
  }
  if (!apiUrl) {
    return res.status(500).json({ success: false, message: 'API URL no configurada' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado: token faltante' });
    }
    const token = authHeader.replace('Bearer ', '');
    const response = await fetch(`${apiUrl}/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const apiData = await response.json();
    if (apiData.isError) {
      return res.status(apiData.code || 500).json({ success: false, message: apiData.message || 'Error eliminando usuario' });
    }
    return res.status(200).json({ success: true, message: 'Usuario eliminado correctamente', data: apiData.data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error eliminando usuario' });
  }
}
