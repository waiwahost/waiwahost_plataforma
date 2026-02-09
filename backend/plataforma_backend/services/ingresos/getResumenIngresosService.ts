import { FiltrosIngresos, ResumenIngresos } from '../../interfaces/ingreso.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener resumen de ingresos por fecha e inmueble
 * Calcula totales, promedios y desglose por inmueble
 */
export async function getResumenIngresosService(filtros: FiltrosIngresos): Promise<ServiceResponse<ResumenIngresos>> {
  try {
    // Importar repository y pool
    const { MovimientosRepository } = await import('../../repositories/movimientos.repository');
    const pool = (await import('../../libs/db')).default;

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

    // Construir query para obtener resumen de ingresos
    let query: string;
    let params: any[];

    if (filtros.id_inmueble) {
      // Resumen para un inmueble específico
      query = `
        SELECT 
          COUNT(*) as cantidad_ingresos,
          SUM(m.monto) as total_ingresos,
          AVG(m.monto) as promedio_ingreso,
          i.nombre as nombre_inmueble
        FROM movimientos m
        LEFT JOIN inmuebles i ON m.id_inmueble = i.id_inmueble::text
        WHERE m.fecha = $1 AND m.tipo = 'ingreso' AND m.id_inmueble = $2
      `;
      params = [filtros.fecha, filtros.id_inmueble.toString()];

      // Agregar filtro de empresa si se especifica
      if (filtros.empresa_id && filtros.empresa_id > 0) {
        query = query.replace('WHERE m.fecha = $1 AND m.tipo = \'ingreso\' AND m.id_inmueble = $2',
          'WHERE m.fecha = $1 AND m.id_empresa = $2 AND m.tipo = \'ingreso\' AND m.id_inmueble = $3');
        params = [filtros.fecha, filtros.empresa_id.toString(), filtros.id_inmueble.toString()];
      }

      query += ' GROUP BY i.nombre';
    } else {
      // Resumen general con desglose por inmueble
      query = `
        SELECT 
          COUNT(*) as cantidad_ingresos,
          SUM(m.monto) as total_ingresos,
          AVG(m.monto) as promedio_ingreso
        FROM movimientos m
        WHERE m.fecha = $1 AND m.tipo = 'ingreso'
      `;
      params = [filtros.fecha];

      // Agregar filtro de empresa si se especifica
      if (filtros.empresa_id && filtros.empresa_id > 0) {
        query = query.replace('WHERE m.fecha = $1 AND m.tipo = \'ingreso\'',
          'WHERE m.fecha = $1 AND m.id_empresa = $2 AND m.tipo = \'ingreso\'');
        params.push(filtros.empresa_id.toString());
      }
    }

    // Ejecutar consulta principal
    const { rows: resumenRows } = await pool.query(query, params);

    const totalIngresos = parseFloat(resumenRows[0]?.total_ingresos) || 0;
    const cantidadIngresos = parseInt(resumenRows[0]?.cantidad_ingresos) || 0;
    const promedioIngreso = parseFloat(resumenRows[0]?.promedio_ingreso) || 0;

    // Obtener desglose por inmueble (solo si no hay filtro específico de inmueble)
    let desgloseInmuebles = undefined;
    if (!filtros.id_inmueble && cantidadIngresos > 0) {
      let desgloseQuery = `
        SELECT 
          m.id_inmueble::integer as id_inmueble,
          i.nombre as nombre_inmueble,
          COUNT(*) as cantidad,
          SUM(m.monto) as total
        FROM movimientos m
        LEFT JOIN inmuebles i ON m.id_inmueble = i.id_inmueble::text
        WHERE m.fecha = $1 AND m.tipo = 'ingreso'
      `;

      let desgloseParams = [filtros.fecha];

      // Agregar filtro de empresa si se especifica
      if (filtros.empresa_id && filtros.empresa_id > 0) {
        desgloseQuery = desgloseQuery.replace('WHERE m.fecha = $1 AND m.tipo = \'ingreso\'',
          'WHERE m.fecha = $1 AND m.id_empresa = $2 AND m.tipo = \'ingreso\'');
        desgloseParams.push(filtros.empresa_id.toString());
      }

      desgloseQuery += ' GROUP BY m.id_inmueble, i.nombre ORDER BY total DESC';

      const { rows: desgloseRows } = await pool.query(desgloseQuery, desgloseParams);

      desgloseInmuebles = desgloseRows.map(row => ({
        id_inmueble: row.id_inmueble,
        nombre_inmueble: row.nombre_inmueble || 'Sin nombre',
        total: parseFloat(row.total) || 0,
        cantidad: parseInt(row.cantidad) || 0
      }));
    }

    const resumen: ResumenIngresos = {
      fecha: filtros.fecha,
      inmueble_filtro: filtros.id_inmueble ? resumenRows[0]?.nombre_inmueble || null : null,
      total_ingresos: totalIngresos,
      cantidad_ingresos: cantidadIngresos,
      promedio_ingreso: Math.round(promedioIngreso),
      desglose_inmuebles: desgloseInmuebles
    };

    return { data: resumen, error: null };

  } catch (error) {
    console.error('❌ Error en getResumenIngresosService:', error);
    return {
      data: null,
      error: {
        message: 'Error al generar resumen de ingresos',
        status: 500,
        details: error
      }
    };
  }
}