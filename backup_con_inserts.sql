--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: actualizar_fecha_actualizacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_fecha_actualizacion() OWNER TO postgres;

--
-- Name: calculate_total_pendiente(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_total_pendiente() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.total_pendiente = NEW.total_reserva - NEW.total_pagado;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.calculate_total_pendiente() OWNER TO postgres;

--
-- Name: sincronizar_plataforma_reserva_movimiento(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sincronizar_plataforma_reserva_movimiento() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
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
$_$;


ALTER FUNCTION public.sincronizar_plataforma_reserva_movimiento() OWNER TO postgres;

--
-- Name: update_fecha_actualizacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_fecha_actualizacion() OWNER TO postgres;

--
-- Name: update_reservas_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_reservas_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_reservas_updated_at() OWNER TO postgres;

--
-- Name: validar_concepto_movimiento(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validar_concepto_movimiento() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.validar_concepto_movimiento() OWNER TO postgres;

--
-- Name: validar_fecha_movimiento(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validar_fecha_movimiento() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Validar que la fecha no sea futura (más de hoy)
    IF NEW.fecha > CURRENT_DATE THEN
        RAISE EXCEPTION 'La fecha del movimiento no puede ser futura. Fecha: %, Hoy: %', NEW.fecha, CURRENT_DATE;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validar_fecha_movimiento() OWNER TO postgres;

--
-- Name: validar_plataforma_movimiento(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validar_plataforma_movimiento() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Solo permitir plataforma_origen en movimientos de tipo 'ingreso' con concepto 'reserva'
    IF NEW.plataforma_origen IS NOT NULL THEN
        IF NEW.tipo != 'ingreso' OR NEW.concepto != 'reserva' THEN
            RAISE EXCEPTION 'La plataforma de origen solo es válida para movimientos de tipo "ingreso" con concepto "reserva"';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validar_plataforma_movimiento() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: administradores_inmuebles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administradores_inmuebles (
    id_usuario integer NOT NULL,
    id_inmueble integer NOT NULL
);


ALTER TABLE public.administradores_inmuebles OWNER TO postgres;

--
-- Name: egresos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.egresos (
    id_egreso integer NOT NULL,
    id_inmueble integer,
    monto numeric,
    descripcion text,
    categoria character varying,
    fecha date NOT NULL
);


ALTER TABLE public.egresos OWNER TO postgres;

--
-- Name: egresos_id_egreso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.egresos_id_egreso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.egresos_id_egreso_seq OWNER TO postgres;

--
-- Name: egresos_id_egreso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.egresos_id_egreso_seq OWNED BY public.egresos.id_egreso;


--
-- Name: empresas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresas (
    id_empresa integer NOT NULL,
    nombre character varying NOT NULL,
    plan_actual character varying,
    fecha_inicio timestamp without time zone DEFAULT now(),
    fecha_fin timestamp without time zone,
    estado character varying DEFAULT 'activa'::character varying
);


ALTER TABLE public.empresas OWNER TO postgres;

--
-- Name: empresas_id_empresa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empresas_id_empresa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.empresas_id_empresa_seq OWNER TO postgres;

--
-- Name: empresas_id_empresa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empresas_id_empresa_seq OWNED BY public.empresas.id_empresa;


--
-- Name: huespedes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.huespedes (
    id_huesped integer NOT NULL,
    nombre character varying,
    documento_identidad character varying,
    telefono character varying,
    correo character varying,
    apellido character varying(100),
    email character varying(255),
    fecha_nacimiento date,
    documento_tipo character varying(50),
    documento_numero character varying(50)
);


ALTER TABLE public.huespedes OWNER TO postgres;

--
-- Name: huespedes_id_huesped_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.huespedes_id_huesped_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.huespedes_id_huesped_seq OWNER TO postgres;

--
-- Name: huespedes_id_huesped_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.huespedes_id_huesped_seq OWNED BY public.huespedes.id_huesped;


--
-- Name: huespedes_reservas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.huespedes_reservas (
    id_reserva integer NOT NULL,
    id_huesped integer NOT NULL,
    es_principal boolean DEFAULT false
);


ALTER TABLE public.huespedes_reservas OWNER TO postgres;

--
-- Name: ingresos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingresos (
    id_ingreso integer NOT NULL,
    id_inmueble integer,
    id_reserva integer,
    monto numeric,
    descripcion text,
    fecha date NOT NULL
);


ALTER TABLE public.ingresos OWNER TO postgres;

--
-- Name: ingresos_id_ingreso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingresos_id_ingreso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ingresos_id_ingreso_seq OWNER TO postgres;

--
-- Name: ingresos_id_ingreso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingresos_id_ingreso_seq OWNED BY public.ingresos.id_ingreso;


--
-- Name: inmuebles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inmuebles (
    id_inmueble integer NOT NULL,
    nombre character varying,
    descripcion text,
    direccion text,
    capacidad integer,
    id_propietario integer,
    id_empresa integer,
    estado character varying DEFAULT 'activo'::character varying,
    edificio character varying(100),
    apartamento character varying(10),
    id_prod_sigo character varying(10),
    comision character varying(10),
    precio_limpieza character varying(10),
    capacidad_maxima integer,
    nro_habitaciones integer,
    nro_bahnos integer,
    cocina boolean
);


ALTER TABLE public.inmuebles OWNER TO postgres;

--
-- Name: inmuebles_id_inmueble_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inmuebles_id_inmueble_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inmuebles_id_inmueble_seq OWNER TO postgres;

--
-- Name: inmuebles_id_inmueble_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inmuebles_id_inmueble_seq OWNED BY public.inmuebles.id_inmueble;


--
-- Name: movimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos (
    id character varying NOT NULL,
    fecha date NOT NULL,
    tipo character varying(10) NOT NULL,
    concepto character varying(50) NOT NULL,
    descripcion text NOT NULL,
    monto numeric(15,2) NOT NULL,
    id_inmueble character varying NOT NULL,
    id_reserva character varying,
    metodo_pago character varying(20) NOT NULL,
    comprobante character varying(100),
    id_empresa character varying NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    plataforma_origen character varying(20) DEFAULT 'directa'::character varying,
    id_pago bigint,
    fecha_reporte date,
    CONSTRAINT movimientos_metodo_pago_check CHECK (((metodo_pago)::text = ANY ((ARRAY['efectivo'::character varying, 'transferencia'::character varying, 'tarjeta'::character varying, 'otro'::character varying])::text[]))),
    CONSTRAINT movimientos_monto_check CHECK ((monto > (0)::numeric)),
    CONSTRAINT movimientos_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['ingreso'::character varying, 'egreso'::character varying])::text[])))
);


ALTER TABLE public.movimientos OWNER TO postgres;

--
-- Name: COLUMN movimientos.id_pago; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.movimientos.id_pago IS 'ID del pago que generó este movimiento (si aplica)';


--
-- Name: COLUMN movimientos.fecha_reporte; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.movimientos.fecha_reporte IS 'Fecha de reporte del movimiento, distinta a la fecha de creación o transacción';


--
-- Name: pagos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos (
    id bigint NOT NULL,
    id_reserva bigint NOT NULL,
    monto numeric(15,2) NOT NULL,
    fecha_pago date DEFAULT CURRENT_DATE NOT NULL,
    metodo_pago character varying(20) NOT NULL,
    concepto character varying(255) DEFAULT 'Pago de reserva'::character varying NOT NULL,
    descripcion text,
    comprobante character varying(255),
    id_empresa bigint NOT NULL,
    id_usuario_registro bigint,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_reporte date,
    CONSTRAINT chk_pago_concepto_no_vacio CHECK ((char_length(TRIM(BOTH FROM concepto)) > 0)),
    CONSTRAINT chk_pago_metodo_valido CHECK (((metodo_pago)::text = ANY ((ARRAY['efectivo'::character varying, 'transferencia'::character varying, 'tarjeta'::character varying, 'otro'::character varying])::text[]))),
    CONSTRAINT chk_pago_monto_positivo CHECK ((monto > (0)::numeric)),
    CONSTRAINT pagos_metodo_pago_check CHECK (((metodo_pago)::text = ANY ((ARRAY['efectivo'::character varying, 'transferencia'::character varying, 'tarjeta'::character varying, 'otro'::character varying])::text[]))),
    CONSTRAINT pagos_monto_check CHECK ((monto > (0)::numeric))
);


ALTER TABLE public.pagos OWNER TO postgres;

--
-- Name: TABLE pagos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pagos IS 'Tabla para almacenar los pagos realizados por los huéspedes para sus reservas';


--
-- Name: COLUMN pagos.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.id IS 'Identificador único del pago';


--
-- Name: COLUMN pagos.id_reserva; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.id_reserva IS 'ID de la reserva asociada al pago';


--
-- Name: COLUMN pagos.monto; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.monto IS 'Monto del pago en pesos colombianos';


--
-- Name: COLUMN pagos.fecha_pago; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.fecha_pago IS 'Fecha en que se realizó el pago (importante para reportes diarios)';


--
-- Name: COLUMN pagos.metodo_pago; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.metodo_pago IS 'Método utilizado para el pago';


--
-- Name: COLUMN pagos.concepto; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.concepto IS 'Concepto o descripción corta del pago';


--
-- Name: COLUMN pagos.descripcion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.descripcion IS 'Descripción detallada del pago (opcional)';


--
-- Name: COLUMN pagos.comprobante; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.comprobante IS 'Número de comprobante o referencia del pago';


--
-- Name: COLUMN pagos.id_empresa; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.id_empresa IS 'ID de la empresa a la que pertenece el pago';


--
-- Name: COLUMN pagos.id_usuario_registro; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.id_usuario_registro IS 'ID del usuario que registró el pago';


--
-- Name: COLUMN pagos.fecha_reporte; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.fecha_reporte IS 'Fecha de reporte del pago, distinta a la fecha de creación o transacción';


--
-- Name: pagos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pagos_id_seq OWNER TO postgres;

--
-- Name: pagos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagos_id_seq OWNED BY public.pagos.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id_permission integer NOT NULL,
    key character varying NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_permission_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_permission_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_permission_seq OWNER TO postgres;

--
-- Name: permissions_id_permission_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_permission_seq OWNED BY public.permissions.id_permission;


--
-- Name: propietarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.propietarios (
    id_propietario integer NOT NULL,
    id_usuario integer,
    telefono character varying,
    direccion text
);


ALTER TABLE public.propietarios OWNER TO postgres;

--
-- Name: propietarios_id_propietario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.propietarios_id_propietario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.propietarios_id_propietario_seq OWNER TO postgres;

--
-- Name: propietarios_id_propietario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.propietarios_id_propietario_seq OWNED BY public.propietarios.id_propietario;


--
-- Name: reservas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas (
    id_reserva integer NOT NULL,
    id_inmueble integer,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    estado character varying,
    created_at timestamp without time zone DEFAULT now(),
    codigo_reserva character varying(20),
    precio_total numeric(10,2),
    observaciones text,
    numero_huespedes integer,
    total_reserva numeric(12,2) DEFAULT 0.00 NOT NULL,
    total_pagado numeric(12,2) DEFAULT 0.00 NOT NULL,
    total_pendiente numeric(12,2) DEFAULT 0.00 NOT NULL,
    plataforma_origen character varying(20) DEFAULT 'directa'::character varying,
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT check_total_pagado_not_greater_than_total CHECK ((total_pagado <= total_reserva)),
    CONSTRAINT check_total_pagado_positive CHECK ((total_pagado >= (0)::numeric)),
    CONSTRAINT check_total_reserva_positive CHECK ((total_reserva >= (0)::numeric))
);


ALTER TABLE public.reservas OWNER TO postgres;

--
-- Name: COLUMN reservas.total_reserva; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reservas.total_reserva IS 'Monto total de la reserva';


--
-- Name: COLUMN reservas.total_pagado; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reservas.total_pagado IS 'Monto total pagado/abonado por el huésped';


--
-- Name: COLUMN reservas.total_pendiente; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reservas.total_pendiente IS 'Monto pendiente por pagar (total_reserva - total_pagado)';


--
-- Name: reservas_id_reserva_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservas_id_reserva_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reservas_id_reserva_seq OWNER TO postgres;

--
-- Name: reservas_id_reserva_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservas_id_reserva_seq OWNED BY public.reservas.id_reserva;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_rol_seq OWNER TO postgres;

--
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;


--
-- Name: roles_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles_permissions (
    id_rol integer NOT NULL,
    id_permission integer NOT NULL
);


ALTER TABLE public.roles_permissions OWNER TO postgres;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nombre character varying NOT NULL,
    email character varying NOT NULL,
    password_hash text NOT NULL,
    id_roles integer,
    id_empresa integer,
    creado_en timestamp without time zone DEFAULT now(),
    estado_activo boolean DEFAULT true,
    cedula character varying(20),
    apellido character varying(20),
    username character varying(20)
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: vista_pagos_diarios; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_pagos_diarios AS
 SELECT p.fecha_pago,
    p.id_empresa,
    count(*) AS cantidad_pagos,
    sum(p.monto) AS total_ingresos_pagos,
    avg(p.monto) AS promedio_pago,
    count(
        CASE
            WHEN ((p.metodo_pago)::text = 'efectivo'::text) THEN 1
            ELSE NULL::integer
        END) AS pagos_efectivo,
    sum(
        CASE
            WHEN ((p.metodo_pago)::text = 'efectivo'::text) THEN p.monto
            ELSE (0)::numeric
        END) AS total_efectivo,
    count(
        CASE
            WHEN ((p.metodo_pago)::text = 'transferencia'::text) THEN 1
            ELSE NULL::integer
        END) AS pagos_transferencia,
    sum(
        CASE
            WHEN ((p.metodo_pago)::text = 'transferencia'::text) THEN p.monto
            ELSE (0)::numeric
        END) AS total_transferencia,
    count(
        CASE
            WHEN ((p.metodo_pago)::text = 'tarjeta'::text) THEN 1
            ELSE NULL::integer
        END) AS pagos_tarjeta,
    sum(
        CASE
            WHEN ((p.metodo_pago)::text = 'tarjeta'::text) THEN p.monto
            ELSE (0)::numeric
        END) AS total_tarjeta,
    count(
        CASE
            WHEN ((p.metodo_pago)::text = 'otro'::text) THEN 1
            ELSE NULL::integer
        END) AS pagos_otro,
    sum(
        CASE
            WHEN ((p.metodo_pago)::text = 'otro'::text) THEN p.monto
            ELSE (0)::numeric
        END) AS total_otro
   FROM public.pagos p
  GROUP BY p.fecha_pago, p.id_empresa
  ORDER BY p.fecha_pago DESC, p.id_empresa;


ALTER TABLE public.vista_pagos_diarios OWNER TO postgres;

--
-- Name: VIEW vista_pagos_diarios; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vista_pagos_diarios IS 'Vista para generar reportes diarios de pagos con desglose por método de pago';


--
-- Name: vista_resumen_pagos_reserva; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_resumen_pagos_reserva AS
 SELECT r.id_reserva,
    r.codigo_reserva,
    r.total_reserva,
    COALESCE(sum(p.monto), (0)::numeric) AS total_pagado,
    (r.total_reserva - COALESCE(sum(p.monto), (0)::numeric)) AS total_pendiente,
    count(p.id) AS cantidad_pagos,
        CASE
            WHEN (COALESCE(sum(p.monto), (0)::numeric) = (0)::numeric) THEN 'sin_pagos'::text
            WHEN (COALESCE(sum(p.monto), (0)::numeric) < r.total_reserva) THEN 'parcial'::text
            WHEN (COALESCE(sum(p.monto), (0)::numeric) = r.total_reserva) THEN 'completo'::text
            ELSE 'excedido'::text
        END AS estado_pago,
        CASE
            WHEN (r.total_reserva > (0)::numeric) THEN round(((COALESCE(sum(p.monto), (0)::numeric) / r.total_reserva) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS porcentaje_pagado,
    max(p.fecha_pago) AS fecha_ultimo_pago,
    ( SELECT pagos.monto
           FROM public.pagos
          WHERE (pagos.id_reserva = r.id_reserva)
          ORDER BY pagos.fecha_pago DESC, pagos.fecha_creacion DESC
         LIMIT 1) AS monto_ultimo_pago,
    ( SELECT pagos.metodo_pago
           FROM public.pagos
          WHERE (pagos.id_reserva = r.id_reserva)
          ORDER BY pagos.fecha_pago DESC, pagos.fecha_creacion DESC
         LIMIT 1) AS metodo_ultimo_pago
   FROM (public.reservas r
     LEFT JOIN public.pagos p ON ((r.id_reserva = p.id_reserva)))
  GROUP BY r.id_reserva, r.codigo_reserva, r.total_reserva;


ALTER TABLE public.vista_resumen_pagos_reserva OWNER TO postgres;

--
-- Name: VIEW vista_resumen_pagos_reserva; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vista_resumen_pagos_reserva IS 'Vista que proporciona un resumen financiero completo de cada reserva';


--
-- Name: egresos id_egreso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.egresos ALTER COLUMN id_egreso SET DEFAULT nextval('public.egresos_id_egreso_seq'::regclass);


--
-- Name: empresas id_empresa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresas ALTER COLUMN id_empresa SET DEFAULT nextval('public.empresas_id_empresa_seq'::regclass);


--
-- Name: huespedes id_huesped; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.huespedes ALTER COLUMN id_huesped SET DEFAULT nextval('public.huespedes_id_huesped_seq'::regclass);


--
-- Name: ingresos id_ingreso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingresos ALTER COLUMN id_ingreso SET DEFAULT nextval('public.ingresos_id_ingreso_seq'::regclass);


--
-- Name: inmuebles id_inmueble; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inmuebles ALTER COLUMN id_inmueble SET DEFAULT nextval('public.inmuebles_id_inmueble_seq'::regclass);


--
-- Name: pagos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos ALTER COLUMN id SET DEFAULT nextval('public.pagos_id_seq'::regclass);


--
-- Name: permissions id_permission; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id_permission SET DEFAULT nextval('public.permissions_id_permission_seq'::regclass);


--
-- Name: propietarios id_propietario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propietarios ALTER COLUMN id_propietario SET DEFAULT nextval('public.propietarios_id_propietario_seq'::regclass);


--
-- Name: reservas id_reserva; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas ALTER COLUMN id_reserva SET DEFAULT nextval('public.reservas_id_reserva_seq'::regclass);


--
-- Name: roles id_rol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: administradores_inmuebles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.administradores_inmuebles (id_usuario, id_inmueble) VALUES (1, 1);
INSERT INTO public.administradores_inmuebles (id_usuario, id_inmueble) VALUES (1, 2);


--
-- Data for Name: egresos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: empresas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.empresas (id_empresa, nombre, plan_actual, fecha_inicio, fecha_fin, estado) VALUES (1, 'Empresa Prueba', 'Full', '2025-08-01 00:00:00', NULL, 'activa');
INSERT INTO public.empresas (id_empresa, nombre, plan_actual, fecha_inicio, fecha_fin, estado) VALUES (2, 'Prueba empresa 2', 'Full', '2025-11-17 16:18:20.87884', NULL, 'activa');


--
-- Data for Name: huespedes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (2, 'Juan', '23456789', '+57 300 234 5678', 'juan.perez@email.com', 'Pérez', 'juan.perez@email.com', '1990-07-22', 'cedula', '23456789');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (3, 'Ana', 'AB34567890', '+57 300 345 6789', 'ana.lopez@email.com', 'López', 'ana.lopez@email.com', '1988-11-10', 'pasaporte', 'AB34567890');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (4, 'Carlos', '45678901', '+57 300 456 7890', 'carlos.martinez@email.com', 'Martínez', 'carlos.martinez@email.com', '1992-05-08', 'cedula', '45678901');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (1, 'Fernanda', '12345678', '+57 300 123 4567', 'maria.garcia@email.com', 'García', 'maria.garcia@email.com', '1985-03-15', 'cedula', '12345678');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (5, 'Andres', 'pendiente', '3158452452', 'andres@gmail.com', 'Gamboa', 'andres@gmail.com', '1990-01-01', 'pendiente', 'pendiente');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (6, 'Andres', '12349857', '3112223333', 'andresg@gmail.com', 'Prueba', 'andresg@gmail.com', '2000-01-04', 'cedula', '12349857');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (7, 'German', '1098765431', '3223334444', 'german@gmail.com', 'Acompañante', 'german@gmail.com', '2002-06-04', 'cedula', '1098765431');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (8, 'Prueba', '1012214532', '31555444111', 'email@mail.com', 'Reservacion', 'email@mail.com', '1998-02-10', 'cedula', '1012214532');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (9, 'Prueba', '145214552', '3154785477', 'mail@mial.com', 'Acompañante', 'mail@mial.com', '2000-06-22', 'cedula', '145214552');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (10, 'Karen', NULL, '3154254125', 'karen@mail.com', 'Pruebaexterna', 'karen@mail.com', '1997-05-04', NULL, NULL);
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (11, 'Huespedprueba', '123456678', '3133333334', 'prueba11@gmail.com', 'Prueba', 'prueba11@gmail.com', '1998-02-03', 'cedula', '123456678');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (12, 'Huespedenuevo', '12343456', '3134235262', 'prueba22@gmail.com', 'Prueba', 'prueba22@gmail.com', '1996-02-15', 'cedula', '12343456');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (13, 'Nuevohuesped', '41526354232', '31524251425', 'erman@mail.com', 'Prueba', 'erman@mail.com', '1999-02-02', 'cedula', '41526354232');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (14, 'Otrohuesped', '152436254', '31545254125', 'prueba@mail.com', 'Pruebas', 'prueba@mail.com', '2002-02-05', 'cedula', '152436254');
INSERT INTO public.huespedes (id_huesped, nombre, documento_identidad, telefono, correo, apellido, email, fecha_nacimiento, documento_tipo, documento_numero) VALUES (15, 'Javier', '142536541', '318525514445', 'javier@mail.com', 'Pruebanueva', 'javier@mail.com', '2001-05-06', 'cedula', '142536541');


--
-- Data for Name: huespedes_reservas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (1, 1, true);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (2, 2, true);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (2, 3, false);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (3, 4, true);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (4, 5, true);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (5, 6, true);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (5, 7, false);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (6, 8, true);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (6, 9, false);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (7, 10, true);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (8, 11, true);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (9, 12, true);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (10, 13, true);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (11, 14, true);
INSERT INTO public.huespedes_reservas (id_reserva, id_huesped, es_principal) VALUES (12, 15, true);


--
-- Data for Name: ingresos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: inmuebles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.inmuebles (id_inmueble, nombre, descripcion, direccion, capacidad, id_propietario, id_empresa, estado, edificio, apartamento, id_prod_sigo, comision, precio_limpieza, capacidad_maxima, nro_habitaciones, nro_bahnos, cocina) VALUES (2, 'Casa Luis', NULL, 'Carrera 5 #456', NULL, 2, NULL, 'activo', 'Edificio Prueba', '201', '101010', '10%', '50000', 4, 2, 2, true);
INSERT INTO public.inmuebles (id_inmueble, nombre, descripcion, direccion, capacidad, id_propietario, id_empresa, estado, edificio, apartamento, id_prod_sigo, comision, precio_limpieza, capacidad_maxima, nro_habitaciones, nro_bahnos, cocina) VALUES (1, 'Apartamento Ana', NULL, 'Calle 1 #123', NULL, 1, NULL, 'inactivo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.inmuebles (id_inmueble, nombre, descripcion, direccion, capacidad, id_propietario, id_empresa, estado, edificio, apartamento, id_prod_sigo, comision, precio_limpieza, capacidad_maxima, nro_habitaciones, nro_bahnos, cocina) VALUES (4, 'Cedros U', 'Descripcion del inmueble', 'Calle 10 # 20 50', 4, 2, 1, 'activo', 'Cedros', '201', '201-1', '100000', '20000', 4, 2, 1, true);
INSERT INTO public.inmuebles (id_inmueble, nombre, descripcion, direccion, capacidad, id_propietario, id_empresa, estado, edificio, apartamento, id_prod_sigo, comision, precio_limpieza, capacidad_maxima, nro_habitaciones, nro_bahnos, cocina) VALUES (3, 'Apartamento prueba', 'Apartamento nuevo', 'Carrera 23 1111', 4, 1, 2, 'activo', 'Torre Central1', '301', '12345', '10', '20000', 4, 2, 1, true);


--
-- Data for Name: movimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_hoy_002', '2025-10-20', 'egreso', 'limpieza', 'Limpieza profunda post checkout anterior', 50000.00, '1', NULL, 'efectivo', NULL, '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_hoy_003', '2025-10-20', 'ingreso', 'deposito_garantia', 'Depósito de garantía apartamento centro', 150000.00, '1', '1', 'efectivo', 'EFE-001', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_hoy_005', '2025-10-20', 'egreso', 'suministros', 'Compra de productos de limpieza y amenities', 45000.00, '2', NULL, 'tarjeta', 'TAR-998877', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_hoy_006', '2025-10-20', 'ingreso', 'servicios_adicionales', 'Cargo por late checkout solicitado por huésped', 25000.00, '3', '3', 'efectivo', NULL, '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_ayer_001', '2025-10-19', 'ingreso', 'reserva', 'Segundo abono reserva RSV-2025-004', 100000.00, '1', '4', 'transferencia', 'TRF-112233', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_ayer_002', '2025-10-19', 'egreso', 'mantenimiento', 'Reparación de plomería - fuga en baño principal', 80000.00, '1', NULL, 'transferencia', 'TRF-998866', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_ayer_003', '2025-10-19', 'ingreso', 'multa', 'Multa por daños menores en inmueble', 30000.00, '1', '4', 'efectivo', NULL, '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_ayer_004', '2025-10-19', 'egreso', 'servicios_publicos', 'Factura de servicios públicos - Electricidad', 120000.00, '2', NULL, 'transferencia', 'TRF-555444', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_ayer_005', '2025-10-19', 'ingreso', 'limpieza', 'Cargo adicional por limpieza profunda solicitada', 40000.00, '2', '5', 'tarjeta', 'TAR-667788', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_2dias_001', '2025-10-18', 'ingreso', 'reserva', 'Pago completo reserva de fin de semana RSV-2025-006', 280000.00, '1', '6', 'transferencia', 'TRF-789012', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_2dias_002', '2025-10-18', 'egreso', 'comision', 'Comisión plataforma de reservas online', 35000.00, '1', '6', 'transferencia', 'TRF-COM-001', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_2dias_003', '2025-10-18', 'ingreso', 'deposito_garantia', 'Depósito garantía casa familiar', 200000.00, '3', '7', 'transferencia', 'TRF-334455', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_2dias_004', '2025-10-18', 'egreso', 'limpieza', 'Servicio de limpieza profesional', 60000.00, '3', NULL, 'efectivo', 'EFE-LIMP-001', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_3dias_001', '2025-10-17', 'egreso', 'impuestos', 'Pago impuesto predial apartamento centro', 150000.00, '1', NULL, 'transferencia', 'TRF-IMP-001', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_3dias_002', '2025-10-17', 'ingreso', 'otro', 'Reembolso de seguro por daños previos', 75000.00, '2', NULL, 'transferencia', 'TRF-SEG-001', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_3dias_003', '2025-10-17', 'egreso', 'mantenimiento', 'Mantenimiento preventivo aires acondicionados', 90000.00, '2', NULL, 'transferencia', 'TRF-MAN-002', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_test_001', '2025-10-16', 'ingreso', 'reserva', 'Reserva pagada con tarjeta de crédito', 350000.00, '1', '8', 'tarjeta', 'TAR-123456', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_test_002', '2025-10-16', 'egreso', 'devolucion', 'Devolución por cancelación anticipada', 100000.00, '1', '8', 'transferencia', 'TRF-DEV-001', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_test_003', '2025-10-15', 'egreso', 'suministros', 'Compra de electrodomésticos para cocina', 180000.00, '2', NULL, 'transferencia', 'TRF-SUM-001', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_test_004', '2025-10-15', 'ingreso', 'otro', 'Ingreso por alquiler de parking adicional', 50000.00, '2', NULL, 'efectivo', NULL, '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_test_005', '2025-10-14', 'egreso', 'servicios_publicos', 'Factura internet y cable', 85000.00, '3', NULL, 'transferencia', 'TRF-INT-001', '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_test_006', '2025-10-14', 'ingreso', 'servicios_adicionales', 'Servicio de transporte al aeropuerto', 45000.00, '3', '9', 'efectivo', NULL, '1', '2025-10-20 02:23:30.536176', '2025-10-20 02:23:30.536176', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('d782b207-42b4-4203-8590-c7e4bbfda3b9', '2025-10-20', 'ingreso', 'reserva', 'Reserva', 300000.00, '3', '', 'efectivo', '', '1', '2025-10-20 02:44:39.903393', '2025-10-20 02:44:39.903393', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('1da0ea84-f70d-4001-b256-024fc2752971', '2025-10-20', 'ingreso', 'reserva', 'Reserva', 300000.00, '3', '', 'efectivo', '', '1', '2025-10-20 03:05:48.270133', '2025-10-20 03:05:48.270133', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('7b3bbb3f-54fe-4af8-a27e-7454db033071', '2025-10-19', 'ingreso', 'reserva', 'Reserva', 300000.00, '3', '', 'efectivo', '', '1', '2025-10-20 03:19:36.947733', '2025-10-20 03:19:36.947733', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('36cdf981-c264-4bcb-8245-ab16ff3fd8e2', '2025-10-19', 'ingreso', 'reserva', 'Reserva', 300000.00, '3', '', 'efectivo', '', '1', '2025-10-20 03:22:58.699106', '2025-10-20 03:22:58.699106', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('53697427-b73a-4c68-90a1-97b0e0c8e38f', '2025-10-19', 'egreso', 'limpieza', 'Limpieza', 50000.00, '3', '', 'efectivo', '', '1', '2025-10-20 03:23:36.513932', '2025-10-20 03:23:36.513932', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('6bd4087f-dec0-4424-8373-79793fadaf70', '2025-10-20', 'ingreso', 'reserva', 'Otro ingreso', 20000.00, '3', '', 'efectivo', '', '1', '2025-10-20 03:25:03.86115', '2025-10-20 03:25:03.86115', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_hoy_001', '2025-10-20', 'ingreso', 'reserva', 'Pago inicial reserva RSV-2025-001 - Check-in apartamento centro', 200000.00, '1', '1', 'transferencia', 'TRF-001234', '1', '2025-10-20 02:23:30.536176', '2025-10-20 21:38:47.556934', 'airbnb', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('mov_hoy_004', '2025-10-20', 'ingreso', 'reserva', 'Pago completo reserva familiar RSV-2025-002', 300000.00, '2', '2', 'transferencia', 'TRF-005678', '1', '2025-10-20 02:23:30.536176', '2025-10-20 21:38:47.556934', 'airbnb', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('1731309c-15fd-4244-9c8a-eeb3c7fa3ce3', '2025-11-08', 'ingreso', 'reserva', 'Pago de reserva RSV-2025-008 - Pago de reserva', 111000.00, '1', '8', 'efectivo', NULL, '1', '2025-11-08 16:16:11.366674', '2025-11-08 16:16:11.366674', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('41e5ba7e-5b2a-4298-bc0a-408753b79743', '2025-11-09', 'ingreso', 'reserva', 'Pago de reserva RSV-2025-009 - Pago de reserva', 140000.00, '1', '9', 'efectivo', NULL, '1', '2025-11-09 19:28:31.332556', '2025-11-09 19:28:31.332556', 'airbnb', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('dc32bbbf-8332-4336-a8ae-bf359a24fb48', '2025-11-09', 'ingreso', 'reserva', 'Pago de reserva RSV-2025-008 - Pago de reserva', 100000.00, '1', '8', 'efectivo', NULL, '1', '2025-11-09 19:52:31.583679', '2025-11-09 19:52:31.583679', 'directa', NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('e0691784-020c-4b2c-9e2f-a827725ee805', '2025-11-25', 'ingreso', 'reserva', 'Pago de reserva RSV-2025-008 - Pago de reserva', 500000.00, '4', '8', 'efectivo', NULL, '0', '2025-11-25 18:34:21.587669', '2025-11-25 18:34:21.587669', 'directa', 57, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('a1ae0f9d-3ccf-4d07-a8c6-4eedb41678fa', '2025-11-29', 'ingreso', 'reserva', 'Pago de reserva RSV-2025-011 - Pago de reserva', 200000.00, '4', '11', 'efectivo', NULL, '0', '2025-11-29 15:24:42.282135', '2025-11-29 15:24:42.282135', 'directa', 58, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('76211c1f-cc3f-44fd-a418-1a1364951005', '2025-11-29', 'egreso', 'mantenimiento', 'Mentenimiento', 10000.00, '4', NULL, 'efectivo', '', '1', '2025-11-29 15:38:49.283494', '2025-11-29 15:38:49.283494', NULL, NULL, NULL);
INSERT INTO public.movimientos (id, fecha, tipo, concepto, descripcion, monto, id_inmueble, id_reserva, metodo_pago, comprobante, id_empresa, fecha_creacion, fecha_actualizacion, plataforma_origen, id_pago, fecha_reporte) VALUES ('0b7fe795-b6e2-4d5f-ac0e-8f8a64d15a04', '2025-11-29', 'ingreso', 'reserva', 'Pago de reserva RSV-2025-006 - Pago de reserva', 500000.00, '3', '6', 'efectivo', NULL, '0', '2025-11-29 16:05:30.157955', '2025-11-29 16:05:30.157955', 'airbnb', 59, NULL);


--
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pagos (id, id_reserva, monto, fecha_pago, metodo_pago, concepto, descripcion, comprobante, id_empresa, id_usuario_registro, fecha_creacion, fecha_actualizacion, fecha_reporte) VALUES (41, 2, 300000.00, '2025-10-14', 'tarjeta', 'Pago completo', 'Pago total de la reserva - DATO DE PRUEBA', 'TC-001-20251014', 1, 1, '2025-10-21 01:45:44.840137', '2025-10-21 01:45:44.840137', NULL);
INSERT INTO public.pagos (id, id_reserva, monto, fecha_pago, metodo_pago, concepto, descripcion, comprobante, id_empresa, id_usuario_registro, fecha_creacion, fecha_actualizacion, fecha_reporte) VALUES (42, 3, 100000.00, '2025-10-18', 'transferencia', 'Primer abono', 'Abono inicial parcial - DATO DE PRUEBA', 'TRF-002-20251018', 1, 1, '2025-10-21 01:45:44.840137', '2025-10-21 01:45:44.840137', NULL);
INSERT INTO public.pagos (id, id_reserva, monto, fecha_pago, metodo_pago, concepto, descripcion, comprobante, id_empresa, id_usuario_registro, fecha_creacion, fecha_actualizacion, fecha_reporte) VALUES (51, 8, 222000.00, '2025-11-10', 'efectivo', 'Pago de reserva', '', '', 1, NULL, '2025-11-10 03:32:07.757637', '2025-11-10 03:32:07.757637', NULL);
INSERT INTO public.pagos (id, id_reserva, monto, fecha_pago, metodo_pago, concepto, descripcion, comprobante, id_empresa, id_usuario_registro, fecha_creacion, fecha_actualizacion, fecha_reporte) VALUES (57, 8, 500000.00, '2025-11-25', 'efectivo', 'Pago de reserva', '', '', 0, NULL, '2025-11-25 18:34:21.530912', '2025-11-25 18:34:21.530912', NULL);
INSERT INTO public.pagos (id, id_reserva, monto, fecha_pago, metodo_pago, concepto, descripcion, comprobante, id_empresa, id_usuario_registro, fecha_creacion, fecha_actualizacion, fecha_reporte) VALUES (58, 11, 200000.00, '2025-11-29', 'efectivo', 'Pago de reserva', '', '', 0, NULL, '2025-11-29 15:24:42.246845', '2025-11-29 15:24:42.246845', NULL);
INSERT INTO public.pagos (id, id_reserva, monto, fecha_pago, metodo_pago, concepto, descripcion, comprobante, id_empresa, id_usuario_registro, fecha_creacion, fecha_actualizacion, fecha_reporte) VALUES (59, 6, 500000.00, '2025-11-29', 'efectivo', 'Pago de reserva', '', '', 0, NULL, '2025-11-29 16:05:30.141359', '2025-11-29 16:05:30.141359', NULL);


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.permissions (id_permission, key, description) VALUES (1, 'ver_dashboard', 'Ver panel principal');
INSERT INTO public.permissions (id_permission, key, description) VALUES (2, 'ver_inmuebles', 'Ver lista de inmuebles');
INSERT INTO public.permissions (id_permission, key, description) VALUES (3, 'crear_inmueble', 'Crear un nuevo inmueble');
INSERT INTO public.permissions (id_permission, key, description) VALUES (4, 'editar_inmueble', 'Editar inmuebles');
INSERT INTO public.permissions (id_permission, key, description) VALUES (5, 'eliminar_inmueble', 'Eliminar inmuebles');
INSERT INTO public.permissions (id_permission, key, description) VALUES (6, 'ver_reservas', 'Ver reservas');
INSERT INTO public.permissions (id_permission, key, description) VALUES (7, 'crear_reserva', 'Crear nueva reserva');
INSERT INTO public.permissions (id_permission, key, description) VALUES (8, 'editar_reserva', 'Editar reservas');
INSERT INTO public.permissions (id_permission, key, description) VALUES (9, 'eliminar_reserva', 'Eliminar reservas');
INSERT INTO public.permissions (id_permission, key, description) VALUES (10, 'ver_reportes', 'Ver reportes financieros');
INSERT INTO public.permissions (id_permission, key, description) VALUES (11, 'ver_usuarios', 'Ver y gestionar usuarios');
INSERT INTO public.permissions (id_permission, key, description) VALUES (12, 'ver_caja', 'Ver caja e ingresos/egresos');
INSERT INTO public.permissions (id_permission, key, description) VALUES (13, 'ver_propietarios', 'Ver información de propietarios');
INSERT INTO public.permissions (id_permission, key, description) VALUES (14, 'crear_usuario', 'Crear usuario');
INSERT INTO public.permissions (id_permission, key, description) VALUES (15, 'eliminar_usuario', 'Eliminar usuario');
INSERT INTO public.permissions (id_permission, key, description) VALUES (16, 'crear_usuarios', 'Crear usuario');
INSERT INTO public.permissions (id_permission, key, description) VALUES (17, 'eliminar_usuarios', 'Eliminar usuario');
INSERT INTO public.permissions (id_permission, key, description) VALUES (18, 'ver_disponibilidad', 'Ver disponibilidad');
INSERT INTO public.permissions (id_permission, key, description) VALUES (19, 'ver_huespedes', 'Ver huespedes');
INSERT INTO public.permissions (id_permission, key, description) VALUES (20, 'ver_ingresos', 'Ver ingresos');
INSERT INTO public.permissions (id_permission, key, description) VALUES (21, 'ver_egresos', 'Ver egresos');


--
-- Data for Name: propietarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.propietarios (id_propietario, id_usuario, telefono, direccion) VALUES (2, 3, '3001230002', NULL);
INSERT INTO public.propietarios (id_propietario, id_usuario, telefono, direccion) VALUES (3, 5, '17173417483', 'South 3rd Street
Unit 214');
INSERT INTO public.propietarios (id_propietario, id_usuario, telefono, direccion) VALUES (1, 2, '3001230001', 'Sin dirección');
INSERT INTO public.propietarios (id_propietario, id_usuario, telefono, direccion) VALUES (4, 7, '3125454544', 'Carrera nueva');


--
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.reservas (id_reserva, id_inmueble, fecha_inicio, fecha_fin, estado, created_at, codigo_reserva, precio_total, observaciones, numero_huespedes, total_reserva, total_pagado, total_pendiente, plataforma_origen, updated_at) VALUES (9, 3, '2025-10-21', '2025-10-24', 'pendiente', '2025-10-20 20:48:59.131637', 'RSV-2025-009', 2400000.00, '', 1, 2400000.00, 0.00, 2400000.00, 'airbnb', '2025-11-10 03:41:45.087098');
INSERT INTO public.reservas (id_reserva, id_inmueble, fecha_inicio, fecha_fin, estado, created_at, codigo_reserva, precio_total, observaciones, numero_huespedes, total_reserva, total_pagado, total_pendiente, plataforma_origen, updated_at) VALUES (1, 3, '2024-08-15', '2024-08-18', 'confirmada', '2025-09-07 20:42:15.285373', 'RSV-2024-001', 450000.00, 'Llegada tarde, después de las 18:00', 1, 450000.00, 0.00, 450000.00, 'directa', '2025-11-09 19:27:53.928618');
INSERT INTO public.reservas (id_reserva, id_inmueble, fecha_inicio, fecha_fin, estado, created_at, codigo_reserva, precio_total, observaciones, numero_huespedes, total_reserva, total_pagado, total_pendiente, plataforma_origen, updated_at) VALUES (2, 4, '2024-09-01', '2024-09-05', 'pendiente', '2025-09-07 20:42:15.285373', 'RSV-2024-002', 600000.00, 'Cliente VIP, preparar welcome pack', 2, 600000.00, 300000.00, 300000.00, 'directa', '2025-11-09 19:27:53.928618');
INSERT INTO public.reservas (id_reserva, id_inmueble, fecha_inicio, fecha_fin, estado, created_at, codigo_reserva, precio_total, observaciones, numero_huespedes, total_reserva, total_pagado, total_pendiente, plataforma_origen, updated_at) VALUES (3, 3, '2024-09-10', '2024-09-15', 'confirmada', '2025-09-07 20:42:15.285373', 'RSV-2024-003', 750000.00, 'Aniversario de bodas, decoración especial', 1, 750000.00, 100000.00, 650000.00, 'directa', '2025-11-09 19:27:53.928618');
INSERT INTO public.reservas (id_reserva, id_inmueble, fecha_inicio, fecha_fin, estado, created_at, codigo_reserva, precio_total, observaciones, numero_huespedes, total_reserva, total_pagado, total_pendiente, plataforma_origen, updated_at) VALUES (4, 4, '2025-09-08', '2025-09-09', 'pendiente', '2025-09-07 22:35:03.566242', 'RSV-2025-004', 100000.00, '', 2, 100000.00, 0.00, 100000.00, 'directa', '2025-11-09 19:27:53.928618');
INSERT INTO public.reservas (id_reserva, id_inmueble, fecha_inicio, fecha_fin, estado, created_at, codigo_reserva, precio_total, observaciones, numero_huespedes, total_reserva, total_pagado, total_pendiente, plataforma_origen, updated_at) VALUES (7, 1, '2025-09-22', '2025-09-25', 'pendiente', '2025-09-16 16:26:27.759199', 'RSV-2025-007', 500.00, 'Reserva desde formulario externo', 1, 500.00, 0.00, 500.00, 'airbnb', '2025-11-09 19:27:53.928618');
INSERT INTO public.reservas (id_reserva, id_inmueble, fecha_inicio, fecha_fin, estado, created_at, codigo_reserva, precio_total, observaciones, numero_huespedes, total_reserva, total_pagado, total_pendiente, plataforma_origen, updated_at) VALUES (5, 3, '2025-09-09', '2025-09-12', 'anulado', '2025-09-08 00:05:30.670254', 'RSV-2025-005', 500000.00, '', 2, 500000.00, 0.00, 500000.00, 'booking', '2025-11-09 19:27:53.928618');
INSERT INTO public.reservas (id_reserva, id_inmueble, fecha_inicio, fecha_fin, estado, created_at, codigo_reserva, precio_total, observaciones, numero_huespedes, total_reserva, total_pagado, total_pendiente, plataforma_origen, updated_at) VALUES (10, 2, '2025-12-02', '2025-12-06', 'pendiente', '2025-11-22 14:36:13.377529', 'RSV-2025-010', 400000.00, 'Sin observaciones', 1, 400000.00, 0.00, 400000.00, 'directa', '2025-11-25 18:32:07.747997');
INSERT INTO public.reservas (id_reserva, id_inmueble, fecha_inicio, fecha_fin, estado, created_at, codigo_reserva, precio_total, observaciones, numero_huespedes, total_reserva, total_pagado, total_pendiente, plataforma_origen, updated_at) VALUES (8, 4, '2025-10-21', '2025-10-23', 'pendiente', '2025-10-20 20:46:48.961116', 'RSV-2025-008', 2300000.00, '', 1, 2300000.00, 722000.00, 1578000.00, 'directa', '2025-11-25 18:34:21.568387');
INSERT INTO public.reservas (id_reserva, id_inmueble, fecha_inicio, fecha_fin, estado, created_at, codigo_reserva, precio_total, observaciones, numero_huespedes, total_reserva, total_pagado, total_pendiente, plataforma_origen, updated_at) VALUES (12, 2, '2025-12-08', '2025-12-12', 'pendiente', '2025-11-28 21:11:01.071897', 'RSV-2025-012', 400000.00, 'Sin observaciones', 1, 300000.00, 100000.00, 200000.00, 'directa', '2025-11-28 21:11:46.761399');
INSERT INTO public.reservas (id_reserva, id_inmueble, fecha_inicio, fecha_fin, estado, created_at, codigo_reserva, precio_total, observaciones, numero_huespedes, total_reserva, total_pagado, total_pendiente, plataforma_origen, updated_at) VALUES (11, 4, '2025-11-24', '2025-11-28', 'pendiente', '2025-11-22 15:43:58.544658', 'RSV-2025-011', 245000.00, 'Sin observaciones', 1, 245000.00, 200000.00, 45000.00, 'directa', '2025-11-29 16:02:54.864537');
INSERT INTO public.reservas (id_reserva, id_inmueble, fecha_inicio, fecha_fin, estado, created_at, codigo_reserva, precio_total, observaciones, numero_huespedes, total_reserva, total_pagado, total_pendiente, plataforma_origen, updated_at) VALUES (6, 3, '2025-11-17', '2025-11-21', 'pendiente', '2025-09-16 14:36:28.498348', 'RSV-2025-006', 1300000.00, 'Sin observaciones', 2, 1300000.00, 500000.00, 800000.00, 'airbnb', '2025-11-29 16:05:30.151586');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles (id_rol, name) VALUES (1, 'superadmin');
INSERT INTO public.roles (id_rol, name) VALUES (2, 'empresa');
INSERT INTO public.roles (id_rol, name) VALUES (3, 'administrador');
INSERT INTO public.roles (id_rol, name) VALUES (4, 'propietario');


--
-- Data for Name: roles_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 1);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 2);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 3);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 4);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 5);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 6);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 7);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 8);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 9);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 10);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 11);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 12);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 13);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (3, 1);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (3, 2);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (3, 3);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (3, 4);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (3, 6);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (3, 7);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (3, 8);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (3, 10);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (3, 12);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (3, 13);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (4, 1);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (4, 2);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (4, 6);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (4, 10);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 14);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 15);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 16);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 17);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 18);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 19);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 20);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (1, 21);
INSERT INTO public.roles_permissions (id_rol, id_permission) VALUES (3, 19);


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuarios (id_usuario, nombre, email, password_hash, id_roles, id_empresa, creado_en, estado_activo, cedula, apellido, username) VALUES (3, 'Luis Dueño', 'luis@prop.com', 'hashed_pw_3', 4, NULL, '2025-08-05 14:14:06.222101', true, NULL, NULL, NULL);
INSERT INTO public.usuarios (id_usuario, nombre, email, password_hash, id_roles, id_empresa, creado_en, estado_activo, cedula, apellido, username) VALUES (4, 'superadmin', 'admin@mail.com', '$2b$10$z4o35Dr7OUiRhC0mieR9xumVZ7n7/SVgSKe2Njuvw95fd71dwhrPG', 1, NULL, '2025-08-05 18:16:32.24604', true, NULL, NULL, NULL);
INSERT INTO public.usuarios (id_usuario, nombre, email, password_hash, id_roles, id_empresa, creado_en, estado_activo, cedula, apellido, username) VALUES (5, 'Andres', 'andres.gamboa.9504@gmail.com', '$2b$10$m8wsW6D38W2qxFD1HzmgNeexVBGzpxPjhoXf198i9g5sE2L1vNUJq', 4, 1, '2025-08-09 23:28:44.263333', true, '1234567890', 'Pruebas', 'andres.gamboa.9504');
INSERT INTO public.usuarios (id_usuario, nombre, email, password_hash, id_roles, id_empresa, creado_en, estado_activo, cedula, apellido, username) VALUES (2, 'Ana Propietaria', 'ana@prop.com', 'hashed_pw_2', 4, 1, '2025-08-05 14:14:06.222101', true, NULL, 'Apellido', NULL);
INSERT INTO public.usuarios (id_usuario, nombre, email, password_hash, id_roles, id_empresa, creado_en, estado_activo, cedula, apellido, username) VALUES (1, 'Carlos Torres', 'carlos@admin.com', '$2b$10$at2Jgi4XS6wD2MHuOtvWR.JWJh6sIb2d9xv10BmqeoOwKqepEASgW', 3, 1, '2025-08-05 14:13:05.27867', true, NULL, NULL, NULL);
INSERT INTO public.usuarios (id_usuario, nombre, email, password_hash, id_roles, id_empresa, creado_en, estado_activo, cedula, apellido, username) VALUES (7, 'Nueva Prueba', 'nuevaprueba@mail.com', '$2b$10$m8wsW6D38W2qxFD1HzmgNeexVBGzpxPjhoXf198i9g5sE2L1vNUJq', 4, 2, '2025-11-17 16:23:50.384806', true, '415263554', 'Noviembre', 'nuevaprueba123');


