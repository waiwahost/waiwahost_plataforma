-- ========================================================================
-- DATOS DE PRUEBA PARA EL SISTEMA DE PAGOS
-- Sistema de Pagos para Reservas - Plataforma Waiwahost
-- ========================================================================

-- IMPORTANTE: Este script debe ejecutarse DESPUÉS de crear la tabla pagos
-- y tener datos de prueba en las tablas reservas, inmuebles y empresas

-- ========================================================================
-- VERIFICACIÓN DE DATOS EXISTENTES
-- ========================================================================

-- Verificar que existen reservas de prueba
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reservas LIMIT 1) THEN
        RAISE NOTICE 'ADVERTENCIA: No existen reservas en la base de datos. Crear reservas primero.';
    ELSE
        RAISE NOTICE 'OK: Existen reservas en la base de datos.';
    END IF;
END $$;

-- Verificar que existe la tabla pagos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pagos') THEN
        RAISE EXCEPTION 'ERROR: La tabla pagos no existe. Ejecutar create_pagos_table.sql primero.';
    ELSE
        RAISE NOTICE 'OK: La tabla pagos existe.';
    END IF;
END $$;

-- ========================================================================
-- LIMPIAR DATOS DE PRUEBA EXISTENTES (OPCIONAL)
-- ========================================================================

-- Descomentar las siguientes líneas para limpiar datos previos
-- DELETE FROM pagos WHERE descripcion LIKE '%DATO DE PRUEBA%';
-- RAISE NOTICE 'Datos de prueba anteriores eliminados.';

-- ========================================================================
-- INSERTAR DATOS DE PRUEBA PARA PAGOS
-- ========================================================================

-- Pagos para Reserva ID 1 (si existe)
INSERT INTO pagos (
    id_reserva, 
    monto, 
    fecha_pago, 
    metodo_pago, 
    concepto, 
    descripcion, 
    comprobante, 
    id_empresa,
    id_usuario_registro
)
SELECT 
    1, -- id_reserva
    200000.00, -- monto
    CURRENT_DATE - INTERVAL '10 days', -- fecha_pago (hace 10 días)
    'transferencia', -- metodo_pago
    'Abono inicial', -- concepto
    'Primer pago de la reserva - DATO DE PRUEBA', -- descripcion
    'TRF-001-' || to_char(CURRENT_DATE - INTERVAL '10 days', 'YYYYMMDD'), -- comprobante
    1, -- id_empresa
    1  -- id_usuario_registro
WHERE EXISTS (SELECT 1 FROM reservas WHERE id_reserva = 1)
  AND NOT EXISTS (SELECT 1 FROM pagos WHERE id_reserva = 1 AND monto = 200000.00);

INSERT INTO pagos (
    id_reserva, 
    monto, 
    fecha_pago, 
    metodo_pago, 
    concepto, 
    descripcion, 
    comprobante, 
    id_empresa,
    id_usuario_registro
)
SELECT 
    1, -- id_reserva
    150000.00, -- monto
    CURRENT_DATE - INTERVAL '5 days', -- fecha_pago (hace 5 días)
    'efectivo', -- metodo_pago
    'Segundo abono', -- concepto
    'Segundo pago de la reserva - DATO DE PRUEBA', -- descripcion
    'EFE-001-' || to_char(CURRENT_DATE - INTERVAL '5 days', 'YYYYMMDD'), -- comprobante
    1, -- id_empresa
    1  -- id_usuario_registro
WHERE EXISTS (SELECT 1 FROM reservas WHERE id_reserva = 1)
  AND NOT EXISTS (SELECT 1 FROM pagos WHERE id_reserva = 1 AND monto = 150000.00);

-- Pagos para Reserva ID 2 (si existe)
INSERT INTO pagos (
    id_reserva, 
    monto, 
    fecha_pago, 
    metodo_pago, 
    concepto, 
    descripcion, 
    comprobante, 
    id_empresa,
    id_usuario_registro
)
SELECT 
    2, -- id_reserva
    300000.00, -- monto
    CURRENT_DATE - INTERVAL '7 days', -- fecha_pago (hace 7 días)
    'tarjeta', -- metodo_pago
    'Pago completo', -- concepto
    'Pago total de la reserva - DATO DE PRUEBA', -- descripcion
    'TC-001-' || to_char(CURRENT_DATE - INTERVAL '7 days', 'YYYYMMDD'), -- comprobante
    1, -- id_empresa
    1  -- id_usuario_registro
WHERE EXISTS (SELECT 1 FROM reservas WHERE id_reserva = 2)
  AND NOT EXISTS (SELECT 1 FROM pagos WHERE id_reserva = 2 AND monto = 300000.00);

