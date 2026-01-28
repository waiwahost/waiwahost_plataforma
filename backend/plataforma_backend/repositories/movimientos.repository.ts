import pool from '../libs/db';
import {
  Movimiento,
  CreateMovimientoData,
  EditMovimientoData,
  ResumenDiario,
  InmuebleSelector
} from '../interfaces/movimiento.interface';
import { v4 as uuidv4 } from 'uuid';

export class MovimientosRepository {
  /**
   * Obtiene movimientos por fecha y empresa
   */
  static async getMovimientosByFecha(fecha: string, empresaId?: string, plataformaOrigen?: string): Promise<Movimiento[]> {
    let query = `
      SELECT 
        m.id,
        m.fecha,
        m.tipo,
        m.concepto,
        m.descripcion,
        m.monto,
        m.id_inmueble,
        i.nombre as nombre_inmueble,
        m.id_reserva,
        r.codigo_reserva as codigo_reserva,
        m.metodo_pago,
        m.comprobante,
        m.id_empresa,
        m.fecha_creacion,
        m.fecha_actualizacion,
        m.plataforma_origen,
        m.id_pago
      FROM movimientos m
      LEFT JOIN inmuebles i ON m.id_inmueble = i.id_inmueble::text
      LEFT JOIN reservas r ON m.id_reserva = r.id_reserva::text
      WHERE m.fecha = $1
    `;
    const params: any[] = [fecha];
    if (empresaId) {
      query += ` AND m.id_empresa = $${params.length + 1}`;
      params.push(empresaId);
    }
    if (plataformaOrigen) {
      query += ` AND m.plataforma_origen = $${params.length + 1}`;
      params.push(plataformaOrigen);
    }
    query += ` ORDER BY m.fecha_creacion DESC`;
    const { rows } = await pool.query(query, params);
    return rows;
  }

  /**
   * Obtiene movimientos por inmueble y fecha
   */
  static async getMovimientosByInmuebleFecha(idInmueble: string, fecha: string): Promise<Movimiento[]> {
    const query = `
      SELECT 
        m.id,
        m.fecha,
        m.tipo,
        m.concepto,
        m.descripcion,
        m.monto,
        m.id_inmueble,
        i.nombre as nombre_inmueble,
        m.id_reserva,
        r.codigo_reserva as codigo_reserva,
        m.metodo_pago,
        m.comprobante,
        m.id_empresa,
        m.fecha_creacion,
        m.fecha_actualizacion,
        m.plataforma_origen,
        m.id_pago
      FROM movimientos m
      LEFT JOIN inmuebles i ON m.id_inmueble = i.id_inmueble::text
      LEFT JOIN reservas r ON m.id_reserva = r.id_reserva::text
      WHERE m.id_inmueble = $1 AND m.fecha = $2
      ORDER BY m.fecha_creacion DESC
    `;

    const { rows } = await pool.query(query, [idInmueble, fecha]);
    return rows;
  }

  /**
   * Obtiene resumen diario por fecha y empresa
   */
  static async getResumenDiario(
  fecha: string,
  empresaId?: string
): Promise<ResumenDiario> {

  let query = `
    SELECT 
      fecha,

      -- Totales
      SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) AS total_ingresos,
      SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) AS total_egresos,
      SUM(CASE WHEN tipo = 'deducible' THEN monto ELSE 0 END) AS total_deducibles,

      -- Balance SOLO ingresos - egresos
      SUM(
        CASE 
          WHEN tipo = 'ingreso' THEN monto
          WHEN tipo = 'egreso' THEN -monto
          ELSE 0
        END
      ) AS balance,

      -- Contar SOLO ingresos y egresos
      COUNT(
        CASE 
          WHEN tipo IN ('ingreso', 'egreso') THEN 1
          ELSE NULL
        END
      ) AS cantidad_movimientos

    FROM movimientos
    WHERE fecha = $1
  `;

  const params: any[] = [fecha];

  if (empresaId) {
    query += ' AND id_empresa = $2';
    params.push(empresaId);
  }

  query += ' GROUP BY fecha';

  const { rows } = await pool.query(query, params);

  if (rows.length === 0) {
    return {
      fecha,
      total_ingresos: 0,
      total_egresos: 0,
      total_deducibles: 0,
      balance: 0,
      cantidad_movimientos: 0
    };
  }

  return {
    fecha: rows[0].fecha,
    total_ingresos: Number(rows[0].total_ingresos) || 0,
    total_egresos: Number(rows[0].total_egresos) || 0,
    total_deducibles: Number(rows[0].total_deducibles) || 0,
    balance: Number(rows[0].balance) || 0,
    cantidad_movimientos: Number(rows[0].cantidad_movimientos) || 0
  };
}


