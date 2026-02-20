import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

/**
 * API Interna: Exportar reservas a Excel
 * GET /api/reservas/exportExcel?fecha_inicio=...&fecha_fin=...&id_inmueble=...&estado=...&plataforma_origen=...
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: 'Método no permitido'
        });
    }

    try {
        const { fecha_inicio, fecha_fin, id_inmueble, estado, plataforma_origen } = req.query;

        // Extraer token y empresa_id
        const token = extractTokenFromRequest(req);
        const empresaId = getEmpresaIdFromToken(token);

        if (!empresaId) {
            return res.status(401).json({
                success: false,
                message: 'No se pudo obtener la información de la empresa'
            });
        }

        // Construir endpoint externo
        // Basado en el requerimiento del usuario: http://localhost:3001/reservas/export-excel?fecha_inicio=&fecha_fin=&estado=&id_inmueble=&plataforma_origen=
        let endpoint = `/reservas/export-excel?fecha_inicio=${fecha_inicio || ''}&fecha_fin=${fecha_fin || ''}&id_empresa=${empresaId}`;

        if (id_inmueble && id_inmueble !== '') {
            endpoint += `&id_inmueble=${id_inmueble}`;
        }

        if (estado && estado !== 'todas') {
            endpoint += `&estado=${estado}`;
        }

        if (plataforma_origen && plataforma_origen !== 'todas') {
            endpoint += `&plataforma_origen=${plataforma_origen}`;
        }

        console.log(`[ExportReservas] Calling backend: ${endpoint}`);

        const buffer = await externalApiServerFetch(endpoint, {
            method: 'GET'
        }, token, true);

        console.log(`[ExportReservas] Received buffer, size: ${buffer.length}`);

        // Obtener la fecha para el nombre del archivo
        const today = new Date().toISOString().split('T')[0];
        const fileName = `Reporte_Reservas_${today}.xlsx`;

        // Configurar headers para la descarga
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Enviar el buffer recibido de la API externa
        return res.send(buffer);

    } catch (error) {
        console.error('❌ Error en API interna export Excel reservas:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al exportar Excel',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}
