/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  const { id, ...fields } = req.body;
  const apiUrl = process.env.API_URL;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID de usuario requerido' });
  }
  if (!apiUrl) {
    return res.status(500).json({ success: false, message: 'API URL no configurada' });
  }

  try {
    const response = await fetch(`${apiUrl}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    const apiData = await response.json();
    if (apiData.isError) {
      return res.status(apiData.code || 500).json({ success: false, message: apiData.message || 'Error actualizando usuario' });
    }
    return res.status(200).json({ success: true, message: 'Usuario actualizado correctamente', data: apiData.data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error actualizando usuario' });
  }
}
