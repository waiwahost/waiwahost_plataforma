-- ============================================================================
-- SCRIPT SQL PARA NUEVOS CAMPOS FINANCIEROS EN RESERVAS
-- ============================================================================
-- Este script agrega los nuevos campos financieros a la tabla reservas
-- y proporciona consultas para los endpoints de ingresos y egresos.

-- ============================================================================
-- 1. MODIFICACIONES EN LA TABLA RESERVAS
-- ============================================================================

-- Agregar nuevas columnas financieras a la tabla reservas
ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS total_reserva DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_pagado DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_pendiente DECIMAL(12,2) NOT NULL DEFAULT 0.00;

-- Comentarios para documentar las columnas
COMMENT ON COLUMN reservas.total_reserva IS 'Monto total de la reserva';
COMMENT ON COLUMN reservas.total_pagado IS 'Monto total pagado/abonado por el huésped';
COMMENT ON COLUMN reservas.total_pendiente IS 'Monto pendiente por pagar (total_reserva - total_pagado)';

-- ============================================================================
-- 2. TRIGGERS PARA CALCULAR AUTOMÁTICAMENTE TOTAL_PENDIENTE
-- ============================================================================

-- Función para calcular total_pendiente automáticamente
CREATE OR REPLACE FUNCTION calculate_total_pendiente()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_pendiente = NEW.total_reserva - NEW.total_pagado;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para INSERT
DROP TRIGGER IF EXISTS trigger_calculate_total_pendiente_insert ON reservas;
CREATE TRIGGER trigger_calculate_total_pendiente_insert
    BEFORE INSERT ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total_pendiente();

-- Trigger para UPDATE
DROP TRIGGER IF EXISTS trigger_calculate_total_pendiente_update ON reservas;
CREATE TRIGGER trigger_calculate_total_pendiente_update
    BEFORE UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total_pendiente();

-- ============================================================================
-- 3. MIGRACIÓN DE DATOS EXISTENTES
-- ============================================================================

-- Copiar precio_total a total_reserva para reservas existentes
UPDATE reservas 
SET total_reserva = precio_total 
WHERE total_reserva = 0 AND precio_total > 0;

-- Calcular total_pendiente para registros existentes
UPDATE reservas 
SET total_pendiente = total_reserva - total_pagado;

-- ============================================================================
-- 4. ÍNDICES PARA OPTIMIZAR CONSULTAS FINANCIERAS
-- ============================================================================

-- Índices para mejorar performance en consultas de ingresos/egresos
CREATE INDEX IF NOT EXISTS idx_reservas_total_pendiente ON reservas(total_pendiente);
CREATE INDEX IF NOT EXISTS idx_reservas_total_pagado ON reservas(total_pagado);
CREATE INDEX IF NOT EXISTS idx_reservas_financiero ON reservas(total_reserva, total_pagado, total_pendiente);