--
-- Name: egresos_id_egreso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.egresos_id_egreso_seq', 1, false);


--
-- Name: empresas_id_empresa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empresas_id_empresa_seq', 2, true);


--
-- Name: huespedes_id_huesped_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.huespedes_id_huesped_seq', 15, true);


--
-- Name: ingresos_id_ingreso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingresos_id_ingreso_seq', 1, false);


--
-- Name: inmuebles_id_inmueble_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inmuebles_id_inmueble_seq', 4, true);


--
-- Name: pagos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagos_id_seq', 59, true);


--
-- Name: permissions_id_permission_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_permission_seq', 52, true);


--
-- Name: propietarios_id_propietario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.propietarios_id_propietario_seq', 4, true);


--
-- Name: reservas_id_reserva_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservas_id_reserva_seq', 12, true);


--
-- Name: roles_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_rol_seq', 4, true);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 7, true);


--
-- Name: administradores_inmuebles administradores_inmuebles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores_inmuebles
    ADD CONSTRAINT administradores_inmuebles_pkey PRIMARY KEY (id_usuario, id_inmueble);


--
-- Name: egresos egresos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.egresos
    ADD CONSTRAINT egresos_pkey PRIMARY KEY (id_egreso);


--
-- Name: empresas empresas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_pkey PRIMARY KEY (id_empresa);


