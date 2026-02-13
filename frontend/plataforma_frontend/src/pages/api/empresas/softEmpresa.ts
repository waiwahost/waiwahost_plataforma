import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({
            isError: true,
            data: null,
            message: 'Método no permitido',
            code: 405,
            timestamp: new Date().toISOString()
        });
    }

    try {
        const apiUrl = process.env.API_URL || 'http://localhost:3001';
        const token = req.headers.authorization;
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                isError: true,
                data: null,
                message: 'ID de empresa es requerido en query params (?id=...)',
                code: 400,
                timestamp: new Date().toISOString()
            });
        }

        const response = await fetch(`${apiUrl}/empresas/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': token } : {})
            }
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (!response.ok) {
            return res.status(response.status).json({
                isError: true,
                data: null,
                message: data?.message || `Error del backend: ${response.status}`,
                code: response.status,
                timestamp: new Date().toISOString()
            });
        }

        return res.status(200).json({
            isError: false,
            data: data.data || data,
            code: 200,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error in softEmpresa API:', error);
        return res.status(500).json({
            isError: true,
            data: null,
            message: error.message || 'Error interno del servidor',
            code: 500,
            timestamp: new Date().toISOString()
        });
    }
}
