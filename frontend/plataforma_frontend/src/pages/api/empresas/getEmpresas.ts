import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            isError: true,
            data: [],
            message: 'Método no permitido',
            code: 405,
            timestamp: new Date().toISOString()
        });
    }

    try {
        const apiUrl = process.env.API_URL || 'http://localhost:3001';
        // Obtener token del header Authorization
        const token = req.headers.authorization;

        console.log(`[getEmpresas] Fetching from: ${apiUrl}/empresas`);

        // Realizar la llamada al backend real
        // La ruta en el backend es GET /empresas/
        const response = await fetch(`${apiUrl}/empresas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Pasar el token si existe
                ...(token ? { 'Authorization': token } : {})
            },
        });

        if (!response.ok) {
            // Si el backend devuelve error, lo propagamos con el formato solicitado
            // Intentamos leer el body de error si existe
            let errorData = null;
            try {
                errorData = await response.json();
            } catch (e) { }

            return res.status(response.status).json({
                isError: true,
                data: [],
                message: errorData?.message || `Error del backend: ${response.status}`,
                code: response.status,
                timestamp: new Date().toISOString()
            });
        }

        const backendData = await response.json();

        // El backend devuelve { success: true, data: [...] }
        // Transformamos a la estructura solicitada por el usuario:
        /*
          {
            "isError": false,
            "data": [...],
            "code": 200,
            "timestamp": "..."
          }
        */

        // Si el backend ya devuelve 'data' como array, lo usamos. 
        // Si backendData.data es el array, lo pasamos.
        const empresasList = Array.isArray(backendData.data) ? backendData.data : [];

        return res.status(200).json({
            isError: false,
            data: empresasList,
            code: 200,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error in getEmpresas API:', error);
        return res.status(500).json({
            isError: true,
            data: [],
            message: error.message || 'Error interno del servidor',
            code: 500,
            timestamp: new Date().toISOString()
        });
    }
}