-- Índices existentes para movimientos (si no existen)
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha_tipo ON movimientos(fecha, tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_inmueble_fecha ON movimientos(id_inmueble, fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_empresa_fecha ON movimientos(id_empresa, fecha);

-- ============================================================================
-- 5. CONSULTAS PARA ENDPOINT DE INGRESOS
-- ============================================================================

-- Query para obtener ingresos (movimientos tipo ingreso + pagos de reservas)
-- Esta consulta se usará en el servicio getIngresosService

/*
CONSULTA PARA INGRESOS POR FECHA:
SELECT 
    -- Datos de movimientos tipo ingreso
    m.id_movimiento as id,
    m.fecha,
    DATE_PART('hour', m.fecha_creacion)::text || ':' || LPAD(DATE_PART('minute', m.fecha_creacion)::text, 2, '0') as hora,
    m.concepto,
    m.descripcion,
    m.monto,
    m.id_inmueble::integer,
    i.nombre as nombre_inmueble,
    m.id_reserva::integer,
    r.codigo_reserva,
    m.metodo_pago,
    'movimiento' as tipo_registro,
    m.fecha_creacion::text,
    m.comprobante
FROM movimientos m
INNER JOIN inmuebles i ON m.id_inmueble::integer = i.id_inmueble
LEFT JOIN reservas r ON m.id_reserva::integer = r.id_reserva
WHERE m.fecha = $1 
    AND m.tipo = 'ingreso'
    AND i.id_empresa = $2
    AND ($3 IS NULL OR m.id_inmueble::integer = $3)

UNION ALL

-- Datos de pagos de reservas (cuando total_pagado > 0)
SELECT 
    (1000000 + res.id_reserva) as id, -- ID único para diferenciarlo de movimientos
    res.created_at::date as fecha,
    DATE_PART('hour', res.created_at)::text || ':' || LPAD(DATE_PART('minute', res.created_at)::text, 2, '0') as hora,
    'pago_reserva' as concepto,
    'Pago de reserva - ' || im.nombre as descripcion,
    res.total_pagado as monto,
    res.id_inmueble,
    im.nombre as nombre_inmueble,
    res.id_reserva,
    res.codigo_reserva,
    'transferencia' as metodo_pago, -- Por defecto, podría venir de otra tabla
    'pago' as tipo_registro,
    res.created_at::text as fecha_creacion,
    null as comprobante
FROM reservas res
INNER JOIN inmuebles im ON res.id_inmueble = im.id_inmueble
WHERE res.created_at::date = $1
    AND res.total_pagado > 0
    AND im.id_empresa = $2
    AND ($3 IS NULL OR res.id_inmueble = $3)

ORDER BY fecha_creacion DESC;
*/

-- ============================================================================
-- 6. CONSULTAS PARA ENDPOINT DE EGRESOS
-- ============================================================================

-- Query para obtener egresos (solo movimientos tipo egreso)
-- Esta consulta se usará en el servicio getEgresosService

/*
CONSULTA PARA EGRESOS POR FECHA:
SELECT 
    m.id_movimiento as id,
    m.fecha,
    DATE_PART('hour', m.fecha_creacion)::text || ':' || LPAD(DATE_PART('minute', m.fecha_creacion)::text, 2, '0') as hora,
    m.concepto,
    m.descripcion,
    m.monto,
    m.id_inmueble::integer,
    i.nombre as nombre_inmueble,
    m.id_reserva::integer,
    r.codigo_reserva,
    m.metodo_pago,
    m.fecha_creacion::text,
    m.comprobante
FROM movimientos m
INNER JOIN inmuebles i ON m.id_inmueble::integer = i.id_inmueble
LEFT JOIN reservas r ON m.id_reserva::integer = r.id_reserva
WHERE m.fecha = $1 
    AND m.tipo = 'egreso'
    AND i.id_empresa = $2
    AND ($3 IS NULL OR m.id_inmueble::integer = $3)
ORDER BY m.fecha_creacion DESC;
*/

-- ============================================================================
-- 7. CONSULTAS PARA RESÚMENES
-- ============================================================================

-- Query para resumen de ingresos
/*
CONSULTA PARA RESUMEN DE INGRESOS:
WITH ingresos_data AS (
    -- Movimientos tipo ingreso
    SELECT 
        m.monto,
        m.id_inmueble::integer,
        i.nombre as nombre_inmueble
    FROM movimientos m
    INNER JOIN inmuebles i ON m.id_inmueble::integer = i.id_inmueble
    WHERE m.fecha = $1 
        AND m.tipo = 'ingreso'
        AND i.id_empresa = $2
        AND ($3 IS NULL OR m.id_inmueble::integer = $3)
    
    UNION ALL
    
    -- Pagos de reservas
    SELECT 
        res.total_pagado as monto,
        res.id_inmueble,
        im.nombre as nombre_inmueble
    FROM reservas res
    INNER JOIN inmuebles im ON res.id_inmueble = im.id_inmueble
    WHERE res.created_at::date = $1
        AND res.total_pagado > 0
        AND im.id_empresa = $2
        AND ($3 IS NULL OR res.id_inmueble = $3)
)
SELECT 
    SUM(monto) as total_ingresos,
    COUNT(*) as cantidad_ingresos,
    AVG(monto) as promedio_ingreso
FROM ingresos_data;
*/

-- Query para desglose por inmueble (cuando no hay filtro específico)
/*
CONSULTA PARA DESGLOSE POR INMUEBLE:
-- Similar a la anterior pero agrupando por inmueble
WITH ingresos_data AS (...)
SELECT 
    id_inmueble,
    nombre_inmueble,
    SUM(monto) as total,
    COUNT(*) as cantidad
FROM ingresos_data
GROUP BY id_inmueble, nombre_inmueble
ORDER BY total DESC;
*/

-- ============================================================================
-- 8. CONSULTA PARA INMUEBLES FILTRO
-- ============================================================================

-- Query para obtener inmuebles para filtros
/*
CONSULTA PARA INMUEBLES FILTRO:
SELECT 
    i.id_inmueble as id,
    i.nombre,
    i.direccion
FROM inmuebles i
WHERE i.id_empresa = $1
    AND i.estado = 'activo'
ORDER BY i.nombre;
*/

-- ============================================================================
-- 9. VALIDACIONES Y CONSTRAINTS
-- ============================================================================

-- Agregar constraints para validar los datos financieros
ALTER TABLE reservas 
ADD CONSTRAINT check_total_reserva_positive 
CHECK (total_reserva >= 0);

ALTER TABLE reservas 
ADD CONSTRAINT check_total_pagado_positive 
CHECK (total_pagado >= 0);

ALTER TABLE reservas 
ADD CONSTRAINT check_total_pagado_not_greater_than_total 
CHECK (total_pagado <= total_reserva);

-- ============================================================================
-- 10. DATOS DE PRUEBA (OPCIONAL)
-- ============================================================================

-- Insertar algunos movimientos de prueba para testing
/*
-- Movimientos de ingreso
INSERT INTO movimientos (fecha, tipo, concepto, descripcion, monto, id_inmueble, metodo_pago, id_empresa, fecha_creacion)
VALUES 
('2024-10-09', 'ingreso', 'reserva', 'Pago de reserva - Apartamento Centro', 300000, '1', 'transferencia', '1', NOW()),
('2024-10-09', 'ingreso', 'deposito_garantia', 'Depósito de garantía', 150000, '2', 'efectivo', '1', NOW()),
('2024-10-09', 'ingreso', 'limpieza', 'Pago adicional por limpieza', 80000, '3', 'tarjeta', '1', NOW());

-- Movimientos de egreso
INSERT INTO movimientos (fecha, tipo, concepto, descripcion, monto, id_inmueble, metodo_pago, id_empresa, fecha_creacion)
VALUES 
('2024-10-09', 'egreso', 'mantenimiento', 'Reparación de aire acondicionado', 120000, '1', 'transferencia', '1', NOW()),
('2024-10-09', 'egreso', 'limpieza', 'Servicio de limpieza profunda', 80000, '2', 'efectivo', '1', NOW()),
('2024-10-09', 'egreso', 'servicios_publicos', 'Factura de servicios públicos', 150000, '3', 'transferencia', '1', NOW());

-- Actualizar algunas reservas con datos financieros de prueba
UPDATE reservas 
SET total_reserva = 450000, total_pagado = 450000 
WHERE id_reserva = 1;

UPDATE reservas 
SET total_reserva = 1250000, total_pagado = 0 
WHERE id_reserva = 2;

UPDATE reservas 
SET total_reserva = 320000, total_pagado = 150000 
WHERE id_reserva = 3;
*/

-- ============================================================================
-- RESUMEN DE CAMBIOS IMPLEMENTADOS
-- ============================================================================

/*
CAMBIOS EN LA BASE DE DATOS:
✅ Agregadas columnas: total_reserva, total_pagado, total_pendiente
✅ Triggers automáticos para calcular total_pendiente
✅ Índices para optimizar consultas financieras
✅ Constraints para validar integridad de datos
✅ Migración de datos existentes

ENDPOINTS IMPLEMENTADOS:
✅ GET /ingresos?fecha={fecha}&id_inmueble={id}
✅ GET /ingresos/resumen?fecha={fecha}&id_inmueble={id}
✅ GET /ingresos/inmuebles-filtro
✅ GET /egresos?fecha={fecha}&id_inmueble={id}
✅ GET /egresos/resumen?fecha={fecha}&id_inmueble={id}
✅ GET /egresos/inmuebles-filtro
✅ Actualizados endpoints de reservas para manejar campos financieros

FUNCIONALIDADES:
✅ Filtrado por fecha (obligatorio)
✅ Filtrado por inmueble (opcional)
✅ Resúmenes con totales, promedios y desglose por inmueble
✅ Combinación de movimientos + pagos para ingresos
✅ Solo movimientos para egresos
✅ Validaciones de integridad de datos financieros
✅ Cálculo automático de campos derivados
*/