-- Script para corregir los límites de caracteres en la tabla usuarios

-- 1. Aumentar el límite de apellido a 100 caracteres (antes 20)
ALTER TABLE usuarios ALTER COLUMN apellido TYPE VARCHAR(120);

-- 2. Aumentar el límite de cedula a 50 caracteres (antes 20)
ALTER TABLE usuarios ALTER COLUMN cedula TYPE VARCHAR(40);

-- 3. Aumentar el límite de username a 100 caracteres (antes 20)
ALTER TABLE usuarios ALTER COLUMN username TYPE VARCHAR(150);

-- 4. Comentarios para documentar los cambios
COMMENT ON COLUMN usuarios.apellido IS 'Apellido del usuario (ampliado a 100 chars)';
COMMENT ON COLUMN usuarios.cedula IS 'Documento de identidad (ampliado a 50 chars)';
COMMENT ON COLUMN usuarios.username IS 'Nombre de usuario sistema (ampliado a 100 chars)';

-- Fin del script
