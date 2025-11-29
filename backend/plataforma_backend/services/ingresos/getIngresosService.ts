import { FiltrosIngresos, Ingreso } from '../../interfaces/ingreso.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener ingresos filtrados por fecha e inmueble
 * Combina movimientos tipo "ingreso" con pagos de reservas
 */
export async function getIngresosService(filtros: FiltrosIngresos): Promise<ServiceResponse<Ingreso[]>> {
  try {
    console.log('🔄 Ejecutando getIngresosService con filtros:', filtros);

    // Importar repository aquí para evitar dependencias circulares
    const { MovimientosRepository } = await import('../../repositories/movimientos.repository');

    // Verificar que la empresa existe (solo si se especifica una empresa)
    if (filtros.empresa_id && filtros.empresa_id > 0) {
      const empresaExists = await MovimientosRepository.existsEmpresa(filtros.empresa_id.toString());
      if (!empresaExists) {
        return {
          data: null,
          error: {
            message: 'Empresa no encontrada',
            status: 404,
            details: 'La empresa especificada no existe'
          }
        };
      }
    }

    // Construir query para obtener solo ingresos
    let query = `
      SELECT 
        m.id,
        m.fecha,
        EXTRACT(HOUR FROM m.fecha_creacion)::text || ':' || LPAD(EXTRACT(MINUTE FROM m.fecha_creacion)::text, 2, '0') as hora,
        m.concepto,
        m.descripcion,
        m.monto,
        m.id_inmueble::integer as id_inmueble,
        i.nombre as nombre_inmueble,
        m.id_reserva,
        r.codigo_reserva,
        m.metodo_pago,
        m.comprobante,
        'movimiento' as tipo_registro,
        m.fecha_creacion
      FROM movimientos m
      LEFT JOIN inmuebles i ON m.id_inmueble = i.id_inmueble::text
      LEFT JOIN reservas r ON m.id_reserva = r.id_reserva::text
      WHERE m.fecha = $1 AND m.tipo = 'ingreso'
    `;

    const params: any[] = [filtros.fecha];

    // Filtrar por empresa solo si se especifica
    if (filtros.empresa_id && filtros.empresa_id > 0) {
      query += ' AND m.id_empresa = $2';
      params.push(filtros.empresa_id.toString());
    }

    // Filtrar por inmueble si se especifica
    if (filtros.id_inmueble) {
      const paramIndex = params.length + 1;
      query += ` AND m.id_inmueble = $${paramIndex}`;
      params.push(filtros.id_inmueble.toString());
    }

    query += ' ORDER BY m.fecha_creacion DESC';

    // Ejecutar consulta
    const pool = (await import('../../libs/db')).default;
    const { rows } = await pool.query(query, params);

    // Transformar resultados al formato de la interface Ingreso
    const ingresos: Ingreso[] = rows.map(row => ({
      id: parseInt(row.id) || 0,
      fecha: row.fecha,
      hora: row.hora,
      concepto: row.concepto,
      descripcion: row.descripcion,
      monto: parseFloat(row.monto) || 0,
      id_inmueble: row.id_inmueble,
      nombre_inmueble: row.nombre_inmueble || 'Sin nombre',
      id_reserva: row.id_reserva ? parseInt(row.id_reserva) : null,
      codigo_reserva: row.codigo_reserva || null,
      metodo_pago: row.metodo_pago,
      tipo_registro: row.tipo_registro,
      fecha_creacion: row.fecha_creacion,
      comprobante: row.comprobante
    }));

    console.log(`✅ ${ingresos.length} ingresos encontrados`);

    return { data: ingresos, error: null };

  } catch (error) {
    console.error('❌ Error en getIngresosService:', error);
    return {
      data: null,
      error: {
        message: 'Error al obtener ingresos',
        status: 500,
        details: error
      }
    };
  }
}