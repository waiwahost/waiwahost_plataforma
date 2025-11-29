-- ===============================================================================
-- SCRIPT DE CORRECCIÓN PARA TRIGGER DE SINCRONIZACIÓN DE PLATAFORMA
-- ===============================================================================
-- Este script corrige el error en el trigger de sincronización de plataforma
-- que se produce cuando id_reserva es una cadena vacía.
-- ===============================================================================

-- 1. ELIMINAR EL TRIGGER PROBLEMÁTICO
-- ===============================================================================

DROP TRIGGER IF EXISTS trg_sincronizar_plataforma ON movimientos;
DROP FUNCTION IF EXISTS sincronizar_plataforma_reserva_movimiento();

-- 2. CREAR FUNCIÓN CORREGIDA PARA SINCRONIZACIÓN
-- ===============================================================================

-- Crear función mejorada para copiar plataforma_origen de reserva a movimiento
CREATE OR REPLACE FUNCTION sincronizar_plataforma_reserva_movimiento()
RETURNS TRIGGER AS $$
DECLARE
    reserva_plataforma VARCHAR(20);
    reserva_id_int INTEGER;
BEGIN
    -- Solo aplicar si es un movimiento de ingreso con concepto reserva y tiene id_reserva válido
    IF NEW.tipo = 'ingreso' AND NEW.concepto = 'reserva' AND NEW.id_reserva IS NOT NULL THEN
        
        -- Validar que id_reserva no sea una cadena vacía y sea convertible a integer
        IF NEW.id_reserva != '' AND NEW.id_reserva ~ '^[0-9]+$' THEN
            BEGIN
                -- Intentar convertir a integer de forma segura
                reserva_id_int := NEW.id_reserva::integer;
                
                -- Obtener plataforma_origen de la reserva
                SELECT plataforma_origen INTO reserva_plataforma 
                FROM reservas 
                WHERE id_reserva = reserva_id_int;
                
                -- Si se encuentra la reserva y no se especificó plataforma, usar la de la reserva
                IF reserva_plataforma IS NOT NULL AND NEW.plataforma_origen IS NULL THEN
                    NEW.plataforma_origen = reserva_plataforma;
                END IF;
                
            EXCEPTION 
                WHEN invalid_text_representation THEN
                    -- Si no se puede convertir a integer, no hacer nada
                    RAISE NOTICE 'id_reserva no es un número válido: %', NEW.id_reserva;
                WHEN OTHERS THEN
                    -- Cualquier otro error, no hacer nada para no bloquear la inserción
                    RAISE NOTICE 'Error al sincronizar plataforma: %', SQLERRM;
            END;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. RECREAR EL TRIGGER CON LA FUNCIÓN CORREGIDA
-- ===============================================================================

-- Crear trigger para sincronización automática (se ejecuta antes del trigger de validación)
CREATE TRIGGER trg_sincronizar_plataforma
    BEFORE INSERT OR UPDATE ON movimientos
    FOR EACH ROW
    EXECUTE FUNCTION sincronizar_plataforma_reserva_movimiento();

-- 4. VERIFICACIÓN
-- ===============================================================================

-- Verificar que el trigger se creó correctamente
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'trg_sincronizar_plataforma';

-- 5. NOTA IMPORTANTE
-- ===============================================================================

/*
CAMBIOS REALIZADOS:

1. VALIDACIÓN MEJORADA:
   - Verifica que id_reserva no sea cadena vacía
   - Verifica que id_reserva contenga solo números con regex '^[0-9]+$'
   - Usa bloque BEGIN/EXCEPTION para manejo seguro de errores

2. MANEJO DE ERRORES:
   - Captura específicamente invalid_text_representation
   - Captura cualquier otro error sin bloquear la inserción
   - Emite notices informativos en lugar de errores fatales

3. COMPORTAMIENTO:
   - Si id_reserva no es válido, simplemente no sincroniza la plataforma
   - La inserción del movimiento continúa normalmente
   - El trigger no falla la transacción

ESTE SCRIPT CORRIGE EL ERROR:
"invalid input syntax for type integer" que se produce cuando
id_reserva es una cadena vacía o contiene caracteres no numéricos.
*/