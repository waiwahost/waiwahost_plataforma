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
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;

      // Agregar filtros dinámicamente
      if (filters.id_empresa) {
        query += ` AND i.id_empresa = $${paramIndex}`;
        params.push(filters.id_empresa);
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
          hr.id_reserva
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
          hr.id_reserva
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
    email: string;
    telefono: string;
    documento_tipo: string;
    documento_numero: string;
    fecha_nacimiento: string;
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
        huespedData.email,
        huespedData.email, // Duplicar en correo para compatibilidad
        huespedData.telefono,
        huespedData.documento_tipo,
        huespedData.documento_numero,
        huespedData.fecha_nacimiento,
        huespedData.documento_numero // Duplicar en documento_identidad para compatibilidad
      ];
      
      const result = await dbClient.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear huésped completo:', error);
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
  }>) {
    try {
      if (relaciones.length === 0) return;

      const values = relaciones.map((rel, index) => 
        `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
      ).join(', ');

      const query = `
        INSERT INTO huespedes_reservas (id_reserva, id_huesped, es_principal)
        VALUES ${values}
      `;

      const params = relaciones.flatMap(rel => [
        rel.idReserva,
        rel.idHuesped,
        rel.esPrincipal
      ]);

      await dbClient.query(query, params);
    } catch (error) {
      console.error('Error al relacionar múltiples huéspedes con reserva:', error);
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
    console.log('Updating reserva id:', id, 'with fields:', fields);
    const fieldMap: Record<string, string> = {
      fecha_inicio: 'fecha_inicio',
      fecha_fin: 'fecha_fin',
      numero_huespedes: 'numero_huespedes',
      precio_total: 'precio_total',
      estado: 'estado',
      observaciones: 'observaciones',
      plataforma_origen: 'plataforma_origen',
    };
    const allowedFields = Object.keys(fieldMap);
    console.log('Allowed fields for update:', allowedFields);
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
    console.log('Set clauses for update:', setClauses);
    if (setClauses.length === 0) return null;
    values.push(id);
    console.log('Final query:', `UPDATE reservas SET ${setClauses.join(', ')} WHERE id_reserva = $${idx} RETURNING *`);
    console.log('With values:', values);
    const query = `UPDATE reservas SET ${setClauses.join(', ')} WHERE id_reserva = $${idx} RETURNING *`;
    const { rows } = await dbClient.query(query, values);
    return rows[0] || null;
  }

  /**
   * Anula una reserva por id (eliminación lógica)
   */
  async deleteReserva(id: number): Promise<boolean> {
    if (!id) return false;
    const query = "UPDATE reservas SET estado = 'anulado' WHERE id_reserva = $1";
    const result = await dbClient.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
