-- Script para verificar y aplicar la relación entre pagos y movimientos
-- Este script se asegura de que el campo id_pago existe en la tabla movimientos

-- 1. Verificar si el campo id_pago existe en la tabla movimientos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'movimientos' 
  AND column_name = 'id_pago';

-- 2. Si no existe, crear el campo (ejecutar solo si la consulta anterior no devuelve resultados)
ALTER TABLE movimientos 
ADD COLUMN IF NOT EXISTS id_pago BIGINT NULL;

-- 3. Crear índice para optimizar consultas por id_pago
CREATE INDEX IF NOT EXISTS idx_movimientos_pago ON movimientos(id_pago);

-- 4. Agregar la clave foránea si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_movimientos_pago' 
        AND table_name = 'movimientos'
    ) THEN
        ALTER TABLE movimientos 
        ADD CONSTRAINT fk_movimientos_pago 
        FOREIGN KEY (id_pago) REFERENCES pagos(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Agregar comentario al campo
COMMENT ON COLUMN movimientos.id_pago IS 'ID del pago que generó este movimiento (si aplica)';

-- 6. Verificar la estructura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'movimientos' 
ORDER BY ordinal_position;

-- 7. Verificar que la clave foránea se creó correctamente
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'movimientos'
    AND kcu.column_name = 'id_pago';

-- 8. Consulta de prueba para ver movimientos con y sin asociación a pagos
SELECT 
    'Con id_pago' as tipo,
    COUNT(*) as cantidad
FROM movimientos 
WHERE id_pago IS NOT NULL

UNION ALL

SELECT 
    'Sin id_pago' as tipo,
    COUNT(*) as cantidad
FROM movimientos 
WHERE id_pago IS NULL;

-- 9. Mostrar algunos ejemplos de movimientos relacionados con pagos
SELECT 
    m.id as movimiento_id,
    m.fecha,
    m.tipo,
    m.concepto,
    m.monto as movimiento_monto,
    m.id_pago,
    p.id as pago_id,
    p.monto as pago_monto,
    p.id_reserva,
    CASE 
        WHEN m.id_pago IS NOT NULL AND p.id IS NOT NULL THEN 'Correctamente asociado'
        WHEN m.id_pago IS NOT NULL AND p.id IS NULL THEN 'Asociación rota (pago eliminado)'
        ELSE 'Sin asociación'
    END as estado_asociacion
FROM movimientos m
LEFT JOIN pagos p ON m.id_pago = p.id
WHERE m.tipo = 'ingreso'
ORDER BY m.fecha_creacion DESC
LIMIT 20;