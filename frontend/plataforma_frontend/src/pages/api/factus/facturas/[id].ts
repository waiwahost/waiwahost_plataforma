import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../../lib/externalApiClient';

// Handles:
//   GET  /api/factus/facturas/[id]          → detail
//   POST /api/factus/facturas/[id]?accion=enviar
//   GET  /api/factus/facturas/[id]?accion=pdf
//   POST /api/factus/facturas/[id]?accion=email
//
// NOTE: Next.js *also* resolves the URL path as the request URL,
//       so we check req.url to detect sub-paths like /enviar, /pdf, /email

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = extractTokenFromRequest(req);
    const { id } = req.query;
    if (!id || Array.isArray(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    // Detect sub-action from query param or URL path
    const url = req.url || '';
    const isEnviar = url.includes('/enviar') || req.query.accion === 'enviar';
    const isPdf = url.includes('/pdf') || req.query.accion === 'pdf';
    const isEmail = url.includes('/email') || req.query.accion === 'email';

    try {
        // POST /enviar → enviar factura a DIAN
        if (isEnviar && req.method === 'POST') {
            const ext = await externalApiServerFetch(`/factus/facturas/${id}/enviar`, { method: 'POST', body: '{}' }, token);
            return res.status(200).json({ success: true, data: ext?.data ?? ext });
        }

        // GET /pdf → descargar PDF
        if (isPdf && req.method === 'GET') {
            try {
                const buffer = await externalApiServerFetch(`/factus/facturas/${id}/pdf`, { method: 'GET' }, token, true);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="factura-${id}.pdf"`);
                return res.send(buffer);
            } catch (error) {
                return res.status(500).json({ success: false, message: 'Error obteniendo PDF', error: error instanceof Error ? error.message : String(error) });
            }
        }

        // POST /email → enviar por email
        if (isEmail && req.method === 'POST') {
            const ext = await externalApiServerFetch(`/factus/facturas/${id}/email`, { method: 'POST', body: JSON.stringify(req.body) }, token);
            return res.status(200).json({ success: true, data: ext?.data ?? ext });
        }

        // GET / → detail
        if (req.method === 'GET') {
            const ext = await externalApiServerFetch(`/factus/facturas/${id}`, { method: 'GET' }, token);
            return res.status(200).json({ success: true, data: ext?.data ?? ext });
        }

        return res.status(405).json({ success: false, message: 'Método no permitido' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error interno' });
    }
}
