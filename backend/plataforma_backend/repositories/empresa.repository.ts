import { FastifyRequest, FastifyReply } from 'fastify';
import pool from '../libs/db';

export class EmpresaRepository {
  async getEmpresas(id_empresa?: number) {
    let query = `SELECT id_empresa, nombre
      FROM empresas
      WHERE estado = 'activa'`;

    const params: any[] = [];
    if (id_empresa !== undefined) {
      params.push(id_empresa);
      query += ` AND id_empresa = $${params.length}`;
    }

    try {
      const { rows } = await pool.query(query, params);
      console.log('Empresas obtenidas:', rows);
      return { data: rows, error: null };
    } catch (error: any) {
      console.error('Error al obtener empresas:', error);
      return { data: null, error };
    }
  }
}
