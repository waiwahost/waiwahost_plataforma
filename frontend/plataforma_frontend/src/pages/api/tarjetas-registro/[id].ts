// src/pages/api/tarjeta-registro/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    try {
        const response = await fetch(`${apiUrl}/tarjeta-registro/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return res.status(200).json({
            success: !data.isError,
            data: data.data,
            message: data.message
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error en el proxy' });
    }
}