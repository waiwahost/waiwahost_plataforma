import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../../lib/externalApiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = extractTokenFromRequest(req);
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'ID requerido' });

    try {
        if (req.method === 'GET') {
            const external = await externalApiServerFetch(`/factus/productos-servicios/${id}`, { method: 'GET' }, token);
            return res.status(200).json({ success: true, data: external?.data ?? external });
        }
        if (req.method === 'PUT') {
            const external = await externalApiServerFetch(`/factus/productos-servicios/${id}`, { method: 'PUT', body: JSON.stringify(req.body) }, token);
            return res.status(200).json({ success: true, data: external?.data ?? external });
        }
        if (req.method === 'DELETE') {
            const external = await externalApiServerFetch(`/factus/productos-servicios/${id}`, { method: 'DELETE' }, token);
            return res.status(200).json({ success: true, data: external?.data ?? external });
        }
        return res.status(405).json({ success: false, message: 'Método no permitido' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error interno' });
    }
}
