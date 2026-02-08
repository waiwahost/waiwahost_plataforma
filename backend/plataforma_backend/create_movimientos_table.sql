-- ===============================================================================
-- CREACIÓN DE TABLA MOVIMIENTOS Y SCRIPTS DE BASE DE DATOS
-- ===============================================================================

-- 1. CREAR TABLA MOVIMIENTOS
-- ===============================================================================

CREATE TABLE IF NOT EXISTS movimientos (
    id VARCHAR PRIMARY KEY,
    fecha DATE NOT NULL,                                    -- Solo fecha para filtros por día (YYYY-MM-DD)
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    concepto VARCHAR(50) NOT NULL,                          -- Ver conceptos válidos más abajo
    descripcion TEXT NOT NULL,
    monto DECIMAL(15,2) NOT NULL CHECK (monto > 0),
    id_inmueble VARCHAR NOT NULL,                           -- FK a tabla inmuebles
    id_reserva VARCHAR NULL,                                -- FK a tabla reservas (opcional)
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'otro')),
    comprobante VARCHAR(100) NULL,                          -- Número de comprobante o referencia
    id_empresa VARCHAR NOT NULL,                            -- FK a tabla empresas
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Fecha y hora exacta de creación
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREAR ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ===============================================================================

CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha_empresa ON movimientos(fecha, id_empresa);
CREATE INDEX IF NOT EXISTS idx_movimientos_inmueble ON movimientos(id_inmueble);
CREATE INDEX IF NOT EXISTS idx_movimientos_reserva ON movimientos(id_reserva);
CREATE INDEX IF NOT EXISTS idx_movimientos_empresa ON movimientos(id_empresa);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_concepto ON movimientos(concepto);

-- 3. CREAR FUNCIÓN PARA ACTUALIZAR fecha_actualizacion
-- ===============================================================================

CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREAR TRIGGER PARA ACTUALIZAR AUTOMÁTICAMENTE fecha_actualizacion
-- ===============================================================================

DROP TRIGGER IF EXISTS trg_movimientos_update ON movimientos;

CREATE TRIGGER trg_movimientos_update
    BEFORE UPDATE ON movimientos
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

-- 5. AGREGAR FOREIGN KEYS (EJECUTAR DESPUÉS DE CREAR LA TABLA)
-- ===============================================================================

-- NOTA: Estas FK dependen de la estructura existente de las otras tablas
-- Ejecutar solo si las tablas referenciadas existen y tienen las columnas correctas

-- Foreign Key para inmuebles
-- ALTER TABLE movimientos 
-- ADD CONSTRAINT fk_movimientos_inmueble 
-- FOREIGN KEY (id_inmueble) REFERENCES inmuebles(id_inmueble);

-- Foreign Key para reservas
-- ALTER TABLE movimientos 
-- ADD CONSTRAINT fk_movimientos_reserva 
-- FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva);

-- Foreign Key para empresas
-- ALTER TABLE movimientos 
-- ADD CONSTRAINT fk_movimientos_empresa 
-- FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa);

-- 6. CREAR FUNCIÓN PARA VALIDAR CONCEPTOS SEGÚN TIPO
-- ===============================================================================

CREATE OR REPLACE FUNCTION validar_concepto_movimiento()
RETURNS TRIGGER AS $$
BEGIN
    -- Conceptos válidos para ingresos
    IF NEW.tipo = 'ingreso' THEN
        IF NEW.concepto NOT IN ('reserva', 'limpieza', 'deposito_garantia', 'servicios_adicionales', 'multa', 'otro') THEN
            RAISE EXCEPTION 'Concepto "%" no es válido para movimientos de tipo "ingreso"', NEW.concepto;
        END IF;
    END IF;
    
    -- Conceptos válidos para egresos
    IF NEW.tipo = 'egreso' THEN
        IF NEW.concepto NOT IN ('mantenimiento', 'limpieza', 'servicios_publicos', 'suministros', 'comision', 'devolucion', 'impuestos', 'otro') THEN
            RAISE EXCEPTION 'Concepto "%" no es válido para movimientos de tipo "egreso"', NEW.concepto;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CREAR TRIGGER PARA VALIDAR CONCEPTOS
-- ===============================================================================

DROP TRIGGER IF EXISTS trg_validar_concepto ON movimientos;

CREATE TRIGGER trg_validar_concepto
    BEFORE INSERT OR UPDATE ON movimientos
    FOR EACH ROW
    EXECUTE FUNCTION validar_concepto_movimiento();

-- 8. CREAR FUNCIÓN PARA VALIDAR QUE LA FECHA NO SEA FUTURA
-- ===============================================================================

