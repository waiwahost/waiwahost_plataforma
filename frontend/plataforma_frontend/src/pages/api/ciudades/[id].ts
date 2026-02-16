import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const apiUrl = process.env.API_URL || 'http://localhost:3001';
        const token = req.headers.authorization?.replace('Bearer ', '') || '';
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ success: false, message: 'ID de ciudad es requerido' });
        }

        const response = await fetch(`${apiUrl}/ciudades/${id}`, {
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
            message: 'Ciudad obtenida exitosamente'
        });

    } catch (error) {
        console.error('Error in /api/ciudades/[id]:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
}
