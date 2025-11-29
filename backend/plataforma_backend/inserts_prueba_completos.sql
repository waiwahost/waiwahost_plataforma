-- ============================================
-- INSERTS DE PRUEBA COMPLETOS PARA RESERVAS
-- ============================================
-- Ejecutar estos comandos después de aplicar los ALTER TABLE

-- Limpiar datos anteriores (opcional)
-- DELETE FROM huespedes_reservas;
-- DELETE FROM reservas WHERE id_reserva IN (1,2,3);
-- DELETE FROM huespedes WHERE id_huesped IN (1,2,3,4,5);

-- ============================================
-- INSERT 1: RESERVA FAMILIAR CONFIRMADA
-- ============================================

-- Insertar reserva familiar para 3 noches
INSERT INTO reservas (id_inmueble, fecha_inicio, fecha_fin, estado, codigo_reserva, precio_total, observaciones, numero_huespedes) VALUES
(3, '2024-08-15', '2024-08-18', 'confirmada', 'RSV-2024-001', 450000.00, 'Llegada tarde después de las 18:00. Cliente solicita camas adicionales.', 2);

-- Insertar huéspedes para la reserva 1
INSERT INTO huespedes (nombre, apellido, email, correo, telefono, documento_tipo, documento_numero, fecha_nacimiento, documento_identidad) VALUES
('María', 'García Rodríguez', 'maria.garcia@email.com', 'maria.garcia@email.com', '+57 300 123 4567', 'cedula', '12345678', '1985-03-15', '12345678'),
('Pedro', 'García López', 'pedro.garcia@email.com', 'pedro.garcia@email.com', '+57 300 123 4568', 'cedula', '12345679', '1983-07-20', '12345679');

-- Relacionar huéspedes con la reserva 1
INSERT INTO huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES
(1, 1, true),   -- María como principal
(1, 2, false);  -- Pedro como acompañante

-- ============================================
-- INSERT 2: RESERVA DE NEGOCIOS PENDIENTE
-- ============================================

-- Insertar reserva de negocios para 4 noches
INSERT INTO reservas (id_inmueble, fecha_inicio, fecha_fin, estado, codigo_reserva, precio_total, observaciones, numero_huespedes) VALUES
(4, '2024-09-01', '2024-09-05', 'pendiente', 'RSV-2024-002', 600000.00, 'Cliente corporativo VIP. Requiere facturación empresarial. Check-in temprano solicitado.', 1);

-- Insertar huésped ejecutivo
INSERT INTO huespedes (nombre, apellido, email, correo, telefono, documento_tipo, documento_numero, fecha_nacimiento, documento_identidad) VALUES
('Juan Carlos', 'Pérez Martínez', 'jc.perez@empresa.com', 'jc.perez@empresa.com', '+57 300 234 5678', 'cedula', '23456789', '1990-07-22', '23456789');

-- Relacionar huésped con la reserva 2
INSERT INTO huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES
(2, 3, true);   -- Juan Carlos como principal

-- ============================================
-- INSERT 3: RESERVA ROMÁNTICA CONFIRMADA
-- ============================================

-- Insertar reserva romántica para 5 noches
INSERT INTO reservas (id_inmueble, fecha_inicio, fecha_fin, estado, codigo_reserva, precio_total, observaciones, numero_huespedes) VALUES
(3, '2024-09-10', '2024-09-15', 'confirmada', 'RSV-2024-003', 750000.00, 'Aniversario de bodas - 10 años. Decoración romántica solicitada. Botella de champagne incluida.', 2);

-- Insertar pareja para aniversario
INSERT INTO huespedes (nombre, apellido, email, correo, telefono, documento_tipo, documento_numero, fecha_nacimiento, documento_identidad) VALUES
('Ana Sofía', 'López Hernández', 'ana.lopez@email.com', 'ana.lopez@email.com', '+57 300 345 6789', 'pasaporte', 'AB34567890', '1988-11-10', 'AB34567890'),
('Carlos Eduardo', 'Martínez Silva', 'carlos.martinez@email.com', 'carlos.martinez@email.com', '+57 300 456 7890', 'cedula', '45678901', '1992-05-08', '45678901');

-- Relacionar pareja con la reserva 3
INSERT INTO huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES
(3, 4, true),   -- Ana Sofía como principal
(3, 5, false);  -- Carlos Eduardo como acompañante

-- ============================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================

-- Consultar reservas insertadas
SELECT 
    r.id_reserva, 
    r.codigo_reserva, 
    r.estado, 
    r.precio_total, 
    r.numero_huespedes,
    i.nombre as inmueble
FROM reservas r 
JOIN inmuebles i ON r.id_inmueble = i.id_inmueble 
WHERE r.id_reserva IN (1,2,3);

-- Consultar huéspedes insertados
SELECT 
    h.id_huesped,
    h.nombre,
    h.apellido,
    h.email,
    h.documento_tipo,
    hr.id_reserva,
    hr.es_principal
FROM huespedes h 
JOIN huespedes_reservas hr ON h.id_huesped = hr.id_huesped
WHERE hr.id_reserva IN (1,2,3)
ORDER BY hr.id_reserva, hr.es_principal DESC;
