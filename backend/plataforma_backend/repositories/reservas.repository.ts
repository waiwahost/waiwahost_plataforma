import dbClient from '../libs/db';
import { GetReservasQuery, Reserva } from '../interfaces/reserva.interface';

export class ReservasRepository {

  /**
   * Obtiene las reservas con filtros opcionales
   */
  async getReservas(filters: GetReservasQuery = {}): Promise<any[]> {
    try {
      let query = `
        SELECT 
          r.id_reserva as id,
          r.codigo_reserva,
          r.fecha_inicio as fecha_inicio,
          r.fecha_fin as fecha_fin,
          r.estado,
          r.created_at as fecha_creacion,
          r.precio_total,
          r.total_reserva,
          r.total_pagado,
          r.total_pendiente,
          r.observaciones,
          r.numero_huespedes,
          r.plataforma_origen,
          i.id_inmueble,
          i.nombre as nombre_inmueble,
          i.id_empresa
        FROM reservas r
        INNER JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
        WHERE i.estado = 'activo'
      `;

      const params: any[] = [];
      let paramIndex = 1;

      // Agregar filtros dinámicamente
      if (filters.id) {
        query += ` AND r.id_reserva = $${paramIndex}`;
        params.push(filters.id);
        paramIndex++;
      }

      if (filters.id_empresa) {
        query += ` AND i.id_empresa = $${paramIndex}`;
        params.push(filters.id_empresa);
        paramIndex++;
      }

      if (filters.id_inmueble) {
        query += ` AND r.id_inmueble = $${paramIndex}`;
        params.push(filters.id_inmueble);
        paramIndex++;
      }

      if (filters.estado) {
        query += ` AND r.estado = $${paramIndex}`;
        params.push(filters.estado);
        paramIndex++;
      }

      if (filters.fecha_inicio) {
        query += ` AND r.fecha_inicio >= $${paramIndex}`;
        params.push(filters.fecha_inicio);
        paramIndex++;
      }

      if (filters.fecha_fin) {
        query += ` AND r.fecha_fin <= $${paramIndex}`;
        params.push(filters.fecha_fin);
        paramIndex++;
      }

      query += ' ORDER BY r.created_at DESC';

      const result = await dbClient.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      throw error;
    }
  }