--
-- Name: huespedes huespedes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.huespedes
    ADD CONSTRAINT huespedes_pkey PRIMARY KEY (id_huesped);


--
-- Name: huespedes_reservas huespedes_reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.huespedes_reservas
    ADD CONSTRAINT huespedes_reservas_pkey PRIMARY KEY (id_reserva, id_huesped);


--
-- Name: ingresos ingresos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingresos
    ADD CONSTRAINT ingresos_pkey PRIMARY KEY (id_ingreso);


--
-- Name: inmuebles inmuebles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inmuebles
    ADD CONSTRAINT inmuebles_pkey PRIMARY KEY (id_inmueble);


--
-- Name: movimientos movimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT movimientos_pkey PRIMARY KEY (id);


--
-- Name: pagos pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_key_key UNIQUE (key);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id_permission);


--
-- Name: propietarios propietarios_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propietarios
    ADD CONSTRAINT propietarios_id_usuario_key UNIQUE (id_usuario);


--
-- Name: propietarios propietarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propietarios
    ADD CONSTRAINT propietarios_pkey PRIMARY KEY (id_propietario);


--
-- Name: reservas reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_pkey PRIMARY KEY (id_reserva);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles_permissions roles_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_permissions
    ADD CONSTRAINT roles_permissions_pkey PRIMARY KEY (id_rol, id_permission);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- Name: idx_movimientos_concepto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_concepto ON public.movimientos USING btree (concepto);


