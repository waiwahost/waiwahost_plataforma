import type { NextApiRequest, NextApiResponse } from 'next';

// URL de la API externa (ajustar según ambiente real)
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 'https://api.externa.com/disponibilidad';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { start, end, inmuebleId, estado } = req.query;

  // Validación básica
  if (!start || !end) {
    return res.status(400).json({ error: 'Parámetros start y end son requeridos' });
  }

  // Construir query params para la API externa
  const params = new URLSearchParams();
  params.append('start', String(start));
  params.append('end', String(end));
  if (inmuebleId) params.append('inmuebleId', String(inmuebleId));
  if (estado) params.append('estado', String(estado));

  try {
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    console.log('token:', token);
    const response = await fetch(`${apiUrl}/disponibilidad/calendario?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Fetch URL:', `${apiUrl}/disponibilidad/calendario?${params.toString()}`);
    console.log('Response Status:', response.status);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error en la API externa' });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Error de conexión con la API externa' });
  }
}
