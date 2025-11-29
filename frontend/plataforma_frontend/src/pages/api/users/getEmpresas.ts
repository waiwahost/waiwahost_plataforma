/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return res.status(500).json({ success: false, message: 'API URL no configurada' });
  }
  try {
    const authHeader = req.headers.authorization;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    const response = await fetch(`${apiUrl}/empresas`, {
      method: 'GET',
      headers,
    });
    const apiData = await response.json();
    if (apiData.isError) {
      return res.status(apiData.code || 500).json({ success: false, message: apiData.message || 'Error al obtener empresas' });
    }
    return res.status(200).json({ success: true, data: apiData.data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error al obtener empresas' });
  }
}
