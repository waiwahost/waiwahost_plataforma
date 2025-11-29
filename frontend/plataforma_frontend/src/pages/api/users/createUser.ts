/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const apiUrl = process.env.API_URL;
      if (!apiUrl) {
        return res.status(500).json({ success: false, message: 'API URL no configurada' });
      }
      console.log(req.body);
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado: token faltante' });
      }
      const token = authHeader.replace('Bearer ', '');
      const response = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });
      const apiData = await response.json();
      if (apiData.isError) {
        return res.status(apiData.code || 500).json({ success: false, message: apiData.message || 'Error al crear usuario' });
      }
      return res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: apiData.data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error al crear usuario' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