--
-- Name: idx_movimientos_empresa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_empresa ON public.movimientos USING btree (id_empresa);


--
-- Name: idx_movimientos_empresa_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_empresa_fecha ON public.movimientos USING btree (id_empresa, fecha);


--
-- Name: idx_movimientos_empresa_plataforma; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_empresa_plataforma ON public.movimientos USING btree (id_empresa, plataforma_origen);


--
-- Name: idx_movimientos_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_fecha ON public.movimientos USING btree (fecha);


--
-- Name: idx_movimientos_fecha_empresa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_fecha_empresa ON public.movimientos USING btree (fecha, id_empresa);


--
-- Name: idx_movimientos_fecha_plataforma; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_fecha_plataforma ON public.movimientos USING btree (fecha, plataforma_origen);


--
-- Name: idx_movimientos_fecha_reporte; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_fecha_reporte ON public.movimientos USING btree (fecha_reporte);


--
-- Name: idx_movimientos_fecha_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_fecha_tipo ON public.movimientos USING btree (fecha, tipo);


--
-- Name: idx_movimientos_inmueble; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_inmueble ON public.movimientos USING btree (id_inmueble);


--
-- Name: idx_movimientos_inmueble_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_inmueble_fecha ON public.movimientos USING btree (id_inmueble, fecha);


