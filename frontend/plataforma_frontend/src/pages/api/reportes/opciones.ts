import type { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../lib/externalApiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const token = extractTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        const queryParams = new URLSearchParams(req.query as any).toString();
        const response = await externalApiServerFetch(
            `/reportes/opciones?${queryParams}`,
            { method: 'GET' },
            token
        );

        return res.status(200).json(response);
    } catch (error: any) {
        console.error('Error en API interna reportes/opciones:', error);
        return res.status(error.response?.status || 500).json({
            message: error.message || 'Error interno del servidor',
            error: true
        });
    }
}
