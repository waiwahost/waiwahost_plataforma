import dbClient from '../libs/db';

export class KpiRepository {
    /**
     * Fetches data for properties (building and its units)
     */
    async getPropertiesHierarchy(parentId: number | null, edificioId?: number) {
        let query = `
      SELECT 
        id_inmueble, 
        nombre, 
        tipo_registro, 
        parent_id, 
        area_m2,
        comision,
        precio_limpieza
      FROM inmuebles 
      WHERE estado = 'activo'
    `;
        const params: any[] = [];

        if (edificioId) {
            query += ` AND (id_inmueble = $1 OR parent_id = $1)`;
            params.push(edificioId);
        } else if (parentId) {
            query += ` AND (id_inmueble = $1 OR parent_id = $1)`;
            params.push(parentId);
        }

        const result = await dbClient.query(query, params);
        return result.rows;
    }

    /**
     * Fetches summary of reservations for a set of properties in a date range
     */
    async getReservationsSummary(propertyIds: number[], startDate: string, endDate: string) {
        if (propertyIds.length === 0) return [];

        const placeholders = propertyIds.map((_, i) => `$${i + 3}`).join(',');
        const query = `
      SELECT 
        id_inmueble,
        COUNT(id_reserva) as total_reservas,
        SUM(fecha_fin - fecha_inicio) as noches_ocupadas,
        SUM(total_reserva) as ingreso_bruto
      FROM reservas
      WHERE estado != 'cancelada'
        AND fecha_inicio >= $1
        AND fecha_fin <= $2
        AND id_inmueble IN (${placeholders})
      GROUP BY id_inmueble
    `;

        const result = await dbClient.query(query, [startDate, endDate, ...propertyIds]);
        return result.rows;
    }

    /**
     * Fetches movements (expenses) for a set of properties in a date range
     */
    async getMovementsSummary(propertyIds: number[], startDate: string, endDate: string) {
        if (propertyIds.length === 0) return [];

        const placeholders = propertyIds.map((_, i) => `$${i + 3}`).join(',');
        const query = `
      SELECT 
        id_inmueble::integer,
        tipo,
        concepto,
        SUM(monto) as total_monto
      FROM movimientos
      WHERE fecha >= $1
        AND fecha <= $2
        AND id_inmueble::integer IN (${placeholders})
      GROUP BY id_inmueble, tipo, concepto
    `;

        const result = await dbClient.query(query, [startDate, endDate, ...propertyIds]);
        return result.rows;
    }
}
