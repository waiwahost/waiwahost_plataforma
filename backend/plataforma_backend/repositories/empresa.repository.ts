import { FastifyRequest, FastifyReply } from 'fastify';
import pool from '../libs/db';

export class EmpresaRepository {
  async getEmpresas(id_empresa?: number) {
    let query = `SELECT id_empresa, nombre, nit
      FROM empresas
      WHERE estado = 'activa'`;

    const params: any[] = [];
    if (id_empresa !== undefined) {
      params.push(id_empresa);
      query += ` AND id_empresa = $${params.length}`;
    }

    try {
      const { rows } = await pool.query(query, params);
      return { data: rows, error: null };
    } catch (error: any) {
      console.error('Error al obtener empresas:', error);
      return { data: null, error };
    }
  }

  async getByNit(nit: string) {
    const query = `SELECT id_empresa, nombre, nit FROM empresas WHERE nit = $1`;
    try {
      const { rows } = await pool.query(query, [nit]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      console.error('Error al buscar empresa por NIT:', error);
      return { data: null, error };
    }
  }

  async createEmpresa(empresa: any) {
    const { nombre, nit, plan_actual } = empresa;

    const query = `
      INSERT INTO empresas (nombre, nit, plan_actual)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const params = [nombre, nit, plan_actual];

    try {
      const { rows } = await pool.query(query, params);
      return { data: rows[0], error: null };
    } catch (error: any) {
      console.error('Error al crear empresa:', error);
      return { data: null, error };
    }
  }

  async update(id: number, data: any) {
    const allowedFields = ['nombre', 'nit', 'plan_actual', 'estado'];
    const fields = Object.keys(data).filter(f => allowedFields.includes(f));

    if (fields.length === 0) return { data: null, error: null }; // Nada que actualizar

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map(f => data[f]);
    values.push(id);

    const query = `UPDATE empresas SET ${setClause} WHERE id_empresa = $${values.length} RETURNING *`;

    try {
      const { rows } = await pool.query(query, values);
      return { data: rows[0], error: null };
    } catch (error: any) {
      console.error('Error al actualizar empresa:', error);
      return { data: null, error };
    }
  }
}
