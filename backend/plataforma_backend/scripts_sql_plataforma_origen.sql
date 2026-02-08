-- ===============================================================================
-- SCRIPT PARA AGREGAR PLATAFORMA DE ORIGEN
-- ===============================================================================
-- Este script agrega las columnas y validaciones necesarias para soportar
-- la funcionalidad de "Plataforma de Origen" en reservas y movimientos.
-- 
-- Ejecutar después de que las tablas reservas y movimientos ya existan.
-- ===============================================================================

-- 1. AGREGAR COLUMNA plataforma_origen A LA TABLA reservas
-- ===============================================================================

-- Verificar si la columna ya existe antes de agregarla
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservas' 
        AND column_name = 'plataforma_origen'
    ) THEN
        ALTER TABLE reservas 
        ADD COLUMN plataforma_origen VARCHAR(20) 
        DEFAULT 'directa' 
        CHECK (plataforma_origen IN ('airbnb', 'booking', 'pagina_web', 'directa'));
        
        -- Establecer valor por defecto en registros existentes
        UPDATE reservas SET plataforma_origen = 'directa' WHERE plataforma_origen IS NULL;
        
        -- Hacer la columna NOT NULL después de establecer valores por defecto
        ALTER TABLE reservas ALTER COLUMN plataforma_origen SET NOT NULL;
        
        RAISE NOTICE 'Columna plataforma_origen agregada a tabla reservas';
    ELSE
        RAISE NOTICE 'Columna plataforma_origen ya existe en tabla reservas';
    END IF;
END $$;

-- 2. AGREGAR COLUMNA plataforma_origen A LA TABLA movimientos
-- ===============================================================================

-- Verificar si la columna ya existe antes de agregarla
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'movimientos' 
        AND column_name = 'plataforma_origen'
    ) THEN
        ALTER TABLE movimientos 
        ADD COLUMN plataforma_origen VARCHAR(20) 
        NULL
        CHECK (plataforma_origen IN ('airbnb', 'booking', 'pagina_web', 'directa'));
        
        RAISE NOTICE 'Columna plataforma_origen agregada a tabla movimientos';
    ELSE
        RAISE NOTICE 'Columna plataforma_origen ya existe en tabla movimientos';
    END IF;
END $$;

-- 3. CREAR ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ===============================================================================

-- Índice para reservas por plataforma de origen
CREATE INDEX IF NOT EXISTS idx_reservas_plataforma_origen 
ON reservas(plataforma_origen);

-- Índice para movimientos por plataforma de origen
CREATE INDEX IF NOT EXISTS idx_movimientos_plataforma_origen 
ON movimientos(plataforma_origen);

-- Índice compuesto para movimientos por fecha y plataforma (para filtros)
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha_plataforma 
ON movimientos(fecha, plataforma_origen);

-- Índice compuesto para movimientos por empresa y plataforma (para reportes)
CREATE INDEX IF NOT EXISTS idx_movimientos_empresa_plataforma 
ON movimientos(id_empresa, plataforma_origen);

-- 4. FUNCIÓN PARA VALIDAR PLATAFORMA EN MOVIMIENTOS
-- ===============================================================================

-- Crear función para validar que plataforma_origen solo se use en ingresos de reserva
CREATE OR REPLACE FUNCTION validar_plataforma_movimiento()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo permitir plataforma_origen en movimientos de tipo 'ingreso' con concepto 'reserva'
    IF NEW.plataforma_origen IS NOT NULL THEN
        IF NEW.tipo != 'ingreso' OR NEW.concepto != 'reserva' THEN
            RAISE EXCEPTION 'La plataforma de origen solo es válida para movimientos de tipo "ingreso" con concepto "reserva"';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CREAR TRIGGER PARA VALIDAR PLATAFORMA EN MOVIMIENTOS
-- ===============================================================================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trg_validar_plataforma_movimiento ON movimientos;

-- Crear trigger para validar plataforma de origen
CREATE TRIGGER trg_validar_plataforma_movimiento
    BEFORE INSERT OR UPDATE ON movimientos
    FOR EACH ROW
    EXECUTE FUNCTION validar_plataforma_movimiento();

-- 6. FUNCIÓN PARA SINCRONIZAR PLATAFORMA ENTRE RESERVA Y MOVIMIENTO
-- ===============================================================================

-- Crear función para copiar plataforma_origen de reserva a movimiento automáticamente
CREATE OR REPLACE FUNCTION sincronizar_plataforma_reserva_movimiento()
RETURNS TRIGGER AS $$
DECLARE
    reserva_plataforma VARCHAR(20);
BEGIN
    -- Solo aplicar si es un movimiento de ingreso con concepto reserva y tiene id_reserva
    IF NEW.tipo = 'ingreso' AND NEW.concepto = 'reserva' AND NEW.id_reserva IS NOT NULL THEN
        -- Obtener plataforma_origen de la reserva
        SELECT plataforma_origen INTO reserva_plataforma 
        FROM reservas 
        WHERE id_reserva = NEW.id_reserva::integer;
        
        -- Si se encuentra la reserva y no se especificó plataforma, usar la de la reserva
        IF reserva_plataforma IS NOT NULL AND NEW.plataforma_origen IS NULL THEN
            NEW.plataforma_origen = reserva_plataforma;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CREAR TRIGGER PARA SINCRONIZACIÓN AUTOMÁTICA
