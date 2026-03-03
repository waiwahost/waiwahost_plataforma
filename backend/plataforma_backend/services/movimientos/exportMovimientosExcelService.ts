import ExcelJS from 'exceljs';
import { MovimientosRepository } from '../../repositories/movimientos.repository';
import { ExportMovimientosQuery } from '../../schemas/movimiento.schema';

export class ExportMovimientosExcelService {
    /**
     * Genera un archivo Excel (.xlsx) con los movimientos filtrados
     */
    static async execute(filters: ExportMovimientosQuery): Promise<{ buffer: Buffer; fileName: string }> {
        const movimientos = await MovimientosRepository.getMovimientosExport(filters);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Movimientos de Caja');
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Tipo', key: 'tipo', width: 12 },
            { header: 'Edificio/Proyecto', key: 'nombre_edificio', width: 25 },
            { header: 'Unidad/Apartamento', key: 'nombre_inmueble', width: 25 },
            { header: 'Concepto', key: 'concepto', width: 20 },
            { header: 'Descripción', key: 'descripcion', width: 40 },
            { header: 'Monto', key: 'monto', width: 15 },
            { header: 'Método de Pago', key: 'metodo_pago', width: 15 },
            { header: 'Comprobante', key: 'comprobante', width: 15 },
            { header: 'Reserva', key: 'codigo_reserva', width: 15 },
            { header: 'Plataforma', key: 'plataforma_origen', width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        movimientos.forEach((mov) => {
            const row = worksheet.addRow({
                id: mov.id?.substring(0, 8),
                fecha: mov.fecha,
                tipo: mov.tipo,
                nombre_edificio: (mov as any).nombre_edificio || ((mov as any).tipo_registro === 'edificio' ? mov.nombre_inmueble : 'N/A'),
                nombre_inmueble: (mov as any).tipo_registro === 'unidad' ? mov.nombre_inmueble : 'Propio del Edificio',
                concepto: mov.concepto,
                descripcion: mov.descripcion,
                monto: mov.monto,
                metodo_pago: mov.metodo_pago || 'N/A',
                comprobante: mov.comprobante || 'N/A',
                codigo_reserva: mov.codigo_reserva || 'N/A',
                plataforma_origen: mov.plataforma_origen || 'N/A'
            });

            const montoCell = row.getCell('monto');

            const montoValue = Number(mov.monto);

            if (mov.tipo === 'egreso' || mov.tipo === 'deducible') {
                montoCell.value = -montoValue;

                // Opción B: Color rojo
                montoCell.font = { color: { argb: 'FFFF0000' }, bold: true };
            } else {
                montoCell.value = montoValue;
            }

            montoCell.numFmt = '"$"#,##0.00;[Red]"-$"#,##0.00';
        });

        const bufferData = await workbook.xlsx.writeBuffer();

        const today = new Date().toISOString().split('T')[0];
        const fileName = `Reporte_Caja_${today}.xlsx`;

        return {
            buffer: Buffer.from(bufferData),
            fileName
        };
    }
}
