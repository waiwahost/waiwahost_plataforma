import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
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
        // Obtener token del header Authorization
        const token = req.headers.authorization;

        const response = await fetch(`${apiUrl}/empresas/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': token } : {})
            },
            body: JSON.stringify(req.body)
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

        return res.status(201).json({
            isError: false,
            data: data.data || data, // Ajustar segun respuesta del backend
            code: 201,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error in createEmpresa API:', error);
        return res.status(500).json({
            isError: true,
            data: null,
            message: error.message || 'Error interno del servidor',
            code: 500,
            timestamp: new Date().toISOString()
        });
    }
}