-- ===============================================================================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trg_sincronizar_plataforma ON movimientos;

-- Crear trigger para sincronización automática (se ejecuta antes del trigger de validación)
CREATE TRIGGER trg_sincronizar_plataforma
    BEFORE INSERT OR UPDATE ON movimientos
    FOR EACH ROW
    EXECUTE FUNCTION sincronizar_plataforma_reserva_movimiento();

-- 8. ACTUALIZAR MOVIMIENTOS EXISTENTES CON PLATAFORMA DE SUS RESERVAS
-- ===============================================================================

-- Actualizar movimientos existentes que tienen reserva asociada
UPDATE movimientos m
SET plataforma_origen = r.plataforma_origen
FROM reservas r
WHERE m.id_reserva = r.id_reserva::text
  AND m.tipo = 'ingreso'
  AND m.concepto = 'reserva'
  AND m.plataforma_origen IS NULL;

-- 9. DATOS DE PRUEBA (OPCIONAL)
-- ===============================================================================

-- Insertar datos de prueba solo si no existen reservas con plataformas específicas
DO $$
BEGIN
    -- Solo agregar datos de prueba si no hay reservas con plataformas diferentes a 'directa'
    IF NOT EXISTS (
        SELECT 1 FROM reservas 
        WHERE plataforma_origen != 'directa'
        LIMIT 1
    ) THEN
        -- Actualizar algunas reservas existentes con diferentes plataformas para prueba
        UPDATE reservas 
        SET plataforma_origen = 'airbnb' 
        WHERE id_reserva IN (
            SELECT id_reserva FROM reservas 
            ORDER BY created_at DESC 
            LIMIT 2
        );
        
        UPDATE reservas 
        SET plataforma_origen = 'booking' 
        WHERE id_reserva IN (
            SELECT id_reserva FROM reservas 
            WHERE plataforma_origen = 'directa'
            ORDER BY created_at DESC 
            LIMIT 1
        );
        
        RAISE NOTICE 'Datos de prueba de plataformas agregados a reservas existentes';
    ELSE
        RAISE NOTICE 'Ya existen reservas con diferentes plataformas, no se agregaron datos de prueba';
    END IF;
END $$;

-- 10. CONSULTAS DE VERIFICACIÓN
-- ===============================================================================

-- Verificar que las columnas se agregaron correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('reservas', 'movimientos')
  AND column_name = 'plataforma_origen'
ORDER BY table_name, ordinal_position;

-- Verificar que los índices se crearon
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('reservas', 'movimientos')
  AND indexname LIKE '%plataforma%'
ORDER BY tablename, indexname;

-- Verificar que las funciones se crearon
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%plataforma%'
ORDER BY routine_name;

-- Verificar que los triggers se crearon
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_name LIKE '%plataforma%'
ORDER BY event_object_table, trigger_name;

-- Contar reservas por plataforma
SELECT 
    plataforma_origen,
    COUNT(*) as cantidad_reservas
FROM reservas 
GROUP BY plataforma_origen
ORDER BY cantidad_reservas DESC;

-- Contar movimientos por plataforma
SELECT 
    plataforma_origen,
    COUNT(*) as cantidad_movimientos,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos
FROM movimientos 
WHERE plataforma_origen IS NOT NULL
GROUP BY plataforma_origen
ORDER BY total_ingresos DESC;

-- ===============================================================================
-- NOTAS IMPORTANTES
-- ===============================================================================

/*
CAMPOS AGREGADOS:

1. reservas.plataforma_origen:
   - Tipo: VARCHAR(20)
   - Valores: 'airbnb', 'booking', 'pagina_web', 'directa'
   - Por defecto: 'directa'
   - NOT NULL

2. movimientos.plataforma_origen:
   - Tipo: VARCHAR(20)
   - Valores: 'airbnb', 'booking', 'pagina_web', 'directa'
   - Nullable (solo se usa en ingresos de reserva)

VALIDACIONES:
- Solo movimientos de tipo 'ingreso' con concepto 'reserva' pueden tener plataforma_origen
- Valores válidos: 'airbnb', 'booking', 'pagina_web', 'directa'

SINCRONIZACIÓN AUTOMÁTICA:
- Los movimientos de ingreso/reserva heredan automáticamente la plataforma de su reserva asociada
- Si se especifica manualmente una plataforma en el movimiento, esa tiene prioridad

ÍNDICES OPTIMIZADOS:
- Consultas por plataforma
- Filtros combinados fecha + plataforma
- Reportes por empresa + plataforma

RETROCOMPATIBILIDAD:
- Todas las reservas existentes se marcan como 'directa'
- Los movimientos existentes se actualizan con la plataforma de su reserva asociada
*/