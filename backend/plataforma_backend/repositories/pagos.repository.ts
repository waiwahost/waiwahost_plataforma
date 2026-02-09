import pool from '../libs/db';
import {
  Pago,
  CreatePagoData,
  EditPagoData,
  PagosQueryParams,
  ResumenPagosReserva,
  ValidacionPago,
  validarMontoPago,
  calcularEstadoPago,
  calcularPorcentajePagado
} from '../interfaces/pago.interface';
import { updateTotalesReservaService } from '../services/reservas/updateTotalesReservaService';

export class PagosRepository {

  /**
   * Obtiene todos los pagos de una reserva específica
   */
  static async getPagosByReserva(idReserva: number): Promise<Pago[]> {
    const query = `
      SELECT 
        p.id,
        p.id_reserva,
        r.codigo_reserva,
        p.monto,
        p.fecha_pago,
        p.metodo_pago,
        p.concepto,
        p.descripcion,
        p.comprobante,
        p.id_empresa,
        p.fecha_creacion,
        p.fecha_actualizacion,
        p.id_usuario_registro
      FROM pagos p
      INNER JOIN reservas r ON p.id_reserva = r.id_reserva
      WHERE p.id_reserva = $1
      ORDER BY p.fecha_pago DESC, p.fecha_creacion DESC
    `;

    const { rows } = await pool.query(query, [idReserva]);
    return rows;
  }

