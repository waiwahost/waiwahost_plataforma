import dbClient from '../libs/db';
import { Bloqueo, CreateBloqueoRequest, GetBloqueosQuery } from '../interfaces/bloqueo.interface';

export class BloqueosRepository {

    /**
     * Obtiene los bloqueos con filtros
     */
    async getBloqueos(filters: GetBloqueosQuery = {}): Promise<Bloqueo[]> {
        try {
            let query = `
        SELECT 
          id_bloqueo,
          id_inmueble,
          fecha_inicio,
          fecha_fin,
          tipo_bloqueo,
          descripcion,
          fecha_creacion
        FROM bloqueos_inmuebles
        WHERE 1=1
      `;
            const params: any[] = [];
            let idx = 1;

            if (filters.id_inmueble) {
                query += ` AND id_inmueble = $${idx++}`;
                params.push(filters.id_inmueble);
            }

            if (filters.tipo_bloqueo) {
                query += ` AND tipo_bloqueo = $${idx++}`;
                params.push(filters.tipo_bloqueo);
            }

            if (filters.fecha_inicio) {
                query += ` AND fecha_fin >= $${idx++}`;
                params.push(filters.fecha_inicio);
            }

            if (filters.fecha_fin) {
                query += ` AND fecha_inicio <= $${idx++}`;
                params.push(filters.fecha_fin);
            }

            query += ' ORDER BY fecha_inicio ASC';

            const result = await dbClient.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error en BloqueosRepository.getBloqueos:', error);
            throw error;
        }
    }

    /**
     * Crea un nuevo bloqueo
     */
    async createBloqueo(data: CreateBloqueoRequest): Promise<Bloqueo> {
        try {
            const query = `
        INSERT INTO bloqueos_inmuebles (
          id_inmueble, fecha_inicio, fecha_fin, tipo_bloqueo, descripcion
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
            const values = [
                data.id_inmueble,
                data.fecha_inicio,
                data.fecha_fin,
                data.tipo_bloqueo,
                data.descripcion || null
            ];
            const result = await dbClient.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error en BloqueosRepository.createBloqueo:', error);
            throw error;
        }
    }

    /**
     * Actualiza un bloqueo
     */
    async updateBloqueo(id: number, data: Partial<CreateBloqueoRequest>): Promise<Bloqueo | null> {
        try {
            const setClauses: string[] = [];
            const values: any[] = [];
            let idx = 1;

            if (data.fecha_inicio) { setClauses.push(`fecha_inicio = $${idx++}`); values.push(data.fecha_inicio); }
            if (data.fecha_fin) { setClauses.push(`fecha_fin = $${idx++}`); values.push(data.fecha_fin); }
            if (data.tipo_bloqueo) { setClauses.push(`tipo_bloqueo = $${idx++}`); values.push(data.tipo_bloqueo); }
            if (data.descripcion !== undefined) { setClauses.push(`descripcion = $${idx++}`); values.push(data.descripcion); }

            if (setClauses.length === 0) return null;

            values.push(id);
            const query = `
        UPDATE bloqueos_inmuebles 
        SET ${setClauses.join(', ')} 
        WHERE id_bloqueo = $${idx}
        RETURNING *
      `;
            const result = await dbClient.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en BloqueosRepository.updateBloqueo:', error);
            throw error;
        }
    }

    /**
     * Elimina un bloqueo
     */
    async deleteBloqueo(id: number): Promise<boolean> {
        try {
            const query = 'DELETE FROM bloqueos_inmuebles WHERE id_bloqueo = $1';
            const result = await dbClient.query(query, [id]);
            return (result.rowCount ?? 0) > 0;
        } catch (error) {
            console.error('Error en BloqueosRepository.deleteBloqueo:', error);
            throw error;
        }
    }

    /**
     * Verifica traslapes con otros bloqueos
     */
    async countOverlappingBlocks(idInmueble: number, fechaInicio: string, fechaFin: string, excludeId?: number): Promise<number> {
        try {
            let query = `
        SELECT COUNT(*) as total 
        FROM bloqueos_inmuebles 
        WHERE id_inmueble = $1 
        AND (fecha_inicio < $3 AND fecha_fin > $2)
      `;
            const params: any[] = [idInmueble, fechaInicio, fechaFin];

            if (excludeId) {
                query += ` AND id_bloqueo != $4`;
                params.push(excludeId);
            }

            const result = await dbClient.query(query, params);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Error en BloqueosRepository.countOverlappingBlocks:', error);
            throw error;
        }
    }

    /**
     * Obtiene un bloqueo por ID
     */
    async getBloqueoById(id: number): Promise<Bloqueo | null> {
        try {
            const query = 'SELECT * FROM bloqueos_inmuebles WHERE id_bloqueo = $1';
            const result = await dbClient.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en BloqueosRepository.getBloqueoById:', error);
            throw error;
        }
    }
}
