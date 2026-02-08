-- ============================================
-- TEST RÁPIDO PARA VERIFICAR LA CORRECCIÓN
-- ============================================

-- 1. Verificar que existen huéspedes en la BD
SELECT id_huesped, nombre, documento_numero, documento_identidad 
FROM huespedes 
ORDER BY id_huesped 
LIMIT 5;

-- 2. Si no hay huéspedes, crear uno de prueba
INSERT INTO huespedes (
  nombre, 
  apellido, 
  email, 
  correo, 
  telefono, 
  documento_tipo, 
  documento_numero, 
  documento_identidad, 
  fecha_nacimiento
) VALUES (
  'Test', 
  'Usuario', 
  'test@email.com', 
  'test@email.com', 
  '+57 300 000 0000', 
  'cedula', 
  'TEST123456', 
  'TEST123456', 
  '1990-01-01'
) ON CONFLICT DO NOTHING;

-- 3. Verificar el huésped de prueba
SELECT id_huesped, nombre, documento_numero, documento_identidad 
FROM huespedes 
WHERE documento_numero = 'TEST123456' OR documento_identidad = 'TEST123456';
