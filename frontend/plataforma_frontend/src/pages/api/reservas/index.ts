import type { NextApiRequest, NextApiResponse } from 'next';
import getHandler from './getReservas';
import postHandler from './createReserva';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return getHandler(req, res);
    } else if (req.method === 'POST') {
        return postHandler(req, res);
    } else {
        // Check if other methods are handled by other files, but index.ts usually handles list (GET) and create (POST)
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }
}
