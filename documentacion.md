# Documentación Técnica del Proyecto Plataforma Waiwahost

Este documento detalla la estructura, tecnologías, configuración y lógica del proyecto.

## 1. Visión General
El proyecto es una plataforma de gestión (PMS) para propiedades, reservas y finanzas. Está construido como un **monolito modularizado** usando contenedores Docker.

### Arquitectura de Servicios (Docker Compose)
El sistema se compone de 5 servicios principales interconectados en la red `waiwa-net`:

1.  **db**: Base de datos PostgreSQL 15.
    *   Puerto interno: 5432
    *   Volumen: `db_data` para persistencia.
2.  **backend**: API RESTful principal.
    *   Puerto expuesto: 3001
    *   Stack: Node.js (Fastify) + TypeScript.
3.  **frontend**: Aplicación web principal (Dashboard).
    *   Puerto interno: 3000 (expuesto vía Nginx).
    *   Stack: Next.js 15 + React 19.
4.  **formulario**: Aplicación web satélite para check-in público.
    *   Puerto expuesto: 3002
    *   Stack: Next.js.
5.  **nginx**: Proxy reverso y servidor web.
    *   Puertos: 80 (HTTP), 443 (HTTPS).
    *   Maneja SSL (Let's Encrypt).
    *   Enruta tráfico a frontend, backend y formulario.

---

## 2. Backend (`backend/plataforma_backend`)
API construida con **Fastify** y **TypeScript**, orientada a alto rendimiento.

### Tecnologías Clave
*   **Runtime**: Node.js
*   **Framework**: Fastify v5
*   **Lenguaje**: TypeScript
*   **Validación**: Zod
*   **Auth**: JWT (`fastify-jwt`) + Bcrypt
*   **Documentación**: Swagger UI (`@fastify/swagger`)
*   **Driver DB**: `pg` (Cliente nativo de Postgres)

### Estructura de Directorios
*   `/controllers`: Manejadores de peticiones HTTP.
*   `/services`: Lógica de negocio pura.
*   `/repositories`: Capa de acceso a datos (patrón Repository).
*   `/interfaces`: Definiciones de tipos TypeScript para modelos de DB.
*   `/schemas`: Esquemas de validación Zod para request/response.
*   `/routes`: Definición de endpoints.
*   `/middlewares`: Interceptores (Auth, Logging).

### Módulos Principales (Funcionalidades)
Cada módulo suele tener su Controller, Service y Schema asociado:
*   **Auth/User**: Gestión de usuarios, login y roles.
*   **Empresa**: Gestión de tenants/organizaciones.
*   **Inmuebles**: CRUD de propiedades, asignación de propietarios.
*   **Reservas**: Núcleo del sistema. Gestión de fechas, precios, estados y códigos.
    *   Campos financieros: `total_reserva`, `total_pagado`, `total_pendiente`.
    *   Incluye lógica de `plataforma_origen` (Airbnb, Booking, Directo).
*   **Huespedes**: Gestión de huéspedes principales y secundarios.
*   **Movimientos**: Registro contable (Ingresos/Egresos).
    *   Conceptos Ingresos: reserva, limpieza, deposito, etc.
    *   Conceptos Egresos: mantenimiento, servicios, comision, etc.
*   **Pagos**: Gestión de pagos asociados a reservas.
*   **Disponibilidad**: Lógica de calendario. Incluye filtrado por ciudad, fechas, inmuebles y estados. Soporta creación y edición directa de reservas desde el calendario.
*   **Reportes/TotalesReserva**: Agregación de datos financieros.

---

## 3. Frontend (`frontend/plataforma_frontend`)
Dashboard administrativo moderno.

### Tecnologías Clave
*   **Framework**: Next.js 15.5.9 (React 19)
*   **Estilos**: Tailwind CSS + `tailwindcss-animate`
*   **Componentes UI**: Radix UI (primitivos accesibles) + Lucide React (iconos).
*   **Formularios**: React Hook Form + Zod resolvers.
*   **Gráficos**: Recharts.
*   **Utilidades**: `date-fns` (fechas), `sonner` (toasts), `jspdf` (PDFs).

### Estructura
*   `/src/app`: Rutas del App Router (layout, pages).
*   `/src/components`: Componentes reutilizables.
*   `/src/hooks`: Custom hooks.
*   `/src/services`: Llamadas a la API.

---

## 4. Frontend Formulario (`frontend-formulario/formulario`)
Aplicación ligera separada para uso público (Check-in de huéspedes).
*   Permite a los huéspedes registrar sus datos sin acceder al dashboard principal.
*   Se comunica con la API pública del backend.

---

## 5. Base de Datos (PostgreSQL)
Modelo relacional. Basado en las interfaces, las tablas principales son:

*   **users**: Usuarios del sistema.
*   **empresas**: Multitenancy.
*   **inmuebles**: Propiedades.
*   **reservas**: Tabla central. Relacionada con Inmuebles y Empresas.
*   **huespedes**: Relacionada con Reservas.
*   **movimientos**: Registro financiero, linkeado a Inmuebles y opcionalmente a Reservas.
*   **pagos**: Pagos parciales.

---

## 6. Infraestructura (Nginx)
Configuración de proxy inverso en `nginx/conf.d/default.conf`.
*   **SSL**: Certificados montados desde `/etc/letsencrypt`.
*   **Routing**:
    *   `https://domain/` -> Frontend principal.
    *   `https://domain/apis` -> Backend API (pasa headers reales de IP).
    *   `https://domain/checkin` -> Frontend Formulario.