  /**
   * Obtiene pagos con filtros y paginación
   */
  static async getPagosWithFilters(params: PagosQueryParams): Promise<{ pagos: Pago[], total: number }> {
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Construir condiciones WHERE dinámicamente
    if (params.id_reserva) {
      whereConditions.push(`p.id_reserva = $${paramIndex++}`);
      queryParams.push(params.id_reserva);
    }

    if (params.fecha_desde) {
      whereConditions.push(`p.fecha_pago >= $${paramIndex++}`);
      queryParams.push(params.fecha_desde);
    }

    if (params.fecha_hasta) {
      whereConditions.push(`p.fecha_pago <= $${paramIndex++}`);
      queryParams.push(params.fecha_hasta);
    }

    if (params.metodo_pago) {
      whereConditions.push(`p.metodo_pago = $${paramIndex++}`);
      queryParams.push(params.metodo_pago);
    }

    if (params.id_empresa) {
      whereConditions.push(`p.id_empresa = $${paramIndex++}`);
      queryParams.push(params.id_empresa);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM pagos p
      INNER JOIN reservas r ON p.id_reserva = r.id_reserva
      ${whereClause}
    `;

    // Query principal con paginación
    const limit = params.limit || 50;
    const offset = ((params.page || 1) - 1) * limit;

    const mainQuery = `
      SELECT 
        p.id,
        p.id_reserva,
        r.codigo_reserva,
        p.monto,
        p.fecha_pago,
        p.metodo_pago,
        p.concepto,
        p.descripcion,
        p.comprobante,
        p.id_empresa,
        p.fecha_creacion,
        p.fecha_actualizacion,
        p.id_usuario_registro
      FROM pagos p
      INNER JOIN reservas r ON p.id_reserva = r.id_reserva
      ${whereClause}
      ORDER BY p.fecha_pago DESC, p.fecha_creacion DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limit, offset);

    // Ejecutar ambas queries
    const [countResult, pagosResult] = await Promise.all([
      pool.query(countQuery, queryParams.slice(0, -2)), // Sin limit y offset para count
      pool.query(mainQuery, queryParams)
    ]);

    return {
      pagos: pagosResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  /**
   * Obtiene un pago específico por ID
   */
  static async getPagoById(id: number): Promise<Pago | null> {
    const query = `
      SELECT 
        p.id,
        p.id_reserva,
        r.codigo_reserva,
        p.monto,
        p.fecha_pago,
        p.metodo_pago,
        p.concepto,
        p.descripcion,
        p.comprobante,
        p.id_empresa,
        p.fecha_creacion,
        p.fecha_actualizacion,
        p.id_usuario_registro
      FROM pagos p
      INNER JOIN reservas r ON p.id_reserva = r.id_reserva
      WHERE p.id = $1
    `;

    const { rows } = await pool.query(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Crea un nuevo pago con validaciones de negocio
   */
  static async createPago(data: CreatePagoData): Promise<Pago> {
    // Primero validar que la reserva existe y obtener sus datos
    const reservaInfo = await this.getReservaInfo(data.id_reserva);
    if (!reservaInfo) {
      throw new Error('La reserva especificada no existe');
    }
    // Obtener el total ya pagado para esta reserva
    const totalPagadoActual = await this.getTotalPagadoReserva(data.id_reserva);

    // Asegurar que total_reserva sea número
    const totalReserva = parseFloat(reservaInfo.total_reserva as any);

    // Validar el monto del pago
    const validacion = validarMontoPago(data.monto, totalReserva, totalPagadoActual);
    if (!validacion.es_valido) {
      throw new Error(`Validación de pago fallida: ${validacion.errores.join(', ')}`);
    }

    // Usar fecha actual si no se especifica
    const fechaPago = data.fecha_pago || new Date().toISOString().split('T')[0];

    // Resolver id_empresa: si no viene en data (caso superadmin), usar el de la reserva
    const idEmpresa = data.id_empresa || reservaInfo.id_empresa;

    const query = `
      INSERT INTO pagos (
        id_reserva, monto, fecha_pago, metodo_pago, concepto, 
        descripcion, comprobante, id_empresa, id_usuario_registro,
        fecha_creacion, fecha_actualizacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id
    `;

    const values = [
      data.id_reserva,
      data.monto,
      fechaPago,
      data.metodo_pago,
      data.concepto,
      data.descripcion,
      data.comprobante,
      idEmpresa,
      data.id_usuario_registro
    ];

    const { rows } = await pool.query(query, values);
    const pagoId = rows[0].id;

    // Obtener el pago completo recién creado
    const pagoCreado = await this.getPagoById(pagoId);
    if (!pagoCreado) {
      throw new Error('Error al recuperar el pago creado');
    }

    // Actualizar los totales de la reserva después de crear el pago
    try {
      await updateTotalesReservaService.actualizarTotales(data.id_reserva);
    } catch (error) {
      console.warn(`Advertencia: No se pudieron actualizar los totales de la reserva ${data.id_reserva}:`, error);
      // No lanzar error para no fallar la creación del pago
    }

    return pagoCreado;
  }

  /**
   * Actualiza un pago existente
   */
  static async updatePago(id: number, data: EditPagoData): Promise<Pago> {
    // Verificar que el pago existe
    const pagoExistente = await this.getPagoById(id);
    if (!pagoExistente) {
      throw new Error('El pago especificado no existe');
    }

    // Si se está actualizando el monto, validar
    if (data.monto !== undefined) {
      const reservaInfo = await this.getReservaInfo(pagoExistente.id_reserva);
      if (!reservaInfo) {
        throw new Error('Error al validar la reserva asociada');
      }

      // Calcular total pagado excluyendo este pago
      const totalPagadoOtros = await this.getTotalPagadoReservaExcluding(pagoExistente.id_reserva, id);

      const validacion = validarMontoPago(data.monto, reservaInfo.total_reserva, totalPagadoOtros);
      if (!validacion.es_valido) {
        throw new Error(`Validación de pago fallida: ${validacion.errores.join(', ')}`);
      }
    }

    // Construir la query de actualización dinámicamente
    const setFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.monto !== undefined) {
      setFields.push(`monto = $${paramIndex++}`);
      values.push(data.monto);
    }
    if (data.fecha_pago !== undefined) {
      setFields.push(`fecha_pago = $${paramIndex++}`);
      values.push(data.fecha_pago);
    }
    if (data.metodo_pago !== undefined) {
      setFields.push(`metodo_pago = $${paramIndex++}`);
      values.push(data.metodo_pago);
    }
    if (data.concepto !== undefined) {
      setFields.push(`concepto = $${paramIndex++}`);
      values.push(data.concepto);
    }
    if (data.descripcion !== undefined) {
      setFields.push(`descripcion = $${paramIndex++}`);
      values.push(data.descripcion);
    }
    if (data.comprobante !== undefined) {
      setFields.push(`comprobante = $${paramIndex++}`);
      values.push(data.comprobante);
    }

    if (setFields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    // Agregar fecha_actualizacion y el ID
    setFields.push(`fecha_actualizacion = NOW()`);
    values.push(id);

    const query = `
      UPDATE pagos 
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id
    `;

    const { rowCount } = await pool.query(query, values);

    if (rowCount === 0) {
      throw new Error('No se pudo actualizar el pago');
    }

    // Retornar el pago actualizado
    const pagoActualizado = await this.getPagoById(id);
    if (!pagoActualizado) {
      throw new Error('Error al recuperar el pago actualizado');
    }

    // Actualizar los totales de la reserva después de actualizar el pago
    try {
      await updateTotalesReservaService.actualizarTotales(pagoActualizado.id_reserva);
    } catch (error) {
      console.warn(`Advertencia: No se pudieron actualizar los totales de la reserva ${pagoActualizado.id_reserva}:`, error);
      // No lanzar error para no fallar la actualización del pago
    }

    return pagoActualizado;
  }

  /**
   * Elimina un pago (eliminación física)
   */
  static async deletePago(id: number): Promise<void> {
    // Primero obtener información del pago para actualizar totales después
    const pagoAEliminar = await this.getPagoById(id);
    if (!pagoAEliminar) {
      throw new Error('Pago no encontrado');
    }

    const query = 'DELETE FROM pagos WHERE id = $1';
    const { rowCount } = await pool.query(query, [id]);

    if (rowCount === 0) {
      throw new Error('Pago no encontrado o ya eliminado');
    }

    // Actualizar los totales de la reserva después de eliminar el pago
    try {
      await updateTotalesReservaService.actualizarTotales(pagoAEliminar.id_reserva);
    } catch (error) {
      console.warn(`Advertencia: No se pudieron actualizar los totales de la reserva ${pagoAEliminar.id_reserva}:`, error);
      // No lanzar error para no fallar la eliminación del pago
    }
  }

  /**
   * Obtiene el resumen financiero de una reserva
   */
  static async getResumenPagosReserva(idReserva: number): Promise<ResumenPagosReserva | null> {
    const query = `
      SELECT 
        r.id_reserva as id_reserva,
        r.codigo_reserva,
        r.total_reserva,
        COALESCE(SUM(p.monto), 0) as total_pagado,
        (r.total_reserva - COALESCE(SUM(p.monto), 0)) as total_pendiente,
        COUNT(p.id) as cantidad_pagos,
        MAX(p.fecha_pago) as fecha_ultimo_pago,
        (SELECT monto FROM pagos WHERE id_reserva = r.id_reserva ORDER BY fecha_pago DESC, fecha_creacion DESC LIMIT 1) as monto_ultimo_pago,
        (SELECT metodo_pago FROM pagos WHERE id_reserva = r.id_reserva ORDER BY fecha_pago DESC, fecha_creacion DESC LIMIT 1) as metodo_ultimo_pago
      FROM reservas r
      LEFT JOIN pagos p ON r.id_reserva = p.id_reserva
      WHERE r.id_reserva = $1
      GROUP BY r.id_reserva, r.codigo_reserva, r.total_reserva
    `;

    const { rows } = await pool.query(query, [idReserva]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    const totalReserva = parseFloat(row.total_reserva);
    const totalPagado = parseFloat(row.total_pagado);
    const totalPendiente = parseFloat(row.total_pendiente);
    const cantidadPagos = parseInt(row.cantidad_pagos);

    const resumen: ResumenPagosReserva = {
      id_reserva: row.id_reserva,
      codigo_reserva: row.codigo_reserva,
      total_reserva: totalReserva,
      total_pagado: totalPagado,
      total_pendiente: totalPendiente,
      cantidad_pagos: cantidadPagos,
      porcentaje_pagado: calcularPorcentajePagado(totalReserva, totalPagado),
      estado_pago: calcularEstadoPago(totalReserva, totalPagado)
    };

    // Agregar información del último pago si existe
    if (row.fecha_ultimo_pago && row.monto_ultimo_pago) {
      resumen.ultimo_pago = {
        fecha: row.fecha_ultimo_pago,
        monto: parseFloat(row.monto_ultimo_pago),
        metodo: row.metodo_ultimo_pago
      };
    }

    return resumen;
  }

  /**
   * Obtiene información básica de una reserva
   */
  private static async getReservaInfo(idReserva: number): Promise<{ id: number, codigo_reserva: string, total_reserva: number, id_empresa: number } | null> {
    const query = `
      SELECT r.id_reserva as id, r.codigo_reserva, r.total_reserva, i.id_empresa
      FROM reservas r
      INNER JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
      WHERE r.id_reserva = $1
    `;

    const { rows } = await pool.query(query, [idReserva]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Obtiene el total pagado para una reserva
   */
  private static async getTotalPagadoReserva(idReserva: number): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(monto), 0) as total_pagado
      FROM pagos 
      WHERE id_reserva = $1
    `;

    const { rows } = await pool.query(query, [idReserva]);
    return parseFloat(rows[0].total_pagado);
  }

  /**
   * Obtiene el total pagado para una reserva excluyendo un pago específico
   */
  private static async getTotalPagadoReservaExcluding(idReserva: number, excludePagoId: number): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(monto), 0) as total_pagado
      FROM pagos 
      WHERE id_reserva = $1 AND id != $2
    `;

    const { rows } = await pool.query(query, [idReserva, excludePagoId]);
    return parseFloat(rows[0].total_pagado);
  }

  /**
   * Verifica si existe una reserva y pertenece a la empresa
   */
  static async existsReservaInEmpresa(reservaId: number, empresaId: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM reservas r
      INNER JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
      WHERE r.id_reserva = $1 AND i.id_empresa = $2
    `;

    const { rows } = await pool.query(query, [reservaId, empresaId]);
    return rows.length > 0;
  }

  /**
   * Verifica si un pago pertenece a la empresa (a través de la reserva)
   */
  static async existsPagoInEmpresa(pagoId: number, empresaId: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM pagos p
      INNER JOIN reservas r ON p.id_reserva = r.id_reserva
      INNER JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
      WHERE p.id = $1 AND i.id_empresa = $2
    `;

    const { rows } = await pool.query(query, [pagoId, empresaId]);
    return rows.length > 0;
  }

  /**
   * Obtiene pagos de una empresa por fecha (para reportes diarios)
   */
  static async getPagosByEmpresaFecha(empresaId: number, fecha: string): Promise<Pago[]> {
    const query = `
      SELECT 
        p.id,
        p.id_reserva,
        r.codigo_reserva,
        p.monto,
        p.fecha_pago,
        p.metodo_pago,
        p.concepto,
        p.descripcion,
        p.comprobante,
        p.id_empresa,
        p.fecha_creacion,
        p.fecha_actualizacion,
        p.id_usuario_registro
      FROM pagos p
      INNER JOIN reservas r ON p.id_reserva = r.id_reserva
      WHERE p.id_empresa = $1 AND p.fecha_pago = $2
      ORDER BY p.fecha_creacion DESC
    `;

    const { rows } = await pool.query(query, [empresaId, fecha]);
    return rows;
  }

  /**
   * Obtiene estadísticas de pagos por método de pago
   */
  static async getEstadisticasMetodosPago(empresaId: number, fechaInicio?: string, fechaFin?: string): Promise<any[]> {
    let query = `
      SELECT 
        p.metodo_pago,
        COUNT(*) as cantidad_pagos,
        SUM(p.monto) as total_monto,
        AVG(p.monto) as promedio_monto
      FROM pagos p
      INNER JOIN reservas r ON p.id_reserva = r.id_reserva
      INNER JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
      WHERE i.id_empresa = $1
    `;

    const params: any[] = [empresaId];
    let paramIndex = 2;

    if (fechaInicio) {
      query += ` AND p.fecha_pago >= $${paramIndex++}`;
      params.push(fechaInicio);
    }

    if (fechaFin) {
      query += ` AND p.fecha_pago <= $${paramIndex++}`;
      params.push(fechaFin);
    }

    query += ` GROUP BY p.metodo_pago ORDER BY total_monto DESC`;

    const { rows } = await pool.query(query, params);

    return rows.map(row => ({
      metodo_pago: row.metodo_pago,
      cantidad_pagos: parseInt(row.cantidad_pagos),
      total_monto: parseFloat(row.total_monto),
      promedio_monto: parseFloat(row.promedio_monto)
    }));
  }
}