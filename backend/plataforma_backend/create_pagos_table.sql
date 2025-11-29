-- ========================================================================
-- SCRIPT DE CREACIÓN DE TABLA PAGOS Y MODIFICACIONES RELACIONADAS
-- Sistema de Pagos para Reservas - Plataforma Waiwahost
-- ========================================================================

-- Crear tabla pagos
CREATE TABLE IF NOT EXISTS pagos (
    id                  BIGSERIAL PRIMARY KEY,
    id_reserva          BIGINT NOT NULL,
    monto               DECIMAL(15,2) NOT NULL CHECK (monto > 0),
    fecha_pago          DATE NOT NULL DEFAULT CURRENT_DATE,
    metodo_pago         VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'otro')),
    concepto            VARCHAR(255) NOT NULL DEFAULT 'Pago de reserva',
    descripcion         TEXT NULL,
    comprobante         VARCHAR(255) NULL,
    id_empresa          BIGINT NOT NULL,
    id_usuario_registro BIGINT NULL,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constrainst de validación
    CONSTRAINT chk_pago_monto_positivo CHECK (monto > 0),
    CONSTRAINT chk_pago_metodo_valido CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'otro')),
    CONSTRAINT chk_pago_concepto_no_vacio CHECK (char_length(trim(concepto)) > 0)
);

