import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../lib/externalApiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Método no permitido' });
    const token = extractTokenFromRequest(req);
    try {
        const external = await externalApiServerFetch('/factus/numeracion', { method: 'GET' }, token);
        return res.status(200).json({ success: true, data: external?.data ?? external });
    } catch (error) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
}