--
-- Name: idx_movimientos_pago; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_pago ON public.movimientos USING btree (id_pago);


--
-- Name: idx_movimientos_plataforma_origen; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_plataforma_origen ON public.movimientos USING btree (plataforma_origen);


--
-- Name: idx_movimientos_reserva; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_reserva ON public.movimientos USING btree (id_reserva);


--
-- Name: idx_movimientos_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_tipo ON public.movimientos USING btree (tipo);


--
-- Name: idx_pagos_empresa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_empresa ON public.pagos USING btree (id_empresa);


--
-- Name: idx_pagos_empresa_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_empresa_fecha ON public.pagos USING btree (id_empresa, fecha_pago);


--
-- Name: idx_pagos_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_fecha ON public.pagos USING btree (fecha_pago);


--
-- Name: idx_pagos_fecha_reporte; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_fecha_reporte ON public.pagos USING btree (fecha_reporte);


--
-- Name: idx_pagos_metodo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_metodo ON public.pagos USING btree (metodo_pago);


--
-- Name: idx_pagos_reserva; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_reserva ON public.pagos USING btree (id_reserva);


--
-- Name: idx_pagos_reserva_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_reserva_fecha ON public.pagos USING btree (id_reserva, fecha_pago);


--
-- Name: idx_reservas_empresa_totales; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservas_empresa_totales ON public.reservas USING btree (id_inmueble, total_reserva, total_pagado);


