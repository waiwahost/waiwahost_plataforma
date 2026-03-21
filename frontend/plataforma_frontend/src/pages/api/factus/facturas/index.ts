import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../../lib/externalApiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = extractTokenFromRequest(req);
    const { id, action } = req.query;

    try {
        // GET /api/factus/facturas?estado=...&fecha_inicio=...
        if (req.method === 'GET' && !id) {
            const { estado, fecha_inicio, fecha_fin, page, limit } = req.query;
            const q = new URLSearchParams();
            if (estado) q.set('estado', String(estado));
            if (fecha_inicio) q.set('fecha_inicio', String(fecha_inicio));
            if (fecha_fin) q.set('fecha_fin', String(fecha_fin));
            if (page) q.set('page', String(page));
            if (limit) q.set('limit', String(limit));
            const external = await externalApiServerFetch(`/factus/facturas${q.toString() ? `?${q}` : ''}`, { method: 'GET' }, token);
            return res.status(200).json({ success: true, data: external?.data ?? external });
        }

        // POST /api/factus/facturas (crear borrador)
        if (req.method === 'POST' && !id) {
            const external = await externalApiServerFetch('/factus/facturas', { method: 'POST', body: JSON.stringify(req.body) }, token);
            return res.status(201).json({ success: true, data: external?.data ?? external });
        }

        // GET /api/factus/facturas?id=123 (ver detalle)
        if (req.method === 'GET' && id) {
            const external = await externalApiServerFetch(`/factus/facturas/${id}`, { method: 'GET' }, token);
            return res.status(200).json({ success: true, data: external?.data ?? external });
        }

        // POST /api/factus/facturas?id=123&action=enviar
        if (req.method === 'POST' && id && action === 'enviar') {
            const external = await externalApiServerFetch(`/factus/facturas/${id}/enviar`, { method: 'POST' }, token);
            return res.status(200).json({ success: true, data: external?.data ?? external });
        }

        // POST /api/factus/facturas?id=123&action=email
        if (req.method === 'POST' && id && action === 'email') {
            const external = await externalApiServerFetch(`/factus/facturas/${id}/email`, { method: 'POST', body: JSON.stringify(req.body) }, token);
            return res.status(200).json({ success: true, data: external?.data ?? external });
        }

        return res.status(405).json({ success: false, message: 'Método o ruta no permitida' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error interno' });
    }
}
