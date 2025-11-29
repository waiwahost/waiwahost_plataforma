import { FastifyRequest, FastifyReply } from 'fastify';
import pool from '../libs/db';

export class EmpresaRepository {
  async getEmpresas() {
    const query = `SELECT id_empresa, nombre
      FROM empresas
      WHERE estado = 'activa';`;
    try {
      const { rows } = await pool.query(query);
      console.log('Empresas obtenidas:', rows);
      return { data: rows, error: null };
    } catch (error: any) {
      console.error('Error al obtener empresas:', error);
      return { data: null, error };
    }
  }
}