--
-- Name: idx_reservas_financiero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservas_financiero ON public.reservas USING btree (total_reserva, total_pagado, total_pendiente);


--
-- Name: idx_reservas_plataforma_origen; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservas_plataforma_origen ON public.reservas USING btree (plataforma_origen);


--
-- Name: idx_reservas_total_pagado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservas_total_pagado ON public.reservas USING btree (total_pagado);


--
-- Name: idx_reservas_total_pendiente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservas_total_pendiente ON public.reservas USING btree (total_pendiente);


--
-- Name: movimientos trg_movimientos_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_movimientos_update BEFORE UPDATE ON public.movimientos FOR EACH ROW EXECUTE FUNCTION public.update_fecha_actualizacion();


--
-- Name: movimientos trg_sincronizar_plataforma; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_sincronizar_plataforma BEFORE INSERT OR UPDATE ON public.movimientos FOR EACH ROW EXECUTE FUNCTION public.sincronizar_plataforma_reserva_movimiento();


--
-- Name: movimientos trg_validar_concepto; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_validar_concepto BEFORE INSERT OR UPDATE ON public.movimientos FOR EACH ROW EXECUTE FUNCTION public.validar_concepto_movimiento();


--
-- Name: movimientos trg_validar_fecha; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_validar_fecha BEFORE INSERT OR UPDATE ON public.movimientos FOR EACH ROW EXECUTE FUNCTION public.validar_fecha_movimiento();


