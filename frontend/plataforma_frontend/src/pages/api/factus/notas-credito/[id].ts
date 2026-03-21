import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../../lib/externalApiClient';

// Handles:
//   GET  /api/factus/notas-credito/[id]         → detail
//   POST /api/factus/notas-credito/[id]/enviar  → enviar a DIAN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = extractTokenFromRequest(req);
    const { id } = req.query;
    if (!id || Array.isArray(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const url = req.url || '';
    const isEnviar = url.includes('/enviar') || req.query.accion === 'enviar';

    try {
        if (isEnviar && req.method === 'POST') {
            const ext = await externalApiServerFetch(`/factus/notas-credito/${id}/enviar`, { method: 'POST', body: '{}' }, token);
            return res.status(200).json({ success: true, data: ext?.data ?? ext });
        }
        if (req.method === 'GET') {
            const ext = await externalApiServerFetch(`/factus/notas-credito/${id}`, { method: 'GET' }, token);
            return res.status(200).json({ success: true, data: ext?.data ?? ext });
        }
        return res.status(405).json({ success: false, message: 'Método no permitido' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error interno' });
    }
}
