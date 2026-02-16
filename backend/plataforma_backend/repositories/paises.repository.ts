import pool from '../libs/db';
import { Pais, CreatePaisData, EditPaisData } from '../interfaces/pais.interface';

export class PaisesRepository {
    /**
     * Obtiene todos los países ordenados por nombre
     */
    async getAllPaises() {
        const query = `
      SELECT id_pais, nombre, codigo_iso2, codigo_iso3, fecha_creacion, fecha_actualizacion
      FROM paises
      ORDER BY nombre ASC
    `;
        try {
            const { rows } = await pool.query(query);
            return { data: rows, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Obtiene un país específico por ID
     */
    async getPaisById(paisId: number) {
        const query = `
      SELECT id_pais, nombre, codigo_iso2, codigo_iso3, fecha_creacion, fecha_actualizacion
      FROM paises
      WHERE id_pais = $1
    `;
        try {
            const { rows } = await pool.query(query, [paisId]);
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Crea un nuevo país
     */
    async createPais(paisData: CreatePaisData): Promise<{ data: Pais | null; error: any }> {
        const query = `
      INSERT INTO paises (nombre, codigo_iso2, codigo_iso3)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

        const values = [
            paisData.nombre,
            paisData.codigo_iso2,
            paisData.codigo_iso3 || null,
        ];

        try {
            const { rows } = await pool.query(query, values);
            return { data: rows[0], error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Actualiza un país existente
     */
    async updatePais(paisId: number, paisData: EditPaisData): Promise<{ data: Pais | null; error: any }> {
        const setClause: string[] = [];
        const values: any[] = [];
        let valueIndex = 1;

        // Construir dinámicamente la query de actualización
        Object.entries(paisData).forEach(([key, value]) => {
            if (value !== undefined) {
                setClause.push(`${key} = $${valueIndex}`);
                values.push(value);
                valueIndex++;
            }
        });

        if (setClause.length === 0) {
            return { data: null, error: new Error('No hay datos para actualizar') };
        }

        // Agregar fecha_actualizacion
        setClause.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);

        const query = `
      UPDATE paises 
      SET ${setClause.join(', ')}
      WHERE id_pais = $${valueIndex}
      RETURNING *
    `;

        values.push(paisId);

        try {
            const { rows } = await pool.query(query, values);
            return { data: rows[0], error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Verifica si un país existe
     */
    async paisExists(paisId: number): Promise<{ exists: boolean; error: any }> {
        const query = `SELECT id_pais FROM paises WHERE id_pais = $1`;

        try {
            const { rows } = await pool.query(query, [paisId]);
            return { exists: rows.length > 0, error: null };
        } catch (error: any) {
            return { exists: false, error };
        }
    }

    /**
     * Verifica si un nombre de país ya existe (para validación de unicidad)
     */
    async checkUniqueNombre(nombre: string, excludeId?: number): Promise<{ exists: boolean; error: any }> {
        let query = `SELECT id_pais FROM paises WHERE nombre = $1`;
        const values: any[] = [nombre];

        if (excludeId) {
            query += ` AND id_pais != $2`;
            values.push(excludeId);
        }

        try {
            const { rows } = await pool.query(query, values);
            return { exists: rows.length > 0, error: null };
        } catch (error: any) {
            return { exists: false, error };
        }
    }

    /**
     * Verifica si un código ISO2 ya existe (para validación de unicidad)
     */
    async checkUniqueIso2(codigo_iso2: string, excludeId?: number): Promise<{ exists: boolean; error: any }> {
        let query = `SELECT id_pais FROM paises WHERE codigo_iso2 = $1`;
        const values: any[] = [codigo_iso2];

        if (excludeId) {
            query += ` AND id_pais != $2`;
            values.push(excludeId);
        }

        try {
            const { rows } = await pool.query(query, values);
            return { exists: rows.length > 0, error: null };
        } catch (error: any) {
            return { exists: false, error };
        }
    }
}