--
-- Name: movimientos trg_validar_plataforma_movimiento; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_validar_plataforma_movimiento BEFORE INSERT OR UPDATE ON public.movimientos FOR EACH ROW EXECUTE FUNCTION public.validar_plataforma_movimiento();


--
-- Name: reservas trigger_calculate_total_pendiente_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_calculate_total_pendiente_insert BEFORE INSERT ON public.reservas FOR EACH ROW EXECUTE FUNCTION public.calculate_total_pendiente();


--
-- Name: reservas trigger_calculate_total_pendiente_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_calculate_total_pendiente_update BEFORE UPDATE ON public.reservas FOR EACH ROW EXECUTE FUNCTION public.calculate_total_pendiente();


--
-- Name: pagos trigger_pagos_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_pagos_fecha_actualizacion BEFORE UPDATE ON public.pagos FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: reservas trigger_reservas_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_reservas_updated_at BEFORE UPDATE ON public.reservas FOR EACH ROW EXECUTE FUNCTION public.update_reservas_updated_at();


--
-- Name: administradores_inmuebles administradores_inmuebles_inmueble_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores_inmuebles
    ADD CONSTRAINT administradores_inmuebles_inmueble_id_fkey FOREIGN KEY (id_inmueble) REFERENCES public.inmuebles(id_inmueble);