CREATE OR REPLACE FUNCTION validar_fecha_movimiento()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que la fecha no sea futura (más de hoy)
    IF NEW.fecha > CURRENT_DATE THEN
        RAISE EXCEPTION 'La fecha del movimiento no puede ser futura. Fecha: %, Hoy: %', NEW.fecha, CURRENT_DATE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. CREAR TRIGGER PARA VALIDAR FECHAS
-- ===============================================================================

DROP TRIGGER IF EXISTS trg_validar_fecha ON movimientos;

CREATE TRIGGER trg_validar_fecha
    BEFORE INSERT OR UPDATE ON movimientos
    FOR EACH ROW
    EXECUTE FUNCTION validar_fecha_movimiento();

-- ===============================================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ===============================================================================

-- 10. INSERTAR DATOS DE PRUEBA
-- ===============================================================================

-- NOTA: Estos INSERT son opcionales y solo para pruebas
-- Asegúrate de que existan los inmuebles, reservas y empresas referenciados

/*
-- Ejemplos de movimientos de prueba
INSERT INTO movimientos (
    id, fecha, tipo, concepto, descripcion, monto, 
    id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa
) VALUES 
-- Movimientos para el día de hoy
('mov_001', CURRENT_DATE, 'ingreso', 'reserva', 'Pago inicial reserva RSV-001', 200000, '1', '1', 'transferencia', 'TRF-001234', '1'),
('mov_002', CURRENT_DATE, 'egreso', 'limpieza', 'Limpieza post checkout', 50000, '1', NULL, 'efectivo', NULL, '1'),
('mov_003', CURRENT_DATE, 'ingreso', 'deposito_garantia', 'Depósito garantía apartamento', 150000, '1', '1', 'efectivo', 'EFE-001', '1'),

-- Movimientos para ayer
('mov_004', CURRENT_DATE - INTERVAL '1 day', 'ingreso', 'reserva', 'Pago completo reserva RSV-002', 300000, '2', '2', 'transferencia', 'TRF-005678', '1'),
('mov_005', CURRENT_DATE - INTERVAL '1 day', 'egreso', 'mantenimiento', 'Reparación plomería', 80000, '2', NULL, 'transferencia', 'TRF-009999', '1'),

-- Movimientos de hace 2 días
('mov_006', CURRENT_DATE - INTERVAL '2 days', 'ingreso', 'limpieza', 'Cargo adicional por limpieza', 40000, '1', '3', 'tarjeta', 'TAR-001122', '1'),
('mov_007', CURRENT_DATE - INTERVAL '2 days', 'egreso', 'servicios_publicos', 'Factura de servicios públicos', 120000, '1', NULL, 'transferencia', 'TRF-111222', '1');
*/

-- ===============================================================================
-- CONSULTAS DE VERIFICACIÓN
-- ===============================================================================

-- 11. CONSULTAS PARA VERIFICAR LA INSTALACIÓN
-- ===============================================================================

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'movimientos' 
ORDER BY ordinal_position;

-- Verificar que los índices se crearon
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'movimientos';

-- Verificar que los triggers se crearon
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'movimientos';

-- Contar registros (debería ser 0 si no se insertaron datos de prueba)
SELECT COUNT(*) as total_movimientos FROM movimientos;

-- ===============================================================================
-- NOTAS IMPORTANTES
-- ===============================================================================

/*
CONCEPTOS VÁLIDOS POR TIPO:

INGRESOS:
- 'reserva' - Pago de reserva
- 'limpieza' - Cargo por limpieza
- 'deposito_garantia' - Depósito de garantía
- 'servicios_adicionales' - Servicios adicionales
- 'multa' - Multas
- 'otro' - Otros ingresos

EGRESOS:
- 'mantenimiento' - Gastos de mantenimiento
- 'limpieza' - Gastos de limpieza
- 'servicios_publicos' - Servicios públicos (agua, luz, gas, etc.)
- 'suministros' - Suministros y materiales
- 'comision' - Comisiones
- 'devolucion' - Devoluciones
- 'impuestos' - Impuestos
- 'otro' - Otros egresos

CAMPOS IMPORTANTES:
- fecha: DATE - Solo fecha sin hora para filtros por día
- fecha_creacion: TIMESTAMP - Fecha y hora exacta para mostrar orden cronológico
- monto: Siempre positivo, el tipo determina si es ingreso o egreso
- id_reserva: Puede ser NULL para movimientos no relacionados con reservas

PERFORMANCE:
- Los índices están optimizados para las consultas más frecuentes
- El trigger de validación asegura integridad de datos
- Las foreign keys deben agregarse manualmente según la estructura existente
*/