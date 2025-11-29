/**
 * Script de prueba para verificar la creación de pagos y movimientos asociados
 */

import { config } from 'dotenv';
import pool from './libs/db';

// Cargar variables de entorno
config();

async function verificarCreacionPagoMovimiento() {
  console.log('🔍 Verificando creación de pagos y movimientos...\n');

  try {
    // 1. Verificar que existe al menos una reserva en el sistema
    const reservasQuery = `
      SELECT id_reserva, codigo_reserva, id_inmueble, total_reserva
      FROM reservas 
      ORDER BY id_reserva DESC 
      LIMIT 5
    `;
    
    const { rows: reservas } = await pool.query(reservasQuery);
    
    if (reservas.length === 0) {
      console.log('❌ No hay reservas en el sistema para probar');
      return;
    }

    console.log('📋 Reservas disponibles para prueba:');
    reservas.forEach((reserva: any, index: number) => {
      console.log(`  ${index + 1}. ID: ${reserva.id_reserva}, Código: ${reserva.codigo_reserva}, Inmueble: ${reserva.id_inmueble}, Total: $${reserva.total_reserva}`);
    });

    const reservaPrueba = reservas[0];
    console.log(`\n🎯 Usando reserva: ${reservaPrueba.codigo_reserva} (ID: ${reservaPrueba.id_reserva})`);

    // 2. Verificar estructura de tabla movimientos (campo id_pago)
    const estructuraQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'movimientos' 
      AND column_name = 'id_pago'
    `;

    const { rows: estructura } = await pool.query(estructuraQuery);
    
    if (estructura.length === 0) {
      console.log('❌ El campo id_pago no existe en la tabla movimientos');
      console.log('💡 Ejecuta el script verify_pago_movimiento_relation.sql para crear el campo');
      return;
    } else {
      console.log('✅ Campo id_pago existe en tabla movimientos');
    }

    // 3. Contar movimientos antes de crear el pago
    const movimientosAntesQuery = `
      SELECT COUNT(*) as total, 
             COUNT(CASE WHEN id_pago IS NOT NULL THEN 1 END) as con_pago
      FROM movimientos 
      WHERE fecha = CURRENT_DATE
    `;
    
    const { rows: [movimientosAntes] } = await pool.query(movimientosAntesQuery);
    console.log(`\n📊 Movimientos actuales del día: ${movimientosAntes.total} total, ${movimientosAntes.con_pago} con id_pago`);

    // 4. Contar pagos antes
    const pagosAntesQuery = `
      SELECT COUNT(*) as total
      FROM pagos 
      WHERE fecha_pago = CURRENT_DATE
    `;
    
    const { rows: [pagosAntes] } = await pool.query(pagosAntesQuery);
    console.log(`📊 Pagos actuales del día: ${pagosAntes.total}`);

    // 5. Simular la creación de un pago (sin ejecutar realmente)
    console.log('\n🧪 Simulando datos de pago:');
    const pagoSimulado = {
      id_reserva: reservaPrueba.id_reserva,
      monto: 100000,
      fecha_pago: new Date().toISOString().split('T')[0],
      metodo_pago: 'efectivo',
      concepto: 'Pago de prueba - verificación',
      descripcion: 'Pago de prueba para verificar creación de movimientos',
      id_empresa: 1
    };

    console.log('   Datos del pago:', pagoSimulado);

    // 6. Verificar lógica de mapeo de conceptos
    const { PagoMovimientoService } = await import('./services/pagoMovimiento.service');
    
    // Verificar método de obtener inmueble
    console.log('\n🏠 Verificando obtención de inmueble...');
    const inmuebleId = await PagoMovimientoService.obtenerInmuebleDeReserva(reservaPrueba.id_reserva);
    console.log(`   ID inmueble obtenido: ${inmuebleId}`);

    if (!inmuebleId) {
      console.log('❌ No se pudo obtener el ID del inmueble de la reserva');
      console.log('💡 Verifica que la reserva tenga un inmueble asignado');
      return;
    }

    // 7. Verificar que el repositorio de pagos funciona
    console.log('\n💰 Verificando repositorio de pagos...');
    const { PagosRepository } = await import('./repositories/pagos.repository');
    
    const resumenReserva = await PagosRepository.getResumenPagosReserva(reservaPrueba.id_reserva);
    console.log('   Resumen de reserva:', resumenReserva);

    if (!resumenReserva) {
      console.log('❌ No se pudo obtener el resumen de la reserva');
      return;
    }

    console.log('\n✅ Todas las verificaciones preliminares pasaron');
    console.log('\n📝 Para probar la creación completa:');
    console.log('   1. Usar el endpoint POST /api/v1/pagos con los datos simulados');
    console.log('   2. Verificar que se crea el pago en la tabla pagos');
    console.log('   3. Verificar que se crea el movimiento en la tabla movimientos con id_pago');
    console.log('   4. Revisar los logs del servidor para ver mensajes de debug');

    console.log('\n🚀 Sistema listo para crear pagos y movimientos asociados');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    
    if (error instanceof Error && (error as any).code === 'ECONNREFUSED') {
      console.log('\n💡 Error de conexión a la base de datos');
      console.log('   Verifica que PostgreSQL esté corriendo');
      console.log('   Revisa las variables de entorno de conexión DB');
    }
  } finally {
    await pool.end();
  }
}

// Ejecutar verificación
verificarCreacionPagoMovimiento().catch(console.error);