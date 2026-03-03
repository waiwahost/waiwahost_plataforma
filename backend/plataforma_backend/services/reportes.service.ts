import dbClient from '../libs/db';

export interface ReporteFinancieroFilters {
    empresaId?: number;
    inmuebleId?: number;
    edificioId?: number;
    propietarioId?: number;
    fechaInicio?: string;
    fechaFin?: string;
}

export class ReportesService {
    async getReporteFinanciero(filters: ReporteFinancieroFilters) {
        try {
            const { empresaId, inmuebleId, edificioId, propietarioId, fechaInicio, fechaFin } = filters;

            // 1. Check if inmuebleId is a building to handle hierarchy
            let targetInmuebleIds: number[] = [];
            let isBuildingReport = false;
            let buildingData: any = null;

            if (inmuebleId) {
                const hierarchyRes = await dbClient.query(
                    `SELECT id_inmueble, nombre, tipo_registro FROM inmuebles WHERE id_inmueble = $1 OR parent_id = $1`,
                    [inmuebleId]
                );
                targetInmuebleIds = hierarchyRes.rows.map((r: any) => r.id_inmueble);
                const requestedProp = hierarchyRes.rows.find((r: any) => Number(r.id_inmueble) === Number(inmuebleId));
                if (requestedProp && requestedProp.tipo_registro === 'edificio') {
                    isBuildingReport = true;
                    buildingData = requestedProp;
                }
            }

            // 1. Reservas Query
            let reservasQuery = `
        SELECT 
          r.id_reserva,
          r.codigo_reserva,
          r.fecha_inicio,
          r.fecha_fin,
          r.numero_huespedes,
          r.total_reserva,
          r.estado,
          r.plataforma_origen,
          i.nombre as nombre_inmueble,
          i.id_inmueble,
          COALESCE(i.comision, p.comision) as comision,
          hp.nombre as nombre_huesped,
          hp.apellido as apellido_huesped,
          (r.fecha_fin - r.fecha_inicio) as noches
        FROM reservas r
        INNER JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
        LEFT JOIN inmuebles p ON i.parent_id = p.id_inmueble
        LEFT JOIN (
            SELECT hr.id_reserva, h.nombre, h.apellido
            FROM huespedes_reservas hr
            JOIN huespedes h ON hr.id_huesped = h.id_huesped
            WHERE hr.es_principal = true
        ) hp ON r.id_reserva = hp.id_reserva
        WHERE i.estado = 'activo' AND r.estado != 'cancelada'
      `;

            const reservasParams: any[] = [];
            let pIndex = 1;

            if (empresaId) {
                reservasQuery += ` AND i.id_empresa = $${pIndex++}`;
                reservasParams.push(empresaId);
            }
            if (inmuebleId) {
                if (targetInmuebleIds.length > 0) {
                    const placeholders = targetInmuebleIds.map((_, i) => `$${pIndex + i}`).join(',');
                    reservasQuery += ` AND r.id_inmueble IN (${placeholders})`;
                    reservasParams.push(...targetInmuebleIds);
                    pIndex += targetInmuebleIds.length;
                } else {
                    reservasQuery += ` AND r.id_inmueble = $${pIndex++}`;
                    reservasParams.push(inmuebleId);
                }
            }
            if (edificioId) {
                reservasQuery += ` AND (i.id_inmueble = $${pIndex} OR i.parent_id = $${pIndex++})`;
                reservasParams.push(edificioId);
            }
            if (propietarioId) {
                reservasQuery += ` AND i.id_propietario = $${pIndex++}`;
                reservasParams.push(propietarioId);
            }
            if (fechaInicio) {
                reservasQuery += ` AND r.fecha_inicio >= $${pIndex++}`;
                reservasParams.push(fechaInicio);
            }
            if (fechaFin) {
                reservasQuery += ` AND r.fecha_fin <= $${pIndex++}`;
                reservasParams.push(fechaFin);
            }

            reservasQuery += ` ORDER BY r.fecha_inicio DESC`;

            const reservasResult = await dbClient.query(reservasQuery, reservasParams);
            const reservas = reservasResult.rows;

            // 2. Gastos (Egresos) Query
            let gastosQuery = `
        SELECT 
          m.id as id_movimiento,
          m.fecha,
          m.concepto,
          m.descripcion,
          m.monto,
          i.nombre as nombre_inmueble,
          i.id_inmueble,
          i.parent_id,
          i.area_m2
        FROM movimientos m
        INNER JOIN inmuebles i ON m.id_inmueble = i.id_inmueble::varchar
        WHERE m.tipo IN ('egreso', 'deducible')
      `;

            const gastosParams: any[] = [];
            pIndex = 1;

            if (empresaId) {
                gastosQuery += ` AND m.id_empresa = $${pIndex++}::varchar`;
                gastosParams.push(empresaId);
            }
            if (inmuebleId) {
                if (targetInmuebleIds.length > 0) {
                    const placeholders = targetInmuebleIds.map((_, i) => `$${pIndex + i}`).join(',');
                    gastosQuery += ` AND m.id_inmueble IN (${placeholders})`;
                    gastosParams.push(...targetInmuebleIds.map(id => String(id)));
                    pIndex += targetInmuebleIds.length;
                } else {
                    gastosQuery += ` AND m.id_inmueble = $${pIndex++}::varchar`;
                    gastosParams.push(inmuebleId.toString());
                }
            }
            if (edificioId) {
                gastosQuery += ` AND (i.id_inmueble = $${pIndex} OR i.parent_id = $${pIndex++})::varchar`;
                gastosParams.push(edificioId);
            }
            if (propietarioId) {
                gastosQuery += ` AND i.id_propietario = $${pIndex++}`;
                gastosParams.push(propietarioId);
            }
            if (fechaInicio) {
                gastosQuery += ` AND m.fecha >= $${pIndex++}`;
                gastosParams.push(fechaInicio);
            }
            if (fechaFin) {
                gastosQuery += ` AND m.fecha <= $${pIndex++}`;
                gastosParams.push(fechaFin);
            }

            gastosQuery += ` ORDER BY m.fecha DESC`;

            const gastosResult = await dbClient.query(gastosQuery, gastosParams);
            const baseGastos = gastosResult.rows;

            // 2.1 Calculate Dynamic Commission Expenses
            const comisionesGastos = reservas.map((r: any) => {
                const comisionPerc = Number(r.comision || 0);
                const montoComision = (Number(r.total_reserva) * comisionPerc) / 100;

                return {
                    id_movimiento: `com-${r.id_reserva}`,
                    fecha: r.fecha_inicio,
                    concepto: 'comision',
                    descripcion: `Comisión (${comisionPerc}%) - Reserva ${r.codigo_reserva} (${r.nombre_inmueble})`,
                    monto: montoComision,
                    nombre_inmueble: isBuildingReport ? buildingData.nombre : r.nombre_inmueble,
                    id_inmueble: isBuildingReport ? buildingData.id_inmueble : r.id_inmueble,
                    parent_id: null,
                    area_m2: 0
                };
            }).filter((c: any) => c.monto > 0);

            const gastos = [...baseGastos, ...comisionesGastos];

            // 3. Calculate Indicators
            const totalIngresos = reservas.reduce((sum: number, r: any) => sum + Number(r.total_reserva || 0), 0);
            const totalEgresos = gastos.reduce((sum: number, g: any) => sum + Number(g.monto || 0), 0);
            const nochesOcupadas = reservas.reduce((sum: number, r: any) => sum + Number(r.noches || 0), 0);
            const totalReservas = reservas.length;
            const ingresoPorReserva = totalReservas > 0 ? totalIngresos / totalReservas : 0;

            // Occupancy % calculation requires total available nights.
            let porcentajeOcupacion = 0;
            if (fechaInicio && fechaFin) {
                const start = new Date(fechaInicio);
                const end = new Date(fechaFin);
                const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));

                let numInmuebles = 0;
                if (inmuebleId) {
                    // Check if it's a building or unit to count units correctly
                    const countUnitsRes = await dbClient.query(
                        `SELECT COUNT(*) as total FROM inmuebles WHERE (id_inmueble = $1 OR parent_id = $1) AND tipo_registro != 'edificio' AND estado = 'activo'`,
                        [inmuebleId]
                    );
                    numInmuebles = parseInt(countUnitsRes.rows[0].total) || 1;
                } else {
                    let countInmueblesQuery = `SELECT COUNT(*) as total FROM inmuebles WHERE estado = 'activo' AND tipo_registro != 'edificio'`;
                    const countParams = [];
                    let cIndex = 1;
                    if (empresaId) { countInmueblesQuery += ` AND id_empresa = $${cIndex++}`; countParams.push(empresaId); }
                    if (propietarioId) { countInmueblesQuery += ` AND id_propietario = $${cIndex++}`; countParams.push(propietarioId); }

                    const countResult = await dbClient.query(countInmueblesQuery, countParams);
                    numInmuebles = parseInt(countResult.rows[0].total);
                }

                const totalNochesDisponibles = numInmuebles * daysDiff;
                if (totalNochesDisponibles > 0) {
                    porcentajeOcupacion = (nochesOcupadas / totalNochesDisponibles) * 100;
                }
            }

