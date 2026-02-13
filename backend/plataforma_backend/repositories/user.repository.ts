import { FastifyRequest, FastifyReply } from 'fastify';
import pool from '../libs/db';

export class UserRepository {
  async findByEmail(email: string) {
    const query = `SELECT u.*, r.name as rol_name, p.id_propietario, i.id_inmueble
      FROM usuarios u
      LEFT JOIN roles r ON u.id_roles = r.id_rol
      LEFT JOIN propietarios p ON u.id_usuario = p.id_usuario
      LEFT JOIN inmuebles i ON p.id_propietario = i.id_propietario
      WHERE u.email = $1`;
    try {
      const { rows } = await pool.query(query, [email]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
  async insert(user: any) {
    const query = `INSERT INTO usuarios (cedula, nombre, apellido, email, password_hash, id_roles, id_empresa, username)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const values = [user.cedula, user.nombre, user.apellido, user.email, user.password_hash, user.id_roles, user.id_empresa ?? null, user.username];
    try {
      const { rows } = await pool.query(query, values);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
  async list() {
    const query = `SELECT u.id_usuario, u.nombre, u.email, u.id_roles, u.id_empresa, u.username, u.creado_en, r.name as rol_name, e.nombre as empresa_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.id_roles = r.id_rol
      LEFT JOIN empresas e ON u.id_empresa = e.id_empresa`;
    try {
      const { rows } = await pool.query(query);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
  async getById(id: string) {
    const query = `SELECT u.id_usuario, u.nombre, u.email, u.id_roles, u.id_empresa, u.creado_en, r.name as rol_name, e.nombre as empresa_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.id_roles = r.id_rol
      LEFT JOIN empresas e ON u.id_empresa = e.id_empresa
      WHERE u.id_usuario = $1`;
    try {
      const { rows } = await pool.query(query, [id]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
  async updatePassword(email: string, password_hash: string) {
    const query = `UPDATE usuarios SET password_hash = $1 WHERE email = $2`;
    try {
      await pool.query(query, [password_hash, email]);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }
  async deleteById(id: string) {
    const query = `DELETE FROM usuarios WHERE id_usuario = $1`;
    try {
      const { rowCount } = await pool.query(query, [id]);
      return { success: !!rowCount && rowCount > 0, error: null };
    } catch (error: any) {
      return { success: false, error };
    }
  }
  async updateById(id: string, data: any) {
    // Construir query dinámico solo con los campos editables
    const allowedFields = ['nombre', 'password_hash', 'id_roles', 'id_empresa', 'creado_en'];
    const fields = Object.keys(data).filter(f => allowedFields.includes(f));
    if (fields.length === 0) {
      return { success: false, error: new Error('No hay campos válidos para actualizar') };
    }
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map(f => data[f]);
    values.push(id);
    const query = `UPDATE usuarios SET ${setClause} WHERE id_usuario = $${fields.length + 1}`;
    try {
      const { rowCount } = await pool.query(query, values);
      return { success: !!rowCount && rowCount > 0, error: null };
    } catch (error: any) {
      return { success: false, error };
    }
  }
  async findById(id_usuario: number) {
    const query = `SELECT id_usuario, id_roles, id_empresa FROM usuarios WHERE id_usuario = $1`;
    try {
      const { rows } = await pool.query(query, [id_usuario]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async listAllExcept(userId: number) {
    const query = `
      SELECT u.id_usuario, u.cedula, u.nombre, u.apellido, u.email, u.id_roles, u.id_empresa, u.username, u.creado_en, r.name as rol_name, e.nombre as empresa_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.id_roles = r.id_rol
      LEFT JOIN empresas e ON u.id_empresa = e.id_empresa
      WHERE id_usuario <> $1;
      `;
    try {
      const { rows } = await pool.query(query, [userId]);
      return { data: rows, error: null };
    } catch (error: any) {
      console.error('Error listing users except self:', error);
      return { data: null, error };
    }
  }

  async listByEmpresaExcept(empresaId: number, userId: number) {
    const query = `
      SELECT u.id_usuario, u.cedula, u.nombre, u.apellido, u.email, u.id_roles, u.id_empresa, u.username, u.creado_en, r.name as rol_name, e.nombre as empresa_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.id_roles = r.id_rol
      LEFT JOIN empresas e ON u.id_empresa = e.id_empresa
      WHERE u.id_empresa = $1 AND u.id_usuario <> $2;
      `;
    try {
      const { rows } = await pool.query(query, [empresaId, userId]);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async listAdminsAndOwnersByEmpresaExcept(empresaId: number, adminId: number, adminRole: number, ownerRole: number) {
    const query = `
      SELECT u.id_usuario, u.cedula, u.nombre, u.apellido, u.email, u.id_roles, u.id_empresa, u.username, u.creado_en, r.name as rol_name, e.nombre as empresa_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.id_roles = r.id_rol
      LEFT JOIN empresas e ON u.id_empresa = e.id_empresa
      WHERE u.id_empresa = $1 AND u.id_roles IN ($2, $3) AND u.id_usuario <> $4;
    `;
    try {
      const { rows } = await pool.query(query, [empresaId, adminRole, ownerRole, adminId]);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async deactivateByEmpresa(empresaId: number) {
    // El usuario pidio poner estado_activo = false.
    // Si la columna no existe, fallara. Añadimos fallback para logear warning.
    const query = `UPDATE usuarios SET estado_activo = false WHERE id_empresa = $1`;
    try {
      const { rowCount } = await pool.query(query, [empresaId]);
      return { success: true, count: rowCount, error: null };
    } catch (error: any) {
      console.error('Error desactivando usuarios de empresa:', error);
      if (error.code === '42703') { // Undefined column
        return { success: false, error: { message: 'Columna estado_activo no existe en usuarios', original: error } };
      }
      return { success: false, error };
    }
  }
}
