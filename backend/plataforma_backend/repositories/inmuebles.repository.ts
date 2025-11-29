import pool from '../libs/db';
import { Inmueble, CreateInmuebleData, EditInmuebleData } from '../interfaces/inmueble.interface';

export class InmueblesRepository {
  /**
   * Obtiene todos los inmuebles
   */
  async getAllInmuebles() {
    const query = `
      SELECT i.id_inmueble, i.nombre, i.descripcion, i.direccion, i.capacidad, 
             i.id_propietario, i.id_empresa, i.estado, i.edificio, i.apartamento,
             i.id_prod_sigo, i.comision, i.precio_limpieza, i.capacidad_maxima,
             i.nro_habitaciones, i.nro_bahnos, i.cocina,
             e.nombre as empresa_nombre,
             u.nombre as propietario_nombre, u.email as propietario_email
      FROM inmuebles i
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE i.estado = 'activo'
      ORDER BY i.id_inmueble DESC
    `;
    try {
      const { rows } = await pool.query(query);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  /**
   * Obtiene inmuebles filtrados por empresa
   */
  async getInmueblesByEmpresa(empresaId: number) {
    const query = `
      SELECT i.id_inmueble, i.nombre, i.descripcion, i.direccion, i.capacidad, 
             i.id_propietario, i.id_empresa, i.estado, i.edificio, i.apartamento,
             i.id_prod_sigo, i.comision, i.precio_limpieza, i.capacidad_maxima,
             i.nro_habitaciones, i.nro_bahnos, i.cocina,
             e.nombre as empresa_nombre,
             u.nombre as propietario_nombre, u.email as propietario_email
      FROM inmuebles i
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE i.id_empresa = $1 AND i.estado = 'activo'
      ORDER BY i.id_inmueble DESC
    `;
    try {
      const { rows } = await pool.query(query, [empresaId]);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  /**
   * Obtiene un inmueble específico por ID
   */
  async getInmuebleById(inmuebleId: number) {
    const query = `
      SELECT i.id_inmueble, i.nombre, i.descripcion, i.direccion, i.capacidad, 
             i.id_propietario, i.id_empresa, i.estado, i.edificio, i.apartamento,
             i.id_prod_sigo, i.comision, i.precio_limpieza, i.capacidad_maxima,
             i.nro_habitaciones, i.nro_bahnos, i.cocina,
             e.nombre as empresa_nombre,
             u.nombre as propietario_nombre, u.email as propietario_email
      FROM inmuebles i
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE i.id_inmueble = $1 AND i.estado = 'activo'
    `;
    try {
      const { rows } = await pool.query(query, [inmuebleId]);
      return { data: rows[0] || null, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  /**
   * Obtiene inmuebles filtrados por empresa y propietario
   */
  async getInmueblesByEmpresaAndPropietario(empresaId: number, propietarioId: number) {
    const query = `
      SELECT i.id_inmueble, i.nombre, i.descripcion, i.direccion, i.capacidad, 
             i.id_propietario, i.id_empresa, i.estado, i.edificio, i.apartamento,
             i.id_prod_sigo, i.comision, i.precio_limpieza, i.capacidad_maxima,
             i.nro_habitaciones, i.nro_bahnos, i.cocina,
             e.nombre as empresa_nombre,
             u.nombre as propietario_nombre, u.email as propietario_email
      FROM inmuebles i
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE i.id_empresa = $1 AND i.id_propietario = $2 AND i.estado = 'activo'
      ORDER BY i.id_inmueble DESC
    `;
    try {
      const { rows } = await pool.query(query, [empresaId, propietarioId]);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  /**
   * Crea un nuevo inmueble
   */
  async createInmueble(inmuebleData: CreateInmuebleData): Promise<{ data: Inmueble | null; error: any }> {
    const query = `
      INSERT INTO inmuebles (
        nombre, descripcion, direccion, capacidad, id_propietario, id_empresa,
        edificio, apartamento, id_prod_sigo, comision, precio_limpieza,
        capacidad_maxima, nro_habitaciones, nro_bahnos, cocina, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'activo')
      RETURNING *
    `;
    
    const values = [
      inmuebleData.nombre,
      inmuebleData.descripcion || null,
      inmuebleData.direccion,
      inmuebleData.capacidad,
      inmuebleData.id_propietario,
      inmuebleData.id_empresa || null,
      inmuebleData.edificio || null,
      inmuebleData.apartamento || null,
      inmuebleData.id_prod_sigo || null,
      inmuebleData.comision || null,
      inmuebleData.precio_limpieza || null,
      inmuebleData.capacidad_maxima || null,
      inmuebleData.nro_habitaciones || null,
      inmuebleData.nro_bahnos || null,
      inmuebleData.cocina || null
    ];

    try {
      const { rows } = await pool.query(query, values);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  /**
   * Actualiza un inmueble existente
   */
  async updateInmueble(inmuebleId: number, inmuebleData: EditInmuebleData): Promise<{ data: Inmueble | null; error: any }> {
    const setClause: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    // Construir dinámicamente la query de actualización
    Object.entries(inmuebleData).forEach(([key, value]) => {
      if (value !== undefined) {
        setClause.push(`${key} = $${valueIndex}`);
        values.push(value);
        valueIndex++;
      }
    });

    if (setClause.length === 0) {
      return { data: null, error: new Error('No hay datos para actualizar') };
    }

    const query = `
      UPDATE inmuebles 
      SET ${setClause.join(', ')}
      WHERE id_inmueble = $${valueIndex}
      RETURNING *
    `;
    
    values.push(inmuebleId);

    try {
      const { rows } = await pool.query(query, values);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  /**
   * Marca un inmueble como inactivo (eliminación lógica)
   */
  async deleteInmueble(inmuebleId: number): Promise<{ data: Inmueble | null; error: any }> {
    const query = `
      UPDATE inmuebles 
      SET estado = 'inactivo'
      WHERE id_inmueble = $1
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [inmuebleId]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  /**
   * Verifica si un inmueble existe y está activo
   */
  async inmuebleExists(inmuebleId: number): Promise<{ exists: boolean; error: any }> {
    const query = `SELECT id_inmueble FROM inmuebles WHERE id_inmueble = $1 AND estado = 'activo'`;
    
    try {
      const { rows } = await pool.query(query, [inmuebleId]);
      return { exists: rows.length > 0, error: null };
    } catch (error: any) {
      return { exists: false, error };
    }
  }

  /**
   * Obtiene el id_propietario asociado a un usuario
   */
  async getPropietarioIdByUserId(userId: number) {
    const query = `SELECT id_propietario FROM propietarios WHERE id_usuario = $1`;
    try {
      const { rows } = await pool.query(query, [userId]);
      return { data: rows[0]?.id_propietario || null, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  /**
   * Verifica si un propietario existe
   */
  async propietarioExists(propietarioId: number): Promise<{ exists: boolean; error: any }> {
    const query = `SELECT id_propietario FROM propietarios WHERE id_propietario = $1`;
    
    try {
      const { rows } = await pool.query(query, [propietarioId]);
      return { exists: rows.length > 0, error: null };
    } catch (error: any) {
      return { exists: false, error };
    }
  }
}