-- Comentarios en la tabla
COMMENT ON TABLE pagos IS 'Tabla para almacenar los pagos realizados por los huéspedes para sus reservas';
COMMENT ON COLUMN pagos.id IS 'Identificador único del pago';
COMMENT ON COLUMN pagos.id_reserva IS 'ID de la reserva asociada al pago';
COMMENT ON COLUMN pagos.monto IS 'Monto del pago en pesos colombianos';
COMMENT ON COLUMN pagos.fecha_pago IS 'Fecha en que se realizó el pago (importante para reportes diarios)';
COMMENT ON COLUMN pagos.metodo_pago IS 'Método utilizado para el pago';
COMMENT ON COLUMN pagos.concepto IS 'Concepto o descripción corta del pago';
COMMENT ON COLUMN pagos.descripcion IS 'Descripción detallada del pago (opcional)';
COMMENT ON COLUMN pagos.comprobante IS 'Número de comprobante o referencia del pago';
COMMENT ON COLUMN pagos.id_empresa IS 'ID de la empresa a la que pertenece el pago';
COMMENT ON COLUMN pagos.id_usuario_registro IS 'ID del usuario que registró el pago';

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_pagos_reserva ON pagos(id_reserva);
CREATE INDEX IF NOT EXISTS idx_pagos_empresa ON pagos(id_empresa);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_metodo ON pagos(metodo_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_empresa_fecha ON pagos(id_empresa, fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_reserva_fecha ON pagos(id_reserva, fecha_pago);

-- Claves foráneas (ajustar según la estructura actual de las tablas)
-- NOTA: Verificar que estas tablas existan antes de crear las FK
ALTER TABLE pagos 
ADD CONSTRAINT fk_pagos_reserva 
FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva) ON DELETE CASCADE;

-- Si la tabla empresas existe
-- ALTER TABLE pagos 
-- ADD CONSTRAINT fk_pagos_empresa 
-- FOREIGN KEY (id_empresa) REFERENCES empresas(id) ON DELETE CASCADE;

-- Si la tabla users existe
-- ALTER TABLE pagos 
-- ADD CONSTRAINT fk_pagos_usuario 
-- FOREIGN KEY (id_usuario_registro) REFERENCES users(id) ON DELETE SET NULL;

-- ========================================================================
-- MODIFICACIONES A LA TABLA MOVIMIENTOS (OPCIONAL)
-- Para establecer relación entre pagos y movimientos
-- ========================================================================

-- Agregar campo para relacionar movimientos con pagos
ALTER TABLE movimientos 
ADD COLUMN IF NOT EXISTS id_pago BIGINT NULL;

-- Índice para el nuevo campo
CREATE INDEX IF NOT EXISTS idx_movimientos_pago ON movimientos(id_pago);

-- Clave foránea hacia pagos
ALTER TABLE movimientos 
ADD CONSTRAINT fk_movimientos_pago 
FOREIGN KEY (id_pago) REFERENCES pagos(id) ON DELETE SET NULL;

-- Comentario en el nuevo campo
COMMENT ON COLUMN movimientos.id_pago IS 'ID del pago que generó este movimiento (si aplica)';

-- ========================================================================
-- VISTA PARA RESUMEN DE PAGOS POR RESERVA
-- ========================================================================

CREATE OR REPLACE VIEW vista_resumen_pagos_reserva AS
SELECT 
    r.id as id_reserva,
    r.codigo_reserva,
    r.total_reserva,
    COALESCE(SUM(p.monto), 0) as total_pagado,
    (r.total_reserva - COALESCE(SUM(p.monto), 0)) as total_pendiente,
    COUNT(p.id) as cantidad_pagos,
    CASE 
        WHEN COALESCE(SUM(p.monto), 0) = 0 THEN 'sin_pagos'
        WHEN COALESCE(SUM(p.monto), 0) < r.total_reserva THEN 'parcial'
        WHEN COALESCE(SUM(p.monto), 0) = r.total_reserva THEN 'completo'
        ELSE 'excedido'
    END as estado_pago,
    CASE 
        WHEN r.total_reserva > 0 THEN 
            ROUND((COALESCE(SUM(p.monto), 0) / r.total_reserva) * 100, 2)
        ELSE 0 
    END as porcentaje_pagado,
    MAX(p.fecha_pago) as fecha_ultimo_pago,
    -- Subconsulta para obtener datos del último pago
    (SELECT monto FROM pagos WHERE id_reserva = r.id ORDER BY fecha_pago DESC, fecha_creacion DESC LIMIT 1) as monto_ultimo_pago,
    (SELECT metodo_pago FROM pagos WHERE id_reserva = r.id ORDER BY fecha_pago DESC, fecha_creacion DESC LIMIT 1) as metodo_ultimo_pago
FROM reservas r
LEFT JOIN pagos p ON r.id = p.id_reserva
GROUP BY r.id, r.codigo_reserva, r.total_reserva;

-- Comentario en la vista
COMMENT ON VIEW vista_resumen_pagos_reserva IS 'Vista que proporciona un resumen financiero completo de cada reserva';

-- ========================================================================
-- VISTA PARA REPORTES DIARIOS DE PAGOS
-- ========================================================================

CREATE OR REPLACE VIEW vista_pagos_diarios AS
SELECT 
    p.fecha_pago,
    p.id_empresa,
    COUNT(*) as cantidad_pagos,
    SUM(p.monto) as total_ingresos_pagos,
    AVG(p.monto) as promedio_pago,
    -- Desglose por método de pago
    COUNT(CASE WHEN p.metodo_pago = 'efectivo' THEN 1 END) as pagos_efectivo,
    SUM(CASE WHEN p.metodo_pago = 'efectivo' THEN p.monto ELSE 0 END) as total_efectivo,
    COUNT(CASE WHEN p.metodo_pago = 'transferencia' THEN 1 END) as pagos_transferencia,
    SUM(CASE WHEN p.metodo_pago = 'transferencia' THEN p.monto ELSE 0 END) as total_transferencia,
    COUNT(CASE WHEN p.metodo_pago = 'tarjeta' THEN 1 END) as pagos_tarjeta,
    SUM(CASE WHEN p.metodo_pago = 'tarjeta' THEN p.monto ELSE 0 END) as total_tarjeta,
    COUNT(CASE WHEN p.metodo_pago = 'otro' THEN 1 END) as pagos_otro,
    SUM(CASE WHEN p.metodo_pago = 'otro' THEN p.monto ELSE 0 END) as total_otro
FROM pagos p
GROUP BY p.fecha_pago, p.id_empresa
ORDER BY p.fecha_pago DESC, p.id_empresa;

-- Comentario en la vista
COMMENT ON VIEW vista_pagos_diarios IS 'Vista para generar reportes diarios de pagos con desglose por método de pago';

-- ========================================================================
-- FUNCIÓN PARA TRIGGER DE ACTUALIZACIÓN AUTOMÁTICA
-- ========================================================================

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para la tabla pagos
CREATE TRIGGER trigger_pagos_fecha_actualizacion
    BEFORE UPDATE ON pagos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- ========================================================================
-- DATOS DE PRUEBA (OPCIONAL - REMOVER EN PRODUCCIÓN)
-- ========================================================================

-- Insertar datos de prueba solo si no existen pagos
-- IMPORTANTE: Ajustar los IDs según los datos reales de tu sistema

-- INSERT INTO pagos (id_reserva, monto, fecha_pago, metodo_pago, concepto, descripcion, comprobante, id_empresa)
-- SELECT 1, 200000, '2024-01-15', 'transferencia', 'Abono inicial', 'Primer pago de la reserva', 'TRF-001', 1
-- WHERE NOT EXISTS (SELECT 1 FROM pagos WHERE id_reserva = 1 AND monto = 200000);

-- INSERT INTO pagos (id_reserva, monto, fecha_pago, metodo_pago, concepto, descripcion, comprobante, id_empresa)
-- SELECT 1, 150000, '2024-01-20', 'efectivo', 'Segundo abono', 'Segundo pago de la reserva', 'EFE-001', 1
-- WHERE NOT EXISTS (SELECT 1 FROM pagos WHERE id_reserva = 1 AND monto = 150000);

-- INSERT INTO pagos (id_reserva, monto, fecha_pago, metodo_pago, concepto, descripcion, comprobante, id_empresa)
-- SELECT 2, 300000, '2024-01-16', 'tarjeta', 'Pago completo', 'Pago total de la reserva', 'TC-001', 1
-- WHERE NOT EXISTS (SELECT 1 FROM pagos WHERE id_reserva = 2 AND monto = 300000);

-- ========================================================================
-- CONSULTAS ÚTILES PARA VERIFICAR LA IMPLEMENTACIÓN
-- ========================================================================

-- Verificar la estructura de la tabla
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'pagos'
-- ORDER BY ordinal_position;

-- Verificar índices creados
-- SELECT indexname, indexdef
-- FROM pg_indexes 
-- WHERE tablename = 'pagos';

-- Verificar constraints
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'pagos';

-- Probar la vista de resumen
-- SELECT * FROM vista_resumen_pagos_reserva LIMIT 5;

-- Probar la vista de reportes diarios
-- SELECT * FROM vista_pagos_diarios WHERE fecha_pago >= CURRENT_DATE - INTERVAL '7 days';

-- ========================================================================
-- PERMISOS (AJUSTAR SEGÚN TU CONFIGURACIÓN)
-- ========================================================================

-- Otorgar permisos a los usuarios de la aplicación
-- GRANT SELECT, INSERT, UPDATE, DELETE ON pagos TO app_user;
-- GRANT USAGE, SELECT ON SEQUENCE pagos_id_seq TO app_user;
-- GRANT SELECT ON vista_resumen_pagos_reserva TO app_user;
-- GRANT SELECT ON vista_pagos_diarios TO app_user;

-- ========================================================================
-- NOTAS IMPORTANTES
-- ========================================================================

/*
1. Verificar que las tablas referenciadas (reservas, empresas, users) existan antes de ejecutar las FK.

2. Ajustar los tipos de datos según tu esquema actual (por ejemplo, si usas UUID en lugar de BIGINT).

3. Los datos de prueba están comentados - descomentarlos solo para testing.

4. Las vistas creadas facilitan las consultas complejas desde la aplicación.

5. El trigger automático mantiene actualizada la fecha_actualizacion.

6. Los índices están optimizados para las consultas más comunes del sistema de pagos.

7. Considerar agregar auditoría adicional si es necesario para el negocio.

8. Verificar los permisos de base de datos según tu configuración de seguridad.
*/