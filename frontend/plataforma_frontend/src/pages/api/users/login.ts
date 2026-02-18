import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Email or Username and password are required' });
  }
  try {
    const apiRes = await fetch(`${process.env.API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const apiData = await apiRes.json();
    if (apiData.isError) {
      return res.status(apiData.code || 401).json({ message: apiData.message || 'Credenciales inválidas' });
    }
    // Extraer token y user del nuevo formato
    const { token, user } = apiData.data || {};
    if (!token) {
      return res.status(401).json({ message: 'Token no recibido' });
    }
    return res.status(200).json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: 'Error en login' + error });
  }
}
