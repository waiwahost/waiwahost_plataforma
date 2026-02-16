import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query; // id_reserva
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const method = req.method;

    if (!id || Array.isArray(id)) {
        return res.status(400).json({ success: false, message: 'ID de reserva inválido' });
    }

    if (method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Método no permitido' });
    }

    try {
        const response = await fetch(`${apiUrl}/tarjeta-registro/${id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json({
                success: false,
                message: errorData.message || 'Error en el backend de Fastify'
            });
        }

        const data = await response.json(); 

        return res.status(200).json({
            success: !data.isError,
            data: data.data, 
            message: data.message
        });

    } catch (error) {
        console.error(`❌ Error en Proxy /api/tarjeta-registro/sendTarjeta/${id}:`, error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
}