-- Pagos para Reserva ID 3 (si existe) - Solo abono parcial
INSERT INTO pagos (
    id_reserva, 
    monto, 
    fecha_pago, 
    metodo_pago, 
    concepto, 
    descripcion, 
    comprobante, 
    id_empresa,
    id_usuario_registro
)
SELECT 
    3, -- id_reserva
    100000.00, -- monto
    CURRENT_DATE - INTERVAL '3 days', -- fecha_pago (hace 3 días)
    'transferencia', -- metodo_pago
    'Primer abono', -- concepto
    'Abono inicial parcial - DATO DE PRUEBA', -- descripcion
    'TRF-002-' || to_char(CURRENT_DATE - INTERVAL '3 days', 'YYYYMMDD'), -- comprobante
    1, -- id_empresa
    1  -- id_usuario_registro
WHERE EXISTS (SELECT 1 FROM reservas WHERE id_reserva = 3)
  AND NOT EXISTS (SELECT 1 FROM pagos WHERE id_reserva = 3 AND monto = 100000.00);

-- Pagos del día actual para pruebas de reportes diarios
INSERT INTO pagos (
    id_reserva, 
    monto, 
    fecha_pago, 
    metodo_pago, 
    concepto, 
    descripcion, 
    comprobante, 
    id_empresa,
    id_usuario_registro
)
SELECT 
    COALESCE((SELECT id_reserva FROM reservas LIMIT 1), 1), -- Usar primera reserva disponible
    50000.00, -- monto
    CURRENT_DATE, -- fecha_pago (hoy)
    'efectivo', -- metodo_pago
    'Pago del día', -- concepto
    'Pago realizado hoy para pruebas - DATO DE PRUEBA', -- descripcion
    'HOY-001-' || to_char(CURRENT_DATE, 'YYYYMMDD'), -- comprobante
    1, -- id_empresa
    1  -- id_usuario_registro
WHERE NOT EXISTS (
    SELECT 1 FROM pagos 
    WHERE fecha_pago = CURRENT_DATE 
    AND descripcion LIKE '%DATO DE PRUEBA%'
    AND monto = 50000.00
);

-- Pago con método "otro" para diversidad en reportes
INSERT INTO pagos (
    id_reserva, 
    monto, 
    fecha_pago, 
    metodo_pago, 
    concepto, 
    descripcion, 
    comprobante, 
    id_empresa,
    id_usuario_registro
)
SELECT 
    COALESCE((SELECT id_reserva FROM reservas LIMIT 1), 1), -- Usar primera reserva disponible
    75000.00, -- monto
    CURRENT_DATE - INTERVAL '1 day', -- fecha_pago (ayer)
    'otro', -- metodo_pago
    'Pago especial', -- concepto
    'Pago con método otro para pruebas - DATO DE PRUEBA', -- descripcion
    'OTRO-001-' || to_char(CURRENT_DATE - INTERVAL '1 day', 'YYYYMMDD'), -- comprobante
    1, -- id_empresa
    1  -- id_usuario_registro
WHERE NOT EXISTS (
    SELECT 1 FROM pagos 
    WHERE metodo_pago = 'otro'
    AND descripcion LIKE '%DATO DE PRUEBA%'
    AND monto = 75000.00
);

-- ========================================================================
-- VERIFICAR DATOS INSERTADOS
-- ========================================================================

-- Mostrar resumen de pagos insertados
DO $$
DECLARE
    total_pagos INTEGER;
    total_monto DECIMAL(15,2);
BEGIN
    SELECT COUNT(*), COALESCE(SUM(monto), 0) 
    INTO total_pagos, total_monto
    FROM pagos 
    WHERE descripcion LIKE '%DATO DE PRUEBA%';
    
    RAISE NOTICE 'RESULTADO: Se insertaron % pagos de prueba por un total de $%', 
                 total_pagos, total_monto;
END $$;

-- Mostrar desglose por método de pago
SELECT 
    metodo_pago,
    COUNT(*) as cantidad_pagos,
    SUM(monto) as total_monto,
    MIN(fecha_pago) as fecha_mas_antigua,
    MAX(fecha_pago) as fecha_mas_reciente
FROM pagos 
WHERE descripcion LIKE '%DATO DE PRUEBA%'
GROUP BY metodo_pago
ORDER BY total_monto DESC;

-- ========================================================================
-- DATOS ADICIONALES PARA DIFERENTES ESCENARIOS
-- ========================================================================

-- Pagos para el mes pasado (para pruebas de filtros por fecha)
INSERT INTO pagos (
    id_reserva, 
    monto, 
    fecha_pago, 
    metodo_pago, 
    concepto, 
    descripcion, 
    comprobante, 
    id_empresa,
    id_usuario_registro
)
SELECT 
    COALESCE((SELECT id_reserva FROM reservas LIMIT 1), 1),
    180000.00,
    CURRENT_DATE - INTERVAL '1 month',
    'transferencia',
    'Pago mes anterior',
    'Pago del mes pasado para pruebas de filtros - DATO DE PRUEBA',
    'MES-PAST-' || to_char(CURRENT_DATE - INTERVAL '1 month', 'YYYYMMDD'),
    1,
    1
