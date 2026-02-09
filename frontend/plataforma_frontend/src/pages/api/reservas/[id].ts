import type { NextApiRequest, NextApiResponse } from 'next';
import { IReservaTableData } from '../../../interfaces/Reserva';
import { PlataformaOrigen } from '../../../constants/plataformas';

// Data mapping helper (adapted from getReservas.ts)
const mapReservaFromAPI = (reservaAPI: any): IReservaTableData => {
    const toIsoOrEmpty = (val: any) => {
        if (!val) return '';
        const d = new Date(val);
        return isNaN(d.getTime()) ? '' : d.toISOString();
    };
    return {
        id: reservaAPI.id,
        codigo_reserva: reservaAPI.codigo_reserva,
        id_inmueble: reservaAPI.id_inmueble,
        nombre_inmueble: reservaAPI.nombre_inmueble,
        huesped_principal: reservaAPI.huesped_principal,
        fecha_inicio: toIsoOrEmpty(reservaAPI.fecha_inicio),
        fecha_fin: toIsoOrEmpty(reservaAPI.fecha_fin),
        numero_huespedes: reservaAPI.numero_huespedes,
        huespedes: reservaAPI.huespedes,
        precio_total: reservaAPI.precio_total,
        total_reserva: reservaAPI.total_reserva,
        total_pagado: reservaAPI.total_pagado,
        total_pendiente: reservaAPI.total_pendiente,
        estado: reservaAPI.estado,
        fecha_creacion: toIsoOrEmpty(reservaAPI.fecha_creacion),
        observaciones: reservaAPI.observaciones || '',
        id_empresa: reservaAPI.id_empresa,
        plataforma_origen: (reservaAPI.plataforma_origen as PlataformaOrigen) || 'no_especificada',
    };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const method = req.method;

    if (!id || Array.isArray(id)) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    try {
        const fetchOptions: RequestInit = {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        };

        if (method === 'PUT' && req.body) {
            (fetchOptions.headers as any)['Content-Type'] = 'application/json';
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(`${apiUrl}/reservas/${id}`, fetchOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json({
                success: false,
                message: errorData.message || 'Error en el backend'
            });
        }

        const data = await response.json(); // Backend response: { isError, data, message }

        let resultData = data.data;

        // Apply mapping for GET and PUT (which return reservation object)
        if (method === 'GET' || method === 'PUT') {
            if (resultData) {
                try {
                    resultData = mapReservaFromAPI(resultData);
                } catch (e) {
                    console.error("Error mapping reserva:", e);
                    // Return raw data if mapping fails, or handle error
                }
            }
        }

        return res.status(200).json({
            success: !data.isError,
            data: resultData,
            message: data.message
        });

    } catch (error) {
        console.error(`Error en API proxy /api/reservas/${id}:`, error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
}
