import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../lib/externalApiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Método no permitido' });
    }

    try {
        const token = extractTokenFromRequest(req);
        const { tipo, busqueda } = req.query;

        const params = new URLSearchParams();
        if (tipo) params.set('tipo', String(tipo));
        if (busqueda) params.set('busqueda', String(busqueda));

        const endpoint = `/conceptos${params.toString() ? `?${params.toString()}` : ''}`;
        const external = await externalApiServerFetch(endpoint, { method: 'GET' }, token);

        if (external.isError) {
            return res.status(400).json({ success: false, message: external.message || 'Error al obtener conceptos', error: external.error });
        }

        return res.status(200).json({ success: true, data: external.data, message: 'Conceptos obtenidos' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error interno', error: error instanceof Error ? error.message : 'Error' });
    }
}
