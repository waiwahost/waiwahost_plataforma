import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization || '';

    try {
        let response;

        if (req.method === 'PUT') {
            response = await fetch(`${apiUrl}/bloqueos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify(req.body),
            });
        } else if (req.method === 'DELETE') {
            response = await fetch(`${apiUrl}/bloqueos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token,
                },
            });
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json(errorData);
        }

        // Manejar respuestas sin body (ej: 204 No Content en DELETE)
        const contentType = response.headers.get('content-type');
        const hasBody = contentType && contentType.includes('application/json');
        const data = hasBody ? await response.json() : {};
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error in bloqueos [id] API proxy:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
