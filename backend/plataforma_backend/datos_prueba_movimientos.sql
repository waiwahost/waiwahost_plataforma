-- ===============================================================================
-- DATOS DE PRUEBA COMPLETOS PARA SISTEMA DE MOVIMIENTOS
-- ===============================================================================

-- IMPORTANTE: Ejecutar DESPUÉS de crear la tabla movimientos y verificar que
-- existen las empresas, inmuebles y reservas referenciados

-- ===============================================================================
-- 1. DATOS DE PRUEBA BÁSICOS
-- ===============================================================================

-- Limpiar datos existentes de prueba (OPCIONAL - solo para testing)
-- DELETE FROM movimientos WHERE id LIKE 'test_%' OR id LIKE 'mov_%';

-- ===============================================================================
-- 2. MOVIMIENTOS PARA HOY (CURRENT_DATE)
-- ===============================================================================

INSERT INTO movimientos (
    id, fecha, tipo, concepto, descripcion, monto, 
    id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa
) VALUES 

-- Inmueble 1 - Día actual
('mov_hoy_001', CURRENT_DATE, 'ingreso', 'reserva', 'Pago inicial reserva RSV-2025-001 - Check-in apartamento centro', 200000, '1', '1', 'transferencia', 'TRF-001234', '1'),
('mov_hoy_002', CURRENT_DATE, 'egreso', 'limpieza', 'Limpieza profunda post checkout anterior', 50000, '1', NULL, 'efectivo', NULL, '1'),
('mov_hoy_003', CURRENT_DATE, 'ingreso', 'deposito_garantia', 'Depósito de garantía apartamento centro', 150000, '1', '1', 'efectivo', 'EFE-001', '1'),

-- Inmueble 2 - Día actual  
('mov_hoy_004', CURRENT_DATE, 'ingreso', 'reserva', 'Pago completo reserva familiar RSV-2025-002', 300000, '2', '2', 'transferencia', 'TRF-005678', '1'),
('mov_hoy_005', CURRENT_DATE, 'egreso', 'suministros', 'Compra de productos de limpieza y amenities', 45000, '2', NULL, 'tarjeta', 'TAR-998877', '1'),

-- Inmueble 3 - Día actual
('mov_hoy_006', CURRENT_DATE, 'ingreso', 'servicios_adicionales', 'Cargo por late checkout solicitado por huésped', 25000, '3', '3', 'efectivo', NULL, '1');

-- ===============================================================================
-- 3. MOVIMIENTOS PARA AYER (CURRENT_DATE - 1)
-- ===============================================================================

INSERT INTO movimientos (
    id, fecha, tipo, concepto, descripcion, monto, 
    id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa
) VALUES 

-- Inmueble 1 - Ayer
('mov_ayer_001', CURRENT_DATE - INTERVAL '1 day', 'ingreso', 'reserva', 'Segundo abono reserva RSV-2025-004', 100000, '1', '4', 'transferencia', 'TRF-112233', '1'),
('mov_ayer_002', CURRENT_DATE - INTERVAL '1 day', 'egreso', 'mantenimiento', 'Reparación de plomería - fuga en baño principal', 80000, '1', NULL, 'transferencia', 'TRF-998866', '1'),
('mov_ayer_003', CURRENT_DATE - INTERVAL '1 day', 'ingreso', 'multa', 'Multa por daños menores en inmueble', 30000, '1', '4', 'efectivo', NULL, '1'),

-- Inmueble 2 - Ayer
('mov_ayer_004', CURRENT_DATE - INTERVAL '1 day', 'egreso', 'servicios_publicos', 'Factura de servicios públicos - Electricidad', 120000, '2', NULL, 'transferencia', 'TRF-555444', '1'),
('mov_ayer_005', CURRENT_DATE - INTERVAL '1 day', 'ingreso', 'limpieza', 'Cargo adicional por limpieza profunda solicitada', 40000, '2', '5', 'tarjeta', 'TAR-667788', '1');

-- ===============================================================================
-- 4. MOVIMIENTOS PARA HACE 2 DÍAS (CURRENT_DATE - 2)
-- ===============================================================================

INSERT INTO movimientos (
    id, fecha, tipo, concepto, descripcion, monto, 
    id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa
) VALUES 

-- Inmueble 1 - Hace 2 días
('mov_2dias_001', CURRENT_DATE - INTERVAL '2 days', 'ingreso', 'reserva', 'Pago completo reserva de fin de semana RSV-2025-006', 280000, '1', '6', 'transferencia', 'TRF-789012', '1'),
('mov_2dias_002', CURRENT_DATE - INTERVAL '2 days', 'egreso', 'comision', 'Comisión plataforma de reservas online', 35000, '1', '6', 'transferencia', 'TRF-COM-001', '1'),

-- Inmueble 3 - Hace 2 días
('mov_2dias_003', CURRENT_DATE - INTERVAL '2 days', 'ingreso', 'deposito_garantia', 'Depósito garantía casa familiar', 200000, '3', '7', 'transferencia', 'TRF-334455', '1'),
('mov_2dias_004', CURRENT_DATE - INTERVAL '2 days', 'egreso', 'limpieza', 'Servicio de limpieza profesional', 60000, '3', NULL, 'efectivo', 'EFE-LIMP-001', '1');

-- ===============================================================================
-- 5. MOVIMIENTOS PARA HACE 3 DÍAS (CURRENT_DATE - 3)
-- ===============================================================================

