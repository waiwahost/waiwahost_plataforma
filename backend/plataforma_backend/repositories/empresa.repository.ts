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

  async softDelete(id: number) {
    // Intenta actualizar estado a 'inactiva' y poner fecha_fin
    // Si fecha_fin no existe, fallara, asi que lo manejaremos.
    // El usuario dijo "se pone la fecha_fin".
    const query = `UPDATE empresas SET estado = 'inactiva', fecha_fin = NOW() WHERE id_empresa = $1 RETURNING *`;

    try {
      const { rows } = await pool.query(query, [id]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      console.error('Error al desactivar empresa (Soft Delete):', error);
      // Fallback si fecha_fin no existe?
      // return { data: null, error };
      if (error.code === '42703') { // Undefined column
        console.warn('Columna fecha_fin no existe, intentando solo estado inactiva');
        const queryFallback = `UPDATE empresas SET estado = 'inactiva' WHERE id_empresa = $1 RETURNING *`;
        try {
          const { rows } = await pool.query(queryFallback, [id]);
          return { data: rows[0], error: null, warning: 'Columna fecha_fin no existe' };
        } catch (err: any) {
          return { data: null, error: err };
        }
      }
      return { data: null, error };
    }
  }

  async hardDelete(id: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Orden de borrado: 
      // 1. Movimientos (id_empresa string)
      // 2. Pagos (id_empresa int)
      // 3. Inmuebles (id_empresa int)
      // 4. Propietarios (id_empresa int)
      // 5. Usuarios (id_empresa int)
      // 6. Empresa (id_empresa int)

      const idString = String(id);

      // Movimientos
      await client.query(`DELETE FROM movimientos WHERE id_empresa = $1`, [idString]);

      // Pagos
      await client.query(`DELETE FROM pagos WHERE id_empresa = $1`, [id]);

      // Huespedes (dependientes de reservas de la empresa)
      // Asumiendo tabla huespedes con id_reserva
      await client.query(`DELETE FROM huespedes WHERE id_reserva IN (SELECT id_reserva FROM reservas WHERE id_empresa = $1)`, [id]);

      // Inmuebles
      await client.query(`DELETE FROM inmuebles WHERE id_empresa = $1`, [id]);

      // Reservas
      await client.query(`DELETE FROM reservas WHERE id_inmueble IN (SELECT id_inmueble FROM inmuebles WHERE id_empresa = $1)`, [id]);

      // Propietarios
      await client.query(`DELETE FROM propietarios WHERE id_empresa = $1`, [id]);

      // Usuarios
      await client.query(`DELETE FROM usuarios WHERE id_empresa = $1`, [id]);

      // Empresa
      const { rows } = await client.query(`DELETE FROM empresas WHERE id_empresa = $1 RETURNING *`, [id]);

      await client.query('COMMIT');
      return { data: rows[0], error: null };
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('Error en Hard Delete de empresa:', error);
      return { data: null, error };
    } finally {
      client.release();
    }
  }
}