--
-- Name: administradores_inmuebles administradores_inmuebles_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores_inmuebles
    ADD CONSTRAINT administradores_inmuebles_usuario_id_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: egresos egresos_inmueble_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.egresos
    ADD CONSTRAINT egresos_inmueble_id_fkey FOREIGN KEY (id_inmueble) REFERENCES public.inmuebles(id_inmueble);


--
-- Name: movimientos fk_movimientos_pago; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT fk_movimientos_pago FOREIGN KEY (id_pago) REFERENCES public.pagos(id) ON DELETE SET NULL;


--
-- Name: pagos fk_pagos_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT fk_pagos_reserva FOREIGN KEY (id_reserva) REFERENCES public.reservas(id_reserva) ON DELETE CASCADE;


--
-- Name: huespedes_reservas huespedes_reservas_huesped_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.huespedes_reservas
    ADD CONSTRAINT huespedes_reservas_huesped_id_fkey FOREIGN KEY (id_huesped) REFERENCES public.huespedes(id_huesped);


--
-- Name: huespedes_reservas huespedes_reservas_reserva_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.huespedes_reservas
    ADD CONSTRAINT huespedes_reservas_reserva_id_fkey FOREIGN KEY (id_reserva) REFERENCES public.reservas(id_reserva);


--
-- Name: ingresos ingresos_inmueble_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingresos
    ADD CONSTRAINT ingresos_inmueble_id_fkey FOREIGN KEY (id_inmueble) REFERENCES public.inmuebles(id_inmueble);


--
-- Name: ingresos ingresos_reserva_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingresos
    ADD CONSTRAINT ingresos_reserva_id_fkey FOREIGN KEY (id_reserva) REFERENCES public.reservas(id_reserva);


--
-- Name: inmuebles inmuebles_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inmuebles
    ADD CONSTRAINT inmuebles_empresa_id_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- Name: inmuebles inmuebles_propietario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inmuebles
    ADD CONSTRAINT inmuebles_propietario_id_fkey FOREIGN KEY (id_propietario) REFERENCES public.propietarios(id_propietario);


--
-- Name: propietarios propietarios_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propietarios
    ADD CONSTRAINT propietarios_usuario_id_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: reservas reservas_inmueble_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_inmueble_id_fkey FOREIGN KEY (id_inmueble) REFERENCES public.inmuebles(id_inmueble);


--
-- Name: roles_permissions roles_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_permissions
    ADD CONSTRAINT roles_permissions_permission_id_fkey FOREIGN KEY (id_permission) REFERENCES public.permissions(id_permission);


--
-- Name: roles_permissions roles_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_permissions
    ADD CONSTRAINT roles_permissions_role_id_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);


--
-- Name: usuarios usuarios_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_empresa_id_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- Name: usuarios usuarios_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (id_roles) REFERENCES public.roles(id_rol);


--
-- PostgreSQL database dump complete
--

