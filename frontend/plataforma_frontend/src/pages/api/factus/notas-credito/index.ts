import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../../lib/externalApiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = extractTokenFromRequest(req);
    const { action } = req.query;

    try {
        if (req.method === 'GET') {
            const params = new URLSearchParams();
            const { page, limit } = req.query;
            if (page) params.set('page', String(page));
            if (limit) params.set('limit', String(limit));
            const external = await externalApiServerFetch(`/factus/notas-credito${params.toString() ? `?${params}` : ''}`, { method: 'GET' }, token);
            return res.status(200).json({ success: true, data: external?.data ?? external });
        }
        if (req.method === 'POST' && !action) {
            const external = await externalApiServerFetch('/factus/notas-credito', { method: 'POST', body: JSON.stringify(req.body) }, token);
            return res.status(201).json({ success: true, data: external?.data ?? external });
        }
        return res.status(405).json({ success: false, message: 'Método no permitido' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error interno' });
    }
}