WHERE NOT EXISTS (
    SELECT 1 FROM pagos 
    WHERE fecha_pago = CURRENT_DATE - INTERVAL '1 month'
    AND descripcion LIKE '%DATO DE PRUEBA%'
    AND monto = 180000.00
);

-- Pago con monto alto para pruebas de validación
INSERT INTO pagos (
    id_reserva, 
    monto, 
    fecha_pago, 
    metodo_pago, 
    concepto, 
    descripcion, 
    comprobante, 
    id_empresa,
    id_usuario_registro
)
SELECT 
    COALESCE((SELECT id_reserva FROM reservas LIMIT 1), 1),
    500000.00,
    CURRENT_DATE - INTERVAL '2 days',
    'transferencia',
    'Pago alto',
    'Pago de monto alto para pruebas - DATO DE PRUEBA',
    'ALTO-001-' || to_char(CURRENT_DATE - INTERVAL '2 days', 'YYYYMMDD'),
    1,
    1
WHERE NOT EXISTS (
    SELECT 1 FROM pagos 
    WHERE monto = 500000.00
    AND descripcion LIKE '%DATO DE PRUEBA%'
);

-- ========================================================================
-- PROBAR LAS VISTAS CREADAS
-- ========================================================================

-- Probar vista de resumen de pagos por reserva
SELECT 
    'VISTA RESUMEN' as tipo_consulta,
    id_reserva,
    codigo_reserva,
    total_reserva,
    total_pagado,
    total_pendiente,
    cantidad_pagos,
    estado_pago,
    porcentaje_pagado
FROM vista_resumen_pagos_reserva 
WHERE id_reserva IN (1, 2, 3)
ORDER BY id_reserva;

-- Probar vista de pagos diarios
SELECT 
    'VISTA DIARIA' as tipo_consulta,
    fecha_pago,
    cantidad_pagos,
    total_ingresos_pagos,
    pagos_efectivo,
    total_efectivo,
    pagos_transferencia,
    total_transferencia,
    pagos_tarjeta,
    total_tarjeta
FROM vista_pagos_diarios 
WHERE fecha_pago >= CURRENT_DATE - INTERVAL '15 days'
ORDER BY fecha_pago DESC;

-- ========================================================================
-- CONSULTAS DE VERIFICACIÓN FINALES
-- ========================================================================

-- Resumen general de todos los datos de prueba
SELECT 
    'RESUMEN FINAL' as titulo,
    COUNT(*) as total_pagos_prueba,
    SUM(monto) as total_monto_prueba,
    COUNT(DISTINCT id_reserva) as reservas_con_pagos,
    COUNT(DISTINCT metodo_pago) as metodos_diferentes,
    MIN(fecha_pago) as pago_mas_antiguo,
    MAX(fecha_pago) as pago_mas_reciente
FROM pagos 
WHERE descripcion LIKE '%DATO DE PRUEBA%';

-- Verificar integridad referencial
SELECT 
    'INTEGRIDAD' as titulo,
    COUNT(*) as pagos_sin_reserva
FROM pagos p
LEFT JOIN reservas r ON p.id_reserva = r.id_reserva
WHERE r.id_reserva IS NULL
  AND p.descripcion LIKE '%DATO DE PRUEBA%';

-- ========================================================================
-- INSTRUCCIONES PARA LIMPIAR DATOS DE PRUEBA
-- ========================================================================

/*
Para eliminar todos los datos de prueba, ejecutar:

DELETE FROM pagos WHERE descripcion LIKE '%DATO DE PRUEBA%';

-- Verificar eliminación
SELECT COUNT(*) as pagos_prueba_restantes 
FROM pagos 
WHERE descripcion LIKE '%DATO DE PRUEBA%';
*/

-- ========================================================================
-- NOTAS IMPORTANTES
-- ========================================================================

/*
1. Estos datos de prueba incluyen diferentes escenarios:
   - Pagos completos y parciales
   - Diferentes métodos de pago
   - Diferentes fechas para probar filtros
   - Montos variados para validaciones

2. Los comprobantes incluyen la fecha para hacerlos únicos

3. Todos los pagos de prueba tienen la frase "DATO DE PRUEBA" en la descripción
   para fácil identificación y limpieza

4. Se verifica la existencia de reservas antes de insertar pagos

5. Se evitan duplicados verificando antes de insertar

6. Los datos están diseñados para probar:
   - Endpoints de consulta
   - Filtros por fecha y método
   - Cálculos de resumen
   - Vistas de base de datos
   - Reportes diarios

7. Para usar en producción, modificar los IDs de reserva, empresa y usuario
   según los datos reales del sistema
*/

RAISE NOTICE '========================================================================';
RAISE NOTICE 'DATOS DE PRUEBA PARA SISTEMA DE PAGOS INSERTADOS EXITOSAMENTE';
RAISE NOTICE 'Para eliminar: DELETE FROM pagos WHERE descripcion LIKE ''%DATO DE PRUEBA%'';';
RAISE NOTICE '========================================================================';