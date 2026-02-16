import pool from '../libs/db';
import { Ciudad, CreateCiudadData, EditCiudadData } from '../interfaces/ciudad.interface';

export class CiudadesRepository {
    /**
     * Obtiene todas las ciudades con información del país (JOIN)
     */
    async getAllCiudades() {
        const query = `
      SELECT c.id_ciudad, c.nombre, c.id_pais, c.fecha_creacion, c.fecha_actualizacion,
             p.nombre as pais_nombre
      FROM ciudades c
      INNER JOIN paises p ON c.id_pais = p.id_pais
      ORDER BY p.nombre ASC, c.nombre ASC
    `;
        try {
            const { rows } = await pool.query(query);
            return { data: rows, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Obtiene una ciudad específica por ID con información del país
     */
    async getCiudadById(ciudadId: number) {
        const query = `
      SELECT c.id_ciudad, c.nombre, c.id_pais, c.fecha_creacion, c.fecha_actualizacion,
             p.nombre as pais_nombre
      FROM ciudades c
      INNER JOIN paises p ON c.id_pais = p.id_pais
      WHERE c.id_ciudad = $1
    `;
        try {
            const { rows } = await pool.query(query, [ciudadId]);
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Obtiene ciudades filtradas por país
     */
    async getCiudadesByPais(paisId: number) {
        const query = `
      SELECT c.id_ciudad, c.nombre, c.id_pais, c.fecha_creacion, c.fecha_actualizacion,
             p.nombre as pais_nombre
      FROM ciudades c
      INNER JOIN paises p ON c.id_pais = p.id_pais
      WHERE c.id_pais = $1
      ORDER BY c.nombre ASC
    `;
        try {
            const { rows } = await pool.query(query, [paisId]);
            return { data: rows, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Crea una nueva ciudad
     */
    async createCiudad(ciudadData: CreateCiudadData): Promise<{ data: Ciudad | null; error: any }> {
        const query = `
      INSERT INTO ciudades (nombre, id_pais)
      VALUES ($1, $2)
      RETURNING *
    `;

        const values = [
            ciudadData.nombre,
            ciudadData.id_pais,
        ];

        try {
            const { rows } = await pool.query(query, values);
            return { data: rows[0], error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Actualiza una ciudad existente
     */
    async updateCiudad(ciudadId: number, ciudadData: EditCiudadData): Promise<{ data: Ciudad | null; error: any }> {
        const setClause: string[] = [];
        const values: any[] = [];
        let valueIndex = 1;

        // Construir dinámicamente la query de actualización
        Object.entries(ciudadData).forEach(([key, value]) => {
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
      UPDATE ciudades 
      SET ${setClause.join(', ')}
      WHERE id_ciudad = $${valueIndex}
      RETURNING *
    `;

        values.push(ciudadId);

        try {
            const { rows } = await pool.query(query, values);
            return { data: rows[0], error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Verifica si una ciudad existe
     */
    async ciudadExists(ciudadId: number): Promise<{ exists: boolean; error: any }> {
        const query = `SELECT id_ciudad FROM ciudades WHERE id_ciudad = $1`;

        try {
            const { rows } = await pool.query(query, [ciudadId]);
            return { exists: rows.length > 0, error: null };
        } catch (error: any) {
            return { exists: false, error };
        }
    }

    /**
     * Verifica si un nombre de ciudad ya existe en un país específico (para validación de unicidad)
     */
    async checkUniqueNombreInPais(nombre: string, paisId: number, excludeId?: number): Promise<{ exists: boolean; error: any }> {
        let query = `SELECT id_ciudad FROM ciudades WHERE nombre = $1 AND id_pais = $2`;
        const values: any[] = [nombre, paisId];

        if (excludeId) {
            query += ` AND id_ciudad != $3`;
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
