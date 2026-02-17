import { NextApiRequest, NextApiResponse } from 'next';
import { externalApiServerFetch, extractTokenFromRequest, getEmpresaIdFromToken } from '../../../lib/externalApiClient';

/**
 * API Interna: Exportar movimientos a Excel
 * GET /api/movimientos/exportExcel?fecha_inicio=...&fecha_fin=...&id_inmueble=...&tipo=...
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
        const { fecha_inicio, fecha_fin, id_inmueble, tipo } = req.query;

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
        let endpoint = `/movimientos/export-excel?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}&id_empresa=${empresaId}`;

        if (id_inmueble && id_inmueble !== '') {
            endpoint += `&id_inmueble=${id_inmueble}`;
        }

        if (tipo && tipo !== 'todos') {
            endpoint += `&tipo=${tipo}`;
        }

        console.log(`[ExportExcel] Calling backend: ${endpoint}`);

        const buffer = await externalApiServerFetch(endpoint, {
            method: 'GET'
        }, token, true);

        console.log(`[ExportExcel] Received buffer, size: ${buffer.length}`);

        // Obtener la fecha para el nombre del archivo
        const today = new Date().toISOString().split('T')[0];
        const fileName = `Reporte_Caja_${today}.xlsx`;

        // Configurar headers para la descarga
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Enviar el buffer recibido de la API externa
        return res.send(buffer);

    } catch (error) {
        console.error('❌ Error en API interna export Excel:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al exportar Excel',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}
