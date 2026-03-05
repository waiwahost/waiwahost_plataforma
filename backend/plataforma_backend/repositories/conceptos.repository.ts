import pool from '../libs/db';
import { Concepto, CreateConceptoData, EditConceptoData } from '../interfaces/concepto.interface';

export class ConceptosRepository {
    /**
     * Genera un slug a partir de un nombre
     */
    private generarSlug(nombre: string): string {
        return nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quita tildes
            .replace(/[^a-z0-9\s_]/g, '')
            .trim()
            .replace(/\s+/g, '_');
    }

    /**
     * Obtiene conceptos con filtros opcionales.
     * Retorna los globales (id_empresa IS NULL) + los de la empresa indicada.
     */
    async getConceptos(params: {
        tipo?: string;
        busqueda?: string;
        id_empresa?: number;
    }): Promise<{ data: Concepto[] | null; error: any }> {
        const conditions: string[] = [`c.estado = 'activo'`];
        const values: any[] = [];
        let idx = 1;

        // Filtro de empresa: globales + los de la empresa específica
        if (params.id_empresa !== undefined) {
            conditions.push(`(c.id_empresa IS NULL OR c.id_empresa = $${idx})`);
            values.push(params.id_empresa);
            idx++;
        }

        // Filtro por tipo de movimiento
        if (params.tipo) {
            conditions.push(`$${idx} = ANY(c.tipo_movimiento)`);
            values.push(params.tipo);
            idx++;
        }

        // Filtro de búsqueda por nombre
        if (params.busqueda) {
            conditions.push(`c.nombre ILIKE $${idx}`);
            values.push(`%${params.busqueda}%`);
            idx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const query = `
      SELECT 
        c.id_concepto, c.nombre, c.slug, c.tipo_movimiento,
        c.id_empresa, c.estado, c.creado_en
      FROM conceptos c
      ${whereClause}
      ORDER BY c.id_empresa NULLS FIRST, c.nombre ASC
    `;

        try {
            const { rows } = await pool.query(query, values);
            return { data: rows, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Verifica si un concepto (por slug) es válido para un tipo de movimiento.
     * Busca conceptos globales o de la empresa indicada.
     */
    async conceptoExisteParaTipo(params: {
        slug: string;
        tipo: string;
        id_empresa?: number | null;
    }): Promise<{ exists: boolean; error: any }> {
        const query = `
      SELECT 1 FROM conceptos
      WHERE slug = $1
        AND $2 = ANY(tipo_movimiento)
        AND estado = 'activo'
        AND (id_empresa IS NULL OR id_empresa = $3)
      LIMIT 1
    `;
        try {
            const { rows } = await pool.query(query, [
                params.slug,
                params.tipo,
                params.id_empresa ?? null,
            ]);
            return { exists: rows.length > 0, error: null };
        } catch (error: any) {
            return { exists: false, error };
        }
    }

    /**
     * Busca un concepto por su slug dentro del scope (global + empresa)
     */
    async getConceptoBySlug(slug: string, id_empresa?: number | null): Promise<{ data: Concepto | null; error: any }> {
        const query = `
      SELECT * FROM conceptos
      WHERE slug = $1
        AND estado = 'activo'
        AND (id_empresa IS NULL OR id_empresa = $2)
      LIMIT 1
    `;
        try {
            const { rows } = await pool.query(query, [slug, id_empresa ?? null]);
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Verifica si un slug ya existe (globalmente o en la empresa)
     */
    async slugExiste(slug: string, id_empresa?: number | null): Promise<{ exists: boolean; error: any }> {
        const query = `
      SELECT 1 FROM conceptos
      WHERE slug = $1
        AND (id_empresa IS NULL OR id_empresa = $2)
      LIMIT 1
    `;
        try {
            const { rows } = await pool.query(query, [slug, id_empresa ?? null]);
            return { exists: rows.length > 0, error: null };
        } catch (error: any) {
            return { exists: false, error };
        }
    }

    /**
     * Crea un nuevo concepto
     */
    async createConcepto(data: CreateConceptoData): Promise<{ data: Concepto | null; error: any }> {
        const slug = data.slug || this.generarSlug(data.nombre);
        const query = `
      INSERT INTO conceptos (nombre, slug, tipo_movimiento, id_empresa)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        try {
            const { rows } = await pool.query(query, [
                data.nombre,
                slug,
                data.tipo_movimiento,
                data.id_empresa ?? null,
            ]);
            return { data: rows[0], error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Actualiza un concepto existente
     */
    async updateConcepto(id: number, data: EditConceptoData): Promise<{ data: Concepto | null; error: any }> {
        const setClauses: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.nombre !== undefined) { setClauses.push(`nombre = $${idx++}`); values.push(data.nombre); }
        if (data.slug !== undefined) { setClauses.push(`slug = $${idx++}`); values.push(data.slug); }
        if (data.tipo_movimiento !== undefined) { setClauses.push(`tipo_movimiento = $${idx++}`); values.push(data.tipo_movimiento); }
        if (data.estado !== undefined) { setClauses.push(`estado = $${idx++}`); values.push(data.estado); }

        if (setClauses.length === 0) {
            return { data: null, error: new Error('No hay datos para actualizar') };
        }

        const query = `
      UPDATE conceptos SET ${setClauses.join(', ')}
      WHERE id_concepto = $${idx}
      RETURNING *
    `;
        values.push(id);

        try {
            const { rows } = await pool.query(query, values);
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Soft delete: marca el concepto como inactivo
     */
    async deleteConcepto(id: number): Promise<{ data: Concepto | null; error: any }> {
        const query = `
      UPDATE conceptos SET estado = 'inactivo'
      WHERE id_concepto = $1
      RETURNING *
    `;
        try {
            const { rows } = await pool.query(query, [id]);
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }
}
