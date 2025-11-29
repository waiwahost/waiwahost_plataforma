import type { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest } from '../../../lib/externalApiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const token = extractTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        const { empresaId, inmuebleId, propietarioId, fechaInicio, fechaFin } = req.query;

        const queryParams = new URLSearchParams();
        if (empresaId) queryParams.append('empresaId', empresaId as string);
        if (inmuebleId) queryParams.append('inmuebleId', inmuebleId as string);
        if (propietarioId) queryParams.append('propietarioId', propietarioId as string);
        if (fechaInicio) queryParams.append('fechaInicio', fechaInicio as string);
        if (fechaFin) queryParams.append('fechaFin', fechaFin as string);

        const response = await externalApiServerFetch(
            `/reportes/financiero?${queryParams.toString()}`,
            { method: 'GET' },
            token
        );

        return res.status(200).json(response);
    } catch (error: any) {
        console.error('Error en API interna reportes/financiero:', error);
        return res.status(error.response?.status || 500).json({
            message: error.message || 'Error interno del servidor',
            error: true
        });
    }
}
