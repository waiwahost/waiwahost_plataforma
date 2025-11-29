-- Script para inicializar y corregir los campos de totales en reservas existentes
-- Este script es idempotente y se puede ejecutar múltiples veces

-- Primero, verificar si las columnas existen (en caso de que no estén creadas)
DO $$
BEGIN
  -- Agregar columna total_reserva si no existe
  IF NOT EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'reservas' 
    AND column_name = 'total_reserva'
  ) THEN
    ALTER TABLE reservas ADD COLUMN total_reserva DECIMAL(12, 2) DEFAULT 0;
  END IF;

  -- Agregar columna total_pagado si no existe
  IF NOT EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'reservas' 
    AND column_name = 'total_pagado'
  ) THEN
    ALTER TABLE reservas ADD COLUMN total_pagado DECIMAL(12, 2) DEFAULT 0;
  END IF;

  -- Agregar columna total_pendiente si no existe
  IF NOT EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'reservas' 
    AND column_name = 'total_pendiente'
  ) THEN
    ALTER TABLE reservas ADD COLUMN total_pendiente DECIMAL(12, 2) DEFAULT 0;
  END IF;

  -- Agregar columna updated_at si no existe (para tracking de actualizaciones)
  IF NOT EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'reservas' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE reservas ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
  END IF;
END $$;

-- Inicializar total_reserva con precio_total donde sea NULL o 0
UPDATE reservas 
SET total_reserva = COALESCE(precio_total, 0)
WHERE total_reserva IS NULL OR total_reserva = 0;

-- Calcular y actualizar total_pagado basado en pagos existentes
UPDATE reservas 
SET total_pagado = COALESCE(
  (SELECT SUM(monto) 
   FROM pagos 
   WHERE pagos.id_reserva = reservas.id_reserva), 
  0
);

-- Calcular y actualizar total_pendiente
UPDATE reservas 
SET total_pendiente = GREATEST(
  total_reserva - total_pagado, 
  0
);

-- Actualizar timestamp de actualización
UPDATE reservas 
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- Crear índices para mejorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_reservas_total_pagado ON reservas(total_pagado);
CREATE INDEX IF NOT EXISTS idx_reservas_total_pendiente ON reservas(total_pendiente);
CREATE INDEX IF NOT EXISTS idx_reservas_empresa_totales ON reservas(id_inmueble, total_reserva, total_pagado);

-- Trigger para mantener updated_at actualizado automáticamente
CREATE OR REPLACE FUNCTION update_reservas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS trigger_reservas_updated_at ON reservas;
CREATE TRIGGER trigger_reservas_updated_at
    BEFORE UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION update_reservas_updated_at();

-- Verificación final: mostrar estadísticas de los campos actualizados
SELECT 
  COUNT(*) as total_reservas,
  COUNT(CASE WHEN total_reserva > 0 THEN 1 END) as con_total_reserva,
  COUNT(CASE WHEN total_pagado > 0 THEN 1 END) as con_pagos,
  COUNT(CASE WHEN total_pendiente > 0 THEN 1 END) as con_pendientes,
  SUM(total_reserva) as suma_total_reservas,
  SUM(total_pagado) as suma_total_pagado,
  SUM(total_pendiente) as suma_total_pendiente
FROM reservas;