INSERT INTO movimientos (
    id, fecha, tipo, concepto, descripcion, monto, 
    id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa
) VALUES 

-- Múltiples inmuebles - Hace 3 días
('mov_3dias_001', CURRENT_DATE - INTERVAL '3 days', 'egreso', 'impuestos', 'Pago impuesto predial apartamento centro', 150000, '1', NULL, 'transferencia', 'TRF-IMP-001', '1'),
('mov_3dias_002', CURRENT_DATE - INTERVAL '3 days', 'ingreso', 'otro', 'Reembolso de seguro por daños previos', 75000, '2', NULL, 'transferencia', 'TRF-SEG-001', '1'),
('mov_3dias_003', CURRENT_DATE - INTERVAL '3 days', 'egreso', 'mantenimiento', 'Mantenimiento preventivo aires acondicionados', 90000, '2', NULL, 'transferencia', 'TRF-MAN-002', '1');

-- ===============================================================================
-- 6. MOVIMIENTOS DIVERSOS PARA TESTING
-- ===============================================================================

INSERT INTO movimientos (
    id, fecha, tipo, concepto, descripcion, monto, 
    id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa
) VALUES 

-- Movimientos con diferentes métodos de pago
('mov_test_001', CURRENT_DATE - INTERVAL '4 days', 'ingreso', 'reserva', 'Reserva pagada con tarjeta de crédito', 350000, '1', '8', 'tarjeta', 'TAR-123456', '1'),
('mov_test_002', CURRENT_DATE - INTERVAL '4 days', 'egreso', 'devolucion', 'Devolución por cancelación anticipada', 100000, '1', '8', 'transferencia', 'TRF-DEV-001', '1'),

-- Movimientos sin reserva asociada
('mov_test_003', CURRENT_DATE - INTERVAL '5 days', 'egreso', 'suministros', 'Compra de electrodomésticos para cocina', 180000, '2', NULL, 'transferencia', 'TRF-SUM-001', '1'),
('mov_test_004', CURRENT_DATE - INTERVAL '5 days', 'ingreso', 'otro', 'Ingreso por alquiler de parking adicional', 50000, '2', NULL, 'efectivo', NULL, '1'),

-- Movimientos con montos diversos
('mov_test_005', CURRENT_DATE - INTERVAL '6 days', 'egreso', 'servicios_publicos', 'Factura internet y cable', 85000, '3', NULL, 'transferencia', 'TRF-INT-001', '1'),
('mov_test_006', CURRENT_DATE - INTERVAL '6 days', 'ingreso', 'servicios_adicionales', 'Servicio de transporte al aeropuerto', 45000, '3', '9', 'efectivo', NULL, '1');

-- ===============================================================================
-- 7. CONSULTAS DE VERIFICACIÓN DESPUÉS DE INSERTAR
-- ===============================================================================

-- Verificar total de movimientos insertados
SELECT 'Total movimientos insertados' as descripcion, COUNT(*) as cantidad 
FROM movimientos;

-- Verificar movimientos por fecha (últimos 7 días)
SELECT 
    fecha,
    COUNT(*) as cantidad_movimientos,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
    SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as total_egresos,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) as balance
FROM movimientos 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha 
ORDER BY fecha DESC;

-- Verificar movimientos por inmueble
SELECT 
    id_inmueble,
    COUNT(*) as cantidad_movimientos,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
    SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as total_egresos
FROM movimientos 
GROUP BY id_inmueble 
ORDER BY id_inmueble;

-- Verificar distribución por tipo y concepto
SELECT 
    tipo,
    concepto,
    COUNT(*) as cantidad,
    AVG(monto) as monto_promedio,
    SUM(monto) as monto_total
FROM movimientos 
GROUP BY tipo, concepto 
ORDER BY tipo, cantidad DESC;

-- Verificar movimientos de hoy específicamente
SELECT 
    'Movimientos de hoy' as descripcion,
    id,
    tipo,
    concepto,
    descripcion,
    monto,
    id_inmueble,
    metodo_pago,
    DATE_PART('hour', fecha_creacion) as hora_creacion
FROM movimientos 
WHERE fecha = CURRENT_DATE 
ORDER BY fecha_creacion;

-- ===============================================================================
-- NOTAS PARA EL DESARROLLO
-- ===============================================================================

/*
DATOS INSERTADOS:

HOY (CURRENT_DATE):
- 6 movimientos distribuidos en 3 inmuebles
- 4 ingresos: $675,000 total
- 2 egresos: $95,000 total
- Balance del día: +$580,000

AYER (CURRENT_DATE - 1):
- 5 movimientos distribuidos en 2 inmuebles  
- 3 ingresos: $170,000 total
- 2 egresos: $200,000 total
- Balance del día: -$30,000

HACE 2 DÍAS:
- 4 movimientos distribuidos en 2 inmuebles
- 2 ingresos: $480,000 total
- 2 egresos: $95,000 total
- Balance del día: +$385,000

TOTAL ÚLTIMOS 7 DÍAS:
- Aproximadamente 20 movimientos de prueba
- Variedad de conceptos, métodos de pago y montos
- Datos realistas para testing completo

TESTING RECOMENDADO:
1. Probar endpoints con fecha actual
2. Probar navegación entre fechas
3. Probar filtros por inmueble
4. Verificar cálculos de resumen
5. Probar creación/edición/eliminación
6. Validar restricciones de conceptos por tipo
*/