import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const apiUrl = process.env.API_URL || 'http://localhost:3001';
        const token = req.headers.authorization?.replace('Bearer ', '') || '';
        const { id_pais } = req.query;

        let targetUrl = `${apiUrl}/ciudades`;
        if (id_pais) {
            targetUrl += `?id_pais=${id_pais}`;
        }

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.isError) {
            return res.status(400).json({
                success: false,
                message: data.message || 'Error desde el backend'
            });
        }

        return res.status(200).json({
            success: true,
            data: data.data,
            message: 'Ciudades obtenidas exitosamente'
        });

    } catch (error) {
        console.error('Error in /api/ciudades:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
}
