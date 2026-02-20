import ExcelJS from 'exceljs';
import { GetReservasService } from './getReservasService';
import { GetReservasQuery } from '../../interfaces/reserva.interface';

export interface ExportReservasQuery {
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
    id_inmueble?: number;
    id_empresa?: number;
    plataforma_origen?: string;
}

export class ExportReservasExcelService {
    /**
     * Genera un archivo Excel (.xlsx) con las reservas filtradas
     */
    static async execute(filters: ExportReservasQuery): Promise<{ buffer: Buffer; fileName: string }> {
        const getReservasService = new GetReservasService();

        // Reutiliza el servicio existente para obtener reservas con todos los datos
        const query: GetReservasQuery = {
            id_empresa: filters.id_empresa,
            fecha_inicio: filters.fecha_inicio,
            fecha_fin: filters.fecha_fin,
            estado: filters.estado as any,
            id_inmueble: filters.id_inmueble,
            plataforma_origen: filters.plataforma_origen,
        };

        const reservas = await getReservasService.execute(query);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reservas');

        // Definir columnas
        worksheet.columns = [
            { header: 'Código', key: 'codigo_reserva', width: 18 },
            { header: 'Fecha Creación', key: 'fecha_creacion', width: 15 },
            { header: 'Inmueble', key: 'nombre_inmueble', width: 30 },
            { header: 'Huésped Principal', key: 'huesped', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Teléfono', key: 'telefono', width: 16 },
            { header: 'Fecha Entrada', key: 'fecha_inicio', width: 15 },
            { header: 'Fecha Salida', key: 'fecha_fin', width: 15 },
            { header: 'Noches', key: 'noches', width: 10 },
            { header: 'Nº Huéspedes', key: 'numero_huespedes', width: 14 },
            { header: 'Plataforma', key: 'plataforma_origen', width: 14 },
            { header: 'Estado', key: 'estado', width: 14 },
            { header: 'Total Reserva', key: 'total_reserva', width: 16 },
            { header: 'Total Pagado', key: 'total_pagado', width: 16 },
            { header: 'Total Pendiente', key: 'total_pendiente', width: 16 },
            { header: 'Observaciones', key: 'observaciones', width: 40 },
        ];

        // Estilo encabezado
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2D9CDB' }, // Azul Waiwa
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Añadir filas
        reservas.forEach((reserva) => {
            const noches = (() => {
                const entrada = new Date(reserva.fecha_inicio);
                const salida = new Date(reserva.fecha_fin);
                return Math.ceil((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
            })();

            const row = worksheet.addRow({
                codigo_reserva: reserva.codigo_reserva,
                fecha_creacion: reserva.fecha_creacion,
                nombre_inmueble: reserva.nombre_inmueble,
                huesped: `${reserva.huesped_principal.nombre} ${reserva.huesped_principal.apellido}`,
                email: reserva.huesped_principal.email,
                telefono: reserva.huesped_principal.telefono,
                fecha_inicio: reserva.fecha_inicio,
                fecha_fin: reserva.fecha_fin,
                noches,
                numero_huespedes: reserva.numero_huespedes,
                plataforma_origen: reserva.plataforma_origen || 'directa',
                estado: reserva.estado,
                total_reserva: Number(reserva.total_reserva) || 0,
                total_pagado: Number(reserva.total_pagado) || 0,
                total_pendiente: Number(reserva.total_pendiente) || 0,
                observaciones: reserva.observaciones || '',
            });

            // Formato moneda para columnas financieras
            ['total_reserva', 'total_pagado', 'total_pendiente'].forEach((key) => {
                row.getCell(key).numFmt = '"$"#,##0.00';
            });

            // Color según estado
            const estadoCell = row.getCell('estado');
            switch (reserva.estado) {
                case 'confirmada':
                    estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6EAF8' } };
                    break;
                case 'completada':
                    estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5F5E3' } };
                    break;
                case 'cancelada':
                    estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE8E8' } };
                    break;
                case 'pendiente':
                    estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
                    break;
            }

            // Color rojo si hay pendiente
            if (Number(reserva.total_pendiente) > 0) {
                row.getCell('total_pendiente').font = { color: { argb: 'FFCC0000' }, bold: true };
            } else {
                row.getCell('total_pendiente').font = { color: { argb: 'FF27AE60' }, bold: true };
            }
        });

        // Fila de totales al final
        if (reservas.length > 0) {
            const totalsRow = worksheet.addRow({
                codigo_reserva: 'TOTALES',
                total_reserva: reservas.reduce((sum, r) => sum + (Number(r.total_reserva) || 0), 0),
                total_pagado: reservas.reduce((sum, r) => sum + (Number(r.total_pagado) || 0), 0),
                total_pendiente: reservas.reduce((sum, r) => sum + (Number(r.total_pendiente) || 0), 0),
            });
            totalsRow.font = { bold: true };
            totalsRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFEEEEEE' },
            };
            ['total_reserva', 'total_pagado', 'total_pendiente'].forEach((key) => {
                totalsRow.getCell(key).numFmt = '"$"#,##0.00';
            });
        }

        const bufferData = await workbook.xlsx.writeBuffer();
        const today = new Date().toISOString().split('T')[0];
        const fileName = `Reporte_Reservas_${today}.xlsx`;

        return {
            buffer: Buffer.from(bufferData),
            fileName,
        };
    }
}
