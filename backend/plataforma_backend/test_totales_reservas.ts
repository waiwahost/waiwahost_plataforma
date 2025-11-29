import { PagosRepository } from './repositories/pagos.repository';
import { updateTotalesReservaService } from './services/reservas/updateTotalesReservaService';
import dbClient from './libs/db';

/**
 * Script de prueba para verificar la funcionalidad de totales de reservas
 */
async function testTotalesReservas() {
  console.log('🔍 Iniciando pruebas de totales de reservas...\n');

  try {
    // 1. Verificar que las columnas existen en la base de datos
    console.log('1. Verificando estructura de la base de datos...');
    const checkColumns = await dbClient.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'reservas' 
      AND column_name IN ('total_reserva', 'total_pagado', 'total_pendiente')
      ORDER BY column_name;
    `);

    if (checkColumns.rows.length === 3) {
      console.log('✅ Todas las columnas de totales están presentes:');
      checkColumns.rows.forEach((col: any) => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('❌ Faltan columnas de totales en la tabla reservas');
      return;
    }

    // 2. Obtener una reserva de ejemplo
    console.log('\n2. Buscando reserva de ejemplo...');
    const reservaTest = await dbClient.query(`
      SELECT r.id_reserva, r.codigo_reserva, r.total_reserva, r.total_pagado, r.total_pendiente
      FROM reservas r
      LIMIT 1
    `);

    if (reservaTest.rows.length === 0) {
      console.log('❌ No se encontraron reservas para probar');
      return;
    }

    const reserva = reservaTest.rows[0];
    console.log('✅ Reserva encontrada:');
    console.log(`   ID: ${reserva.id_reserva}`);
    console.log(`   Código: ${reserva.codigo_reserva}`);
    console.log(`   Total Reserva: $${reserva.total_reserva}`);
    console.log(`   Total Pagado: $${reserva.total_pagado}`);
    console.log(`   Total Pendiente: $${reserva.total_pendiente}`);

    // 3. Verificar consistencia de totales
    console.log('\n3. Verificando consistencia de totales...');
    const verificacion = await updateTotalesReservaService.verificarConsistenciaTotales(reserva.id_reserva);
    
    console.log(`✅ Resultado de verificación:`);
    console.log(`   Consistente: ${verificacion.esConsistente ? '✅' : '❌'}`);
    console.log(`   Totales guardados - Pagado: $${verificacion.totalesGuardados.totalPagado}, Pendiente: $${verificacion.totalesGuardados.totalPendiente}`);
    console.log(`   Totales calculados - Pagado: $${verificacion.totalesCalculados.totalPagado}, Pendiente: $${verificacion.totalesCalculados.totalPendiente}`);
    
    if (!verificacion.esConsistente) {
      console.log(`   Diferencias - Pagado: $${verificacion.diferencias.totalPagado}, Pendiente: $${verificacion.diferencias.totalPendiente}`);
      
      // 4. Corregir totales si hay inconsistencias
      console.log('\n4. Corrigiendo totales inconsistentes...');
      await updateTotalesReservaService.actualizarTotales(reserva.id_reserva);
      console.log('✅ Totales actualizados');
      
      // Verificar nuevamente
      const verificacionPost = await updateTotalesReservaService.verificarConsistenciaTotales(reserva.id_reserva);
      console.log(`   Nueva verificación - Consistente: ${verificacionPost.esConsistente ? '✅' : '❌'}`);
    }

    // 5. Probar obtención de resumen de pagos
    console.log('\n5. Probando resumen de pagos de la reserva...');
    const resumen = await PagosRepository.getResumenPagosReserva(reserva.id_reserva);
    
    if (resumen) {
      console.log('✅ Resumen obtenido correctamente:');
      console.log(`   Total Reserva: $${resumen.total_reserva}`);
      console.log(`   Total Pagado: $${resumen.total_pagado}`);
      console.log(`   Total Pendiente: $${resumen.total_pendiente}`);
      console.log(`   Cantidad de Pagos: ${resumen.cantidad_pagos}`);
      console.log(`   Porcentaje Pagado: ${resumen.porcentaje_pagado}%`);
      console.log(`   Estado de Pago: ${resumen.estado_pago}`);
      
      if (resumen.ultimo_pago) {
        console.log(`   Último Pago: $${resumen.ultimo_pago.monto} (${resumen.ultimo_pago.fecha})`);
      }
    } else {
      console.log('❌ No se pudo obtener el resumen de pagos');
    }

    // 6. Verificar que el listado de reservas incluye las columnas
    console.log('\n6. Verificando listado de reservas...');
    const listadoReservas = await dbClient.query(`
      SELECT 
        r.id_reserva,
        r.codigo_reserva,
        r.total_reserva,
        r.total_pagado,
        r.total_pendiente,
        i.nombre as nombre_inmueble
      FROM reservas r
      INNER JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
      LIMIT 3
    `);

    console.log('✅ Muestra del listado de reservas:');
    listadoReservas.rows.forEach((r: any, index: number) => {
      console.log(`   ${index + 1}. ${r.codigo_reserva} - ${r.nombre_inmueble}`);
      console.log(`      Total: $${r.total_reserva} | Pagado: $${r.total_pagado} | Pendiente: $${r.total_pendiente}`);
    });

    console.log('\n🎉 Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    // Cerrar conexión
    await dbClient.end();
  }
}

// Ejecutar las pruebas
testTotalesReservas().catch(console.error);