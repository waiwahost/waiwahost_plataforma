import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../../lib/externalApiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = extractTokenFromRequest(req);
    try {
        if (req.method === 'GET') {
            const { search, tipo, page, limit } = req.query;
            const q = new URLSearchParams();
            if (search) q.set('search', String(search));
            if (tipo) q.set('tipo', String(tipo));
            if (page) q.set('page', String(page));
            if (limit) q.set('limit', String(limit));
            const qs = q.toString();
            const external = await externalApiServerFetch(`/factus/productos-servicios${qs ? `?${qs}` : ''}`, { method: 'GET' }, token);
            return res.status(200).json({ success: true, data: external?.data ?? external });
        }
        if (req.method === 'POST') {
            const external = await externalApiServerFetch('/factus/productos-servicios', { method: 'POST', body: JSON.stringify(req.body) }, token);
            return res.status(201).json({ success: true, data: external?.data ?? external });
        }
        return res.status(405).json({ success: false, message: 'Método no permitido' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error interno' });
    }
}
