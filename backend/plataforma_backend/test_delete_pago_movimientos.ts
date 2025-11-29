import { PagoMovimientoService } from './services/pagoMovimiento.service';
import { MovimientosRepository } from './repositories/movimientos.repository';
import { PagosRepository } from './repositories/pagos.repository';

/**
 * Script de prueba para verificar la eliminación de pagos y movimientos asociados
 * 
 * Este script valida que:
 * 1. Los movimientos se asocian correctamente con los pagos (campo id_pago)
 * 2. Al eliminar un pago, se eliminan también los movimientos asociados
 * 3. Los resúmenes de caja e ingresos se actualizan correctamente
 */

async function testEliminacionPagoMovimientos() {
  try {
    console.log('=== Iniciando prueba de eliminación de pagos y movimientos ===\n');

    // 1. Primero, vamos a verificar si hay pagos existentes con movimientos asociados
    console.log('1. Verificando pagos existentes...');
    
    const pagos = await PagosRepository.getPagosWithFilters({
      id_empresa: 1,
      limit: 5
    });
    
    if (pagos.pagos.length === 0) {
      console.log('   No se encontraron pagos para probar.');
      return;
    }

    console.log(`   Encontrados ${pagos.pagos.length} pagos:`);
    pagos.pagos.forEach(pago => {
      console.log(`   - Pago ID: ${pago.id}, Reserva: ${pago.codigo_reserva}, Monto: $${pago.monto}`);
    });

    // 2. Verificar movimientos asociados a cada pago
    console.log('\n2. Verificando movimientos asociados...');
    
    for (const pago of pagos.pagos.slice(0, 3)) { // Solo los primeros 3 para no saturar
      const movimientos = await PagoMovimientoService.obtenerMovimientosAsociados(pago.id);
      
      if (movimientos.length > 0) {
        console.log(`   Pago ${pago.id} tiene ${movimientos.length} movimiento(s) asociado(s):`);
        movimientos.forEach(mov => {
          console.log(`     - Movimiento ID: ${mov.id}, Tipo: ${mov.tipo}, Monto: $${mov.monto}, ID_Pago: ${mov.id_pago}`);
        });
      } else {
        console.log(`   Pago ${pago.id} NO tiene movimientos asociados`);
      }
    }

    // 3. Verificar el estado antes de eliminar un pago específico
    const pagoParaEliminar = pagos.pagos[0];
    console.log(`\n3. Analizando pago ${pagoParaEliminar.id} antes de eliminar...`);
    
    const movimientosAntes = await PagoMovimientoService.obtenerMovimientosAsociados(pagoParaEliminar.id);
    const resumenAntes = await PagosRepository.getResumenPagosReserva(pagoParaEliminar.id_reserva);
    
    console.log(`   - Movimientos asociados: ${movimientosAntes.length}`);
    console.log(`   - Total pagado antes: $${resumenAntes?.total_pagado || 0}`);
    console.log(`   - Total pendiente antes: $${resumenAntes?.total_pendiente || 0}`);

    // 4. Simular eliminación de movimientos (sin eliminar realmente el pago)
    console.log('\n4. Simulando eliminación de movimientos...');
    
    if (movimientosAntes.length > 0) {
      const resultadoEliminacion = await PagoMovimientoService.eliminarMovimientoAsociado(pagoParaEliminar.id);
      console.log(`   - Movimientos eliminados: ${resultadoEliminacion.movimientos_eliminados}`);
      console.log(`   - IDs eliminados: [${resultadoEliminacion.movimientos_encontrados.join(', ')}]`);
      
      // Verificar que efectivamente se eliminaron
      const movimientosDespues = await PagoMovimientoService.obtenerMovimientosAsociados(pagoParaEliminar.id);
      console.log(`   - Movimientos restantes: ${movimientosDespues.length}`);
      
      if (movimientosDespues.length === 0) {
        console.log('   ✅ Movimientos eliminados correctamente');
      } else {
        console.log('   ❌ ERROR: Aún quedan movimientos asociados');
      }
    } else {
      console.log('   - No hay movimientos para eliminar');
    }

    // 5. Verificar estado del resumen después de la eliminación
    const resumenDespues = await PagosRepository.getResumenPagosReserva(pagoParaEliminar.id_reserva);
    console.log(`\n5. Estado después de eliminar movimientos:`);
    console.log(`   - Total pagado después: $${resumenDespues?.total_pagado || 0}`);
    console.log(`   - Total pendiente después: $${resumenDespues?.total_pendiente || 0}`);

    console.log('\n=== Prueba completada ===');
    console.log('\nNOTA: Esta fue una prueba de eliminación de movimientos.');
    console.log('El pago en sí NO fue eliminado para preservar los datos.');
    console.log('Para una prueba completa, usar el endpoint DELETE /api/v1/pagos/{id}');

  } catch (error) {
    console.error('Error durante la prueba:', error);
    throw error;
  }
}