  /**
   * Crea un nuevo movimiento
   */
  static async createMovimiento(data: CreateMovimientoData): Promise<Movimiento> {
    const id = uuidv4();

    const query = `
      INSERT INTO movimientos (
        id, fecha, tipo, concepto, descripcion, monto, 
        id_inmueble, id_reserva, metodo_pago, comprobante, 
        id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), $12, $13)
      RETURNING *
    `;

    const values = [
      id,
      data.fecha,
      data.tipo,
      data.concepto,
      data.descripcion,
      data.monto,
      data.id_inmueble,
      data.id_reserva,
      data.metodo_pago,
      data.comprobante,
      data.id_empresa,
      data.plataforma_origen,
      data.id_pago
    ];

    const { rows } = await pool.query(query, values);

    // Obtener el movimiento completo con JOINs
    return this.getMovimientoById(rows[0].id);
  }

  /**
   * Obtiene un movimiento por ID
   */
  static async getMovimientoById(id: string): Promise<Movimiento> {
    const query = `
      SELECT 
        m.id,
        m.fecha,
        m.tipo,
        m.concepto,
        m.descripcion,
        m.monto,
        m.id_inmueble,
        i.nombre as nombre_inmueble,
        m.id_reserva,
        r.codigo_reserva as codigo_reserva,
        m.metodo_pago,
        m.comprobante,
        m.id_empresa,
        m.fecha_creacion,
        m.fecha_actualizacion,
        m.plataforma_origen,
        m.id_pago
      FROM movimientos m
      LEFT JOIN inmuebles i ON m.id_inmueble = i.id_inmueble::text
      LEFT JOIN reservas r ON m.id_reserva = r.id_reserva::text
      WHERE m.id = $1
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      throw new Error('Movimiento no encontrado');
    }

    return rows[0];
  }

  /**
   * Actualiza un movimiento
   */
  static async updateMovimiento(id: string, data: EditMovimientoData): Promise<Movimiento> {
    // Construir la query dinámicamente según los campos a actualizar
    const setFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.fecha !== undefined) {
      setFields.push(`fecha = $${paramIndex++}`);
      values.push(data.fecha);
    }
    if (data.tipo !== undefined) {
      setFields.push(`tipo = $${paramIndex++}`);
      values.push(data.tipo);
    }
    if (data.concepto !== undefined) {
      setFields.push(`concepto = $${paramIndex++}`);
      values.push(data.concepto);
    }
    if (data.descripcion !== undefined) {
      setFields.push(`descripcion = $${paramIndex++}`);
      values.push(data.descripcion);
    }
    if (data.monto !== undefined) {
      setFields.push(`monto = $${paramIndex++}`);
      values.push(data.monto);
    }
    if (data.id_inmueble !== undefined) {
      setFields.push(`id_inmueble = $${paramIndex++}`);
      values.push(data.id_inmueble);
    }
    if (data.id_reserva !== undefined) {
      setFields.push(`id_reserva = $${paramIndex++}`);
      values.push(data.id_reserva);
    }
    if (data.metodo_pago !== undefined) {
      setFields.push(`metodo_pago = $${paramIndex++}`);
      values.push(data.metodo_pago);
    }
    if (data.comprobante !== undefined) {
      setFields.push(`comprobante = $${paramIndex++}`);
      values.push(data.comprobante);
    }
    if (data.plataforma_origen !== undefined) {
      setFields.push(`plataforma_origen = $${paramIndex++}`);
      values.push(data.plataforma_origen);
    }
    if (data.id_pago !== undefined) {
      setFields.push(`id_pago = $${paramIndex++}`);
      values.push(data.id_pago);
    }

    if (setFields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    // Agregar fecha_actualizacion y el ID al final
    setFields.push(`fecha_actualizacion = NOW()`);
    values.push(id);

    const query = `
      UPDATE movimientos 
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      throw new Error('Movimiento no encontrado');
    }

