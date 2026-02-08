-- Script SQL para agregar datos de prueba para el endpoint de reservas

-- Insertar algunas reservas de prueba con todos los nuevos campos
INSERT INTO reservas (id_inmueble, fecha_inicio, fecha_fin, estado, codigo_reserva, precio_total, observaciones, numero_huespedes) VALUES
(3, '2024-08-15', '2024-08-18', 'confirmada', 'RSV-2024-001', 450000.00, 'Llegada tarde, después de las 18:00', 1),
(4, '2024-09-01', '2024-09-05', 'pendiente', 'RSV-2024-002', 600000.00, 'Cliente VIP, preparar welcome pack', 2),
(3, '2024-09-10', '2024-09-15', 'confirmada', 'RSV-2024-003', 750000.00, 'Aniversario de bodas, decoración especial', 1);

-- Insertar algunos huéspedes de prueba con todos los nuevos campos
INSERT INTO huespedes (nombre, apellido, email, correo, telefono, documento_tipo, documento_numero, fecha_nacimiento, documento_identidad) VALUES
('Ana', 'García', 'maria.garcia@email.com', 'maria.garcia@email.com', '+57 300 123 4567', 'cedula', '12345678', '1985-03-15', '12345678'),
('Juan', 'Pérez', 'juan.perez@email.com', 'juan.perez@email.com', '+57 300 234 5678', 'cedula', '23456789', '1990-07-22', '23456789'),
('Ana', 'López', 'ana.lopez@email.com', 'ana.lopez@email.com', '+57 300 345 6789', 'pasaporte', 'AB34567890', '1988-11-10', 'AB34567890'),
('Carlos', 'Martínez', 'carlos.martinez@email.com', 'carlos.martinez@email.com', '+57 300 456 7890', 'cedula', '45678901', '1992-05-08', '45678901');

-- Relacionar huéspedes con reservas
-- Reserva 1 (María como principal)
INSERT INTO huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES
(1, 1, true);

-- Reserva 2 (Juan como principal, Ana como acompañante)
INSERT INTO huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES
(2, 2, true),
(2, 3, false);

-- Reserva 3 (Carlos como principal)
INSERT INTO huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES
(3, 4, true);