  /**
   * Obtiene los huéspedes de una reserva específica
   */
  async getHuespedesByReservaId(idReserva: number) {
    try {
      const query = `
        SELECT 
          h.id_huesped as id,
          h.nombre,
          h.apellido,
          h.email,
          h.correo,
          h.telefono,
          h.documento_tipo,
          h.documento_numero,
          h.fecha_nacimiento,
          hr.es_principal,
          hr.id_reserva,
          hr.ciudad_residencia,
          hr.ciudad_procedencia,
          hr.motivo
        FROM huespedes h
        INNER JOIN huespedes_reservas hr ON h.id_huesped = hr.id_huesped
        WHERE hr.id_reserva = $1
        ORDER BY hr.es_principal DESC
      `;

      const result = await dbClient.query(query, [idReserva]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener huéspedes de la reserva:', error);
      throw error;
    }
  }

  /**
   * Obtiene múltiples huéspedes por IDs de reservas
   */
  async getHuespedesByReservaIds(reservaIds: number[]) {
    try {
      if (reservaIds.length === 0) return [];

      const placeholders = reservaIds.map((_, index) => `$${index + 1}`).join(',');
      const query = `
        SELECT 
          h.id_huesped as id,
          h.nombre,
          h.apellido,
          h.email,
          h.correo,
          h.telefono,
          h.documento_tipo,
          h.documento_numero,
          h.fecha_nacimiento,
          hr.es_principal,
          hr.id_reserva,
          hr.ciudad_residencia,
          hr.ciudad_procedencia,
          hr.motivo
        FROM huespedes h
        INNER JOIN huespedes_reservas hr ON h.id_huesped = hr.id_huesped
        WHERE hr.id_reserva IN (${placeholders})
        ORDER BY hr.id_reserva, hr.es_principal DESC
      `;

      const result = await dbClient.query(query, reservaIds);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener huéspedes por IDs de reservas:', error);
      throw error;
    }
  }

  /**
   * Genera el siguiente código de reserva
   */
  async generateNextCodigoReserva(): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const query = `
        SELECT COUNT(*) as total 
        FROM reservas 
        WHERE EXTRACT(YEAR FROM created_at) = $1
      `;

      const result = await dbClient.query(query, [year]);
      const total = parseInt(result.rows[0].total) + 1;
      const paddedNumber = total.toString().padStart(3, '0');

      return `RSV-${year}-${paddedNumber}`;
    } catch (error) {
      console.error('Error al generar código de reserva:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva reserva
   */
  async createReserva(reservaData: {
    id_inmueble: number;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    codigo_reserva: string;
    precio_total: number;
    total_reserva: number;
    total_pagado: number;
    total_pendiente: number;
    observaciones?: string;
    numero_huespedes: number;
    plataforma_origen: string;
  }) {
    try {
      const query = `
        INSERT INTO reservas (
          id_inmueble, 
          fecha_inicio, 
          fecha_fin, 
          estado,
          codigo_reserva,
          precio_total,
          total_reserva,
          total_pagado,
          total_pendiente,
          observaciones,
          numero_huespedes,
          plataforma_origen
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id_reserva as id, created_at
      `;

      const values = [
        reservaData.id_inmueble,
        reservaData.fecha_inicio,
        reservaData.fecha_fin,
        reservaData.estado,
        reservaData.codigo_reserva,
        reservaData.precio_total,
        reservaData.total_reserva,
        reservaData.total_pagado,
        reservaData.total_pendiente,
        reservaData.observaciones,
        reservaData.numero_huespedes,
        reservaData.plataforma_origen
      ];

      const result = await dbClient.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear reserva:', error);
      throw error;
    }
  }

  /**
   * Busca un huésped existente por número de documento
   */
  async findHuespedByDocumento(documentoNumero: string) {
    try {
      const query = `
        SELECT 
          id_huesped as id,
          nombre,
          apellido,
          email,
          correo,
          telefono,
          documento_tipo,
          documento_numero,
          fecha_nacimiento
        FROM huespedes 
        WHERE documento_numero = $1 OR documento_identidad = $1
        LIMIT 1
      `;

      const result = await dbClient.query(query, [documentoNumero]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al buscar huésped por documento:', error);
      throw error;
    }
  }

  /**
   * Busca múltiples huéspedes por números de documento
   */
  async findHuespedesByDocumentos(documentos: string[]) {
    try {
      if (documentos.length === 0) return [];

      const placeholders = documentos.map((_, index) => `$${index + 1}`).join(',');

      const query = `
        SELECT 
          id_huesped as id,
          nombre,
          apellido,
          email,
          correo,
          telefono,
          documento_tipo,
          documento_numero,
          documento_identidad,
          fecha_nacimiento
        FROM huespedes 
        WHERE documento_numero IN (${placeholders}) 
           OR documento_identidad IN (${placeholders})
      `;

      const result = await dbClient.query(query, documentos);
      return result.rows;
    } catch (error) {
      console.error('Error al buscar huéspedes por documentos:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo huésped con datos completos
   */
  async createHuespedCompleto(huespedData: {
    nombre: string;
    apellido: string;
    email?: string | null;
    telefono?: string | null;
    documento_tipo?: string | null;
    documento_numero?: string | null;
    fecha_nacimiento?: string | null;
  }) {
    try {
      const query = `
        INSERT INTO huespedes (
          nombre,
          apellido,
          email,
          correo,
          telefono,
          documento_tipo,
          documento_numero,
          fecha_nacimiento,
          documento_identidad
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id_huesped as id
      `;

      const values = [
        huespedData.nombre,
        huespedData.apellido,
        huespedData.email || null,
        huespedData.email || null, // Duplicar en correo
        huespedData.telefono || null,
        huespedData.documento_tipo || null,
        huespedData.documento_numero || null,
        huespedData.fecha_nacimiento || null,
        huespedData.documento_numero || null // Duplicar en documento_identidad
      ];

      const result = await dbClient.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear huésped completo:', error);
      throw error;
    }
  }

  /**
   * Actualiza un huésped existente
   */
  async updateHuesped(id: number, huespedData: {
    nombre?: string;
    apellido?: string;
    email?: string | null;
    telefono?: string | null;
    documento_tipo?: string | null;
    documento_numero?: string | null;
    fecha_nacimiento?: string | null;
  }) {
    try {
      if (!id) return null;

      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (huespedData.nombre !== undefined) { setClauses.push(`nombre = $${idx++}`); values.push(huespedData.nombre); }
      if (huespedData.apellido !== undefined) { setClauses.push(`apellido = $${idx++}`); values.push(huespedData.apellido); }
      if (huespedData.email !== undefined) {
        setClauses.push(`email = $${idx++}`); values.push(huespedData.email);
        setClauses.push(`correo = $${idx - 1}`); // Update legacy column too
      }
      if (huespedData.telefono !== undefined) { setClauses.push(`telefono = $${idx++}`); values.push(huespedData.telefono); }
      if (huespedData.documento_tipo !== undefined) { setClauses.push(`documento_tipo = $${idx++}`); values.push(huespedData.documento_tipo); }
      if (huespedData.documento_numero !== undefined) {
        setClauses.push(`documento_numero = $${idx++}`); values.push(huespedData.documento_numero);
        setClauses.push(`documento_identidad = $${idx - 1}`); // Update legacy column too
      }
      if (huespedData.fecha_nacimiento !== undefined) { setClauses.push(`fecha_nacimiento = $${idx++}`); values.push(huespedData.fecha_nacimiento); }

      if (setClauses.length === 0) return null;

      values.push(id);
      const query = `UPDATE huespedes SET ${setClauses.join(', ')} WHERE id_huesped = $${idx} RETURNING *`;

      const result = await dbClient.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al actualizar huésped:', error);
      throw error;
    }
  }

  /**
   * Crea múltiples relaciones huésped-reserva
   */
  async linkMultipleHuespedesReserva(relaciones: Array<{
    idReserva: number;
    idHuesped: number;
    esPrincipal: boolean;
    ciudad_residencia?: string | null;
    ciudad_procedencia?: string | null;
    motivo?: string | null;
  }>) {
    try {
      if (relaciones.length === 0) return;

      const values = relaciones.map((_, index) =>
        `($${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3},
          $${index * 6 + 4}, $${index * 6 + 5}, $${index * 6 + 6})`
      ).join(', ');


      const query = `
        INSERT INTO huespedes_reservas (id_reserva, id_huesped, es_principal, ciudad_residencia, ciudad_procedencia, motivo)
        VALUES ${values}
      `;

      const params = relaciones.flatMap(rel => [
        rel.idReserva,
        rel.idHuesped,
        rel.esPrincipal,
        rel.ciudad_residencia ?? null,
        rel.ciudad_procedencia ?? null,
        rel.motivo ?? null
      ]);

      await dbClient.query(query, params);
    } catch (error) {
      console.error('Error al relacionar múltiples huéspedes con reserva:', error);
      throw error;
    }
  }

  /**
   * Actualiza la información de un huésped específica para una reserva (en la tabla intermedia)
   */
  async updateHuespedReservaInfo(idReserva: number, idHuesped: number, data: {
    ciudad_residencia?: string | null;
    ciudad_procedencia?: string | null;
    motivo?: string | null;
    es_principal?: boolean;
  }) {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.ciudad_residencia !== undefined) { setClauses.push(`ciudad_residencia = $${idx++}`); values.push(data.ciudad_residencia); }
      if (data.ciudad_procedencia !== undefined) { setClauses.push(`ciudad_procedencia = $${idx++}`); values.push(data.ciudad_procedencia); }
      if (data.motivo !== undefined) { setClauses.push(`motivo = $${idx++}`); values.push(data.motivo); }
      if (data.es_principal !== undefined) { setClauses.push(`es_principal = $${idx++}`); values.push(data.es_principal); }

      if (setClauses.length === 0) return;

      values.push(idReserva, idHuesped);
      const query = `
        UPDATE huespedes_reservas 
        SET ${setClauses.join(', ')} 
        WHERE id_reserva = $${idx++} AND id_huesped = $${idx}
      `;

      await dbClient.query(query, values);
    } catch (error) {
      console.error('Error al actualizar relación huésped-reserva:', error);
      throw error;
    }
  }

  /**
   * Relaciona un huésped con una reserva
   */
  async linkHuespedToReserva(idReserva: number, idHuesped: number, esPrincipal: boolean = true) {
    try {
      const query = `
        INSERT INTO huespedes_reservas (id_reserva, id_huesped, es_principal)
        VALUES ($1, $2, $3)
      `;

      await dbClient.query(query, [idReserva, idHuesped, esPrincipal]);
    } catch (error) {
      console.error('Error al relacionar huésped con reserva:', error);
      throw error;
    }
  }

  /**
   * Obtiene una reserva específica por ID
   */
  async getReservaById(idReserva: number) {
    try {
      const query = `
        SELECT 
          r.id_reserva as id,
          r.codigo_reserva,
          r.fecha_inicio as fecha_inicio,
          r.fecha_fin as fecha_fin,
          r.estado,
          r.created_at as fecha_creacion,
          r.precio_total,
          r.total_reserva,
          r.total_pagado,
          r.total_pendiente,
          r.observaciones,
          r.numero_huespedes,
          r.plataforma_origen,
          i.id_inmueble,
          i.nombre as nombre_inmueble,
          i.id_empresa
        FROM reservas r
        INNER JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
        WHERE r.id_reserva = $1
      `;

      const result = await dbClient.query(query, [idReserva]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al obtener reserva por ID:', error);
      throw error;
    }
  }

  /**
   * Actualiza una reserva por id, solo los campos enviados (dinámico).
   * No permite editar codigo_reserva ni id.
   */
  async updateReserva(id: number, fields: Partial<Omit<Reserva, 'id' | 'codigo_reserva'>>): Promise<Reserva | null> {
    if (!id || Object.keys(fields).length === 0) return null;
    // Mapeo de campos del modelo a la base de datos
    const fieldMap: Record<string, string> = {
      fecha_inicio: 'fecha_inicio',
      fecha_fin: 'fecha_fin',
      numero_huespedes: 'numero_huespedes',
      precio_total: 'precio_total',
      total_reserva: 'total_reserva',
      total_pagado: 'total_pagado',
      total_pendiente: 'total_pendiente',
      estado: 'estado',
      observaciones: 'observaciones',
      plataforma_origen: 'plataforma_origen',
    };
    const allowedFields = Object.keys(fieldMap);
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const key of allowedFields) {
      if (fields[key as keyof typeof fields] !== undefined) {
        setClauses.push(`${fieldMap[key]} = $${idx}`);
        values.push(fields[key as keyof typeof fields]);
        idx++;
      }
    }
    if (setClauses.length === 0) return null;
    values.push(id);
    const query = `UPDATE reservas SET ${setClauses.join(', ')} WHERE id_reserva = $${idx} RETURNING *`;
    const { rows } = await dbClient.query(query, values);
    return rows[0] || null;
  }

  /**
   * Anula una reserva por id (eliminación lógica)
   */
  async deleteReserva(id: number): Promise<boolean> {
    if (!id) return false;

    // Obtener un cliente del pool para manejar la transacción
    const client = await dbClient.connect();

    try {
      await client.query('BEGIN');

      // 1. Eliminar pagos asociados
      const pagosResult = await client.query('DELETE FROM pagos WHERE id_reserva = $1', [id]);

      // 2. Eliminar movimientos (ingresos/egresos) asociados
      // Nota: movimientos usa id_reserva como string en algunas partes, asegurar compatibilidad
      const movimientosResult = await client.query('DELETE FROM movimientos WHERE id_reserva = $1', [id.toString()]);

      // 3. Eliminar relación huespedes_reservas
      const huespedesResult = await client.query('DELETE FROM huespedes_reservas WHERE id_reserva = $1', [id]);

      // 4. Eliminar la reserva
      const reservaResult = await client.query('DELETE FROM reservas WHERE id_reserva = $1', [id]);

      await client.query('COMMIT');

      return (reservaResult.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`[CASCADE DELETE] TRANSACTION ROLLED BACK due to error:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}
