import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../../lib/externalApiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = extractTokenFromRequest(req);
    const { action } = req.query;
    try {
        if (req.method === 'GET') {
            const { page } = req.query;
            const q = page ? `?page=${page}` : '';
            const external = await externalApiServerFetch(`/factus/declaraciones-terceros${q}`, { method: 'GET' }, token);
            return res.status(200).json({ success: true, data: external?.data ?? external });
        }
        if (req.method === 'POST' && action === 'auto') {
            const external = await externalApiServerFetch('/factus/declaraciones-terceros/auto', { method: 'POST', body: JSON.stringify(req.body) }, token);
            return res.status(201).json({ success: true, data: external?.data ?? external });
        }
        if (req.method === 'POST') {
            const external = await externalApiServerFetch('/factus/declaraciones-terceros', { method: 'POST', body: JSON.stringify(req.body) }, token);
            return res.status(201).json({ success: true, data: external?.data ?? external });
        }
        return res.status(405).json({ success: false, message: 'Método no permitido' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error interno' });
    }
}