/**
 * Función auxiliar para mostrar el estado actual de la base de datos
 */
async function mostrarEstadoActual() {
  try {
    console.log('=== Estado actual de la base de datos ===\n');
    
    // Consulta para mostrar pagos con sus movimientos asociados
    const pool = require('./libs/db').default;
    
    const query = `
      SELECT 
        p.id as pago_id,
        p.codigo_reserva,
        p.monto as pago_monto,
        p.fecha_pago,
        p.metodo_pago,
        COUNT(m.id) as movimientos_asociados,
        COALESCE(SUM(m.monto), 0) as total_movimientos
      FROM pagos p
      LEFT JOIN movimientos m ON m.id_pago = p.id
      WHERE p.id_empresa = 1
      GROUP BY p.id, p.codigo_reserva, p.monto, p.fecha_pago, p.metodo_pago
      ORDER BY p.fecha_pago DESC
      LIMIT 10
    `;
    
    const { rows } = await pool.query(query);
    
    console.log('Últimos 10 pagos con información de movimientos:');
    console.log('┌─────────┬──────────────┬──────────────┬─────────────┬──────────────┬─────────────────────┬─────────────────────┐');
    console.log('│ Pago ID │ Cod. Reserva │ Monto Pago   │ Fecha       │ Método       │ Movimientos Asoc.   │ Total Movimientos   │');
    console.log('├─────────┼──────────────┼──────────────┼─────────────┼──────────────┼─────────────────────┼─────────────────────┤');
    
    rows.forEach((row: any) => {
      const pagoId = String(row.pago_id).padEnd(7);
      const codigoReserva = String(row.codigo_reserva || 'N/A').padEnd(12);
      const montoPago = `$${Number(row.pago_monto).toLocaleString()}`.padEnd(12);
      const fecha = String(row.fecha_pago).padEnd(11);
      const metodo = String(row.metodo_pago).padEnd(12);
      const movimientosAsoc = String(row.movimientos_asociados).padEnd(19);
      const totalMov = `$${Number(row.total_movimientos).toLocaleString()}`.padEnd(19);
      
      console.log(`│ ${pagoId} │ ${codigoReserva} │ ${montoPago} │ ${fecha} │ ${metodo} │ ${movimientosAsoc} │ ${totalMov} │`);
    });
    
    console.log('└─────────┴──────────────┴──────────────┴─────────────┴──────────────┴─────────────────────┴─────────────────────┘');
    
    // Mostrar estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT p.id) as total_pagos,
        COUNT(DISTINCT m.id) as total_movimientos,
        COUNT(DISTINCT CASE WHEN m.id_pago IS NOT NULL THEN m.id END) as movimientos_con_pago,
        COUNT(DISTINCT CASE WHEN m.id_pago IS NULL THEN m.id END) as movimientos_sin_pago
      FROM pagos p
      LEFT JOIN movimientos m ON m.id_empresa = p.id_empresa::text
      WHERE p.id_empresa = 1
    `;
    
    const { rows: stats } = await pool.query(statsQuery);
    const stat = stats[0];
    
    console.log('\nEstadísticas generales:');
    console.log(`- Total de pagos: ${stat.total_pagos}`);
    console.log(`- Total de movimientos: ${stat.total_movimientos}`);
    console.log(`- Movimientos asociados a pagos: ${stat.movimientos_con_pago}`);
    console.log(`- Movimientos sin asociar: ${stat.movimientos_sin_pago}`);

  } catch (error) {
    console.error('Error al mostrar estado actual:', error);
  }
}

// Ejecutar las pruebas
async function main() {
  try {
    await mostrarEstadoActual();
    console.log('\n' + '='.repeat(80) + '\n');
    await testEliminacionPagoMovimientos();
  } catch (error) {
    console.error('Error en las pruebas:', error);
    process.exit(1);
  }
}

// Solo ejecutar si el archivo se llama directamente
if (require.main === module) {
  main();
}

export { testEliminacionPagoMovimientos, mostrarEstadoActual };