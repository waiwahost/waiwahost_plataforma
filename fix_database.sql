-- Script para corregir la tabla reservas y agregar columnas faltantes
-- Ejecuta este script en tu base de datos (vía PgAdmin o consola)

-- 1. Agregar columnas básicas faltantes (si no existen)
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS codigo_reserva VARCHAR(50);
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS precio_total NUMERIC(15,2) DEFAULT 0;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS numero_huespedes INTEGER DEFAULT 1;

-- 2. Agregar columnas financieras que faltaban en el diseño original pero usa el código
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS total_reserva NUMERIC(15,2) DEFAULT 0;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS total_pagado NUMERIC(15,2) DEFAULT 0;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS total_pendiente NUMERIC(15,2) DEFAULT 0;

-- 3. Agregar plataforma_origen con validación
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservas' 
        AND column_name = 'plataforma_origen'
    ) THEN
        ALTER TABLE reservas 
        ADD COLUMN plataforma_origen VARCHAR(20) 
        DEFAULT 'directa';
    END IF;
END $$;

-- 4. Actualizar valores nulos para evitar errores
UPDATE reservas SET total_reserva = precio_total WHERE total_reserva IS NULL OR total_reserva = 0;
UPDATE reservas SET total_pendiente = total_reserva - COALESCE(total_pagado, 0) WHERE total_pendiente IS NULL;
UPDATE reservas SET plataforma_origen = 'directa' WHERE plataforma_origen IS NULL;
