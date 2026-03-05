import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../lib/externalApiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Método no permitido' });
    }

    try {
        const token = extractTokenFromRequest(req);
        const external = await externalApiServerFetch('/conceptos', {
            method: 'POST',
            body: JSON.stringify(req.body),
        }, token);

        if (external.isError) {
            return res.status(400).json({ success: false, message: external.message || 'Error al crear concepto', error: external.error });
        }

        return res.status(201).json({ success: true, data: external.data, message: 'Concepto creado exitosamente' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error interno', error: error instanceof Error ? error.message : 'Error' });
    }
}