    // Obtener el movimiento completo con JOINs
    return this.getMovimientoById(rows[0].id);
  }

  /**
   * Elimina un movimiento (eliminación física)
   */
  static async deleteMovimiento(id: string): Promise<void> {
    const query = 'DELETE FROM movimientos WHERE id = $1';
    const { rowCount } = await pool.query(query, [id]);

    if (rowCount === 0) {
      throw new Error('Movimiento no encontrado');
    }
  }

  /**
   * Busca movimientos asociados a un pago específico
   */
  static async getMovimientosByPago(pagoId: number): Promise<Movimiento[]> {
    const query = `
      SELECT 
        m.id,
        m.fecha,
        m.tipo,
        m.concepto,
        m.descripcion,
        m.monto,
        m.id_inmueble,
        i.nombre as nombre_inmueble,
        m.id_reserva,
        r.codigo_reserva as codigo_reserva,
        m.metodo_pago,
        m.comprobante,
        m.id_empresa,
        m.fecha_creacion,
        m.fecha_actualizacion,
        m.plataforma_origen,
        m.id_pago
      FROM movimientos m
      LEFT JOIN inmuebles i ON m.id_inmueble = i.id_inmueble::text
      LEFT JOIN reservas r ON m.id_reserva = r.id_reserva::text
      WHERE m.id_pago = $1
      ORDER BY m.fecha_creacion DESC
    `;

    const { rows } = await pool.query(query, [pagoId]);
    return rows;
  }

  /**
   * Elimina movimientos asociados a un pago específico
   */
  static async deleteMovimientosByPago(pagoId: number): Promise<number> {
    const query = 'DELETE FROM movimientos WHERE id_pago = $1';
    const { rowCount } = await pool.query(query, [pagoId]);

    return rowCount || 0;
  }

  /**
   * Genera reporte de ingresos por plataforma de origen
   */
  static async getReportePorPlataforma(fechaInicio: string, fechaFin: string, empresaId: string): Promise<any> {
    const query = `
      SELECT 
        m.plataforma_origen,
        SUM(CASE WHEN m.tipo = 'ingreso' THEN m.monto ELSE 0 END) as total_ingresos,
        COUNT(DISTINCT m.id_reserva) as cantidad_reservas
      FROM movimientos m
      WHERE m.fecha >= $1 
        AND m.fecha <= $2 
        AND m.id_empresa = $3
        AND m.tipo = 'ingreso'
        AND m.concepto = 'reserva'
        AND m.plataforma_origen IS NOT NULL
      GROUP BY m.plataforma_origen
      ORDER BY total_ingresos DESC
    `;

    const { rows } = await pool.query(query, [fechaInicio, fechaFin, empresaId]);

    // Formatear resultado como objeto con claves de plataforma
    const reporte: any = {};
    rows.forEach(row => {
      reporte[row.plataforma_origen] = {
        total_ingresos: parseFloat(row.total_ingresos) || 0,
        cantidad_reservas: parseInt(row.cantidad_reservas) || 0
      };
    });

    return reporte;
  }

  /**
   * Obtiene inmuebles para selector
   */
  static async getInmueblesSelector(empresaId?: string | null): Promise<InmuebleSelector[]> {
    let query = `
      SELECT 
        id_inmueble::text as id,
        nombre,
        direccion,
        estado
      FROM inmuebles 
      WHERE estado = 'activo'
    `;

    const params: any[] = [];

    if (empresaId) {
      query += ` AND id_empresa = $1`;
      params.push(empresaId);
    }

    query += ` ORDER BY nombre ASC`;

    const { rows } = await pool.query(query, params);
    return rows;
  }

  /**
   * Verifica si existe un inmueble y pertenece a la empresa
   */
  static async existsInmuebleInEmpresa(inmuebleId: string, empresaId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM inmuebles 
      WHERE id_inmueble::text = $1 AND id_empresa = $2
    `;

    const { rows } = await pool.query(query, [inmuebleId, empresaId]);
    return rows.length > 0;
  }

  /**
   * Verifica si existe una reserva y pertenece a la empresa
   */
  static async existsReservaInEmpresa(reservaId: string, empresaId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM reservas r
      JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
      WHERE r.id_reserva::text = $1 AND i.id_empresa = $2
    `;

    const { rows } = await pool.query(query, [reservaId, empresaId]);
    return rows.length > 0;
  }

  /**
   * Verifica si existe una empresa
   */
  static async existsEmpresa(empresaId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM empresas WHERE id_empresa = $1';
    const { rows } = await pool.query(query, [empresaId]);
    return rows.length > 0;
  }
}