            return {
                reservas,
                gastos,
                resumen: {
                    totalIngresos,
                    totalEgresos,
                    balance: totalIngresos - totalEgresos
                },
                indicadores: {
                    nochesOcupadas,
                    porcentajeOcupacion: Math.round(porcentajeOcupacion * 100) / 100,
                    ingresoPorReserva: Math.round(ingresoPorReserva * 100) / 100,
                    totalReservas
                }
            };

        } catch (error) {
            console.error('Error en ReportesService:', error);
            throw error;
        }
    }
    async getOpciones(empresaId?: number, tipo?: string) {
        try {
            const params: any[] = [];
            let queryEmpresas = `SELECT id_empresa as id, nombre FROM empresas WHERE 1=1`;
            let queryInmuebles = `SELECT id_inmueble as id, nombre FROM inmuebles WHERE estado = 'activo'`;
            let queryPropietarios = `SELECT id_propietario as id, nombre, apellido FROM propietarios WHERE 1=1`;

            if (empresaId) {
                queryEmpresas += ` AND id_empresa = $1`;
                queryInmuebles += ` AND id_empresa = $1`;
                queryPropietarios += ` AND id_empresa = $1`;
                params.push(empresaId);
            }

            queryEmpresas += ` ORDER BY nombre ASC`;
            queryInmuebles += ` ORDER BY nombre ASC`;
            queryPropietarios += ` ORDER BY nombre ASC`;

            const result: any = {};

            // If no specific type is requested, fetch all (backward compatibility or initial load)
            // Or if specific type is requested, only fetch that one.

            if (!tipo || tipo === 'empresas') {
                const empresasRes = await dbClient.query(queryEmpresas, params);
                result.empresas = empresasRes.rows;
            }

            if (!tipo || tipo === 'inmuebles') {
                const inmueblesRes = await dbClient.query(queryInmuebles, params);
                result.inmuebles = inmueblesRes.rows;
            }

            if (!tipo || tipo === 'propietarios') {
                const propietariosRes = await dbClient.query(queryPropietarios, params);
                result.propietarios = propietariosRes.rows.map((p: any) => ({
                    id: p.id,
                    nombre: `${p.nombre} ${p.apellido}`.trim()
                }));
            }

            return result;
        } catch (error) {
            console.error('Error en ReportesService.getOpciones:', error);
            throw error;
        }
    }
}
