# Implementación Backend: Plataforma de Origen

## Resumen Ejecutivo

Se implementó exitosamente la funcionalidad de "Plataforma de Origen" en el backend para soportar la identificación y filtrado de reservas y movimientos según su fuente (Airbnb, Booking, Página Web, o Directa). Esta implementación proporciona una API completa para que el frontend pueda gestionar las plataformas de origen.

## Archivos Modificados y Creados

### ✅ 1. Nuevas Constantes
**Archivo:** `constants/plataformas.ts` (NUEVO)
- Definición del tipo `PlataformaOrigen`
- Array `PLATAFORMAS_ORIGEN` con valores válidos
- Funciones de utilidad `isPlataformaValida()`, `getPlataformaLabel()`, `getPlataformaColor()`
- Valor por defecto `PLATAFORMA_DEFAULT = 'directa'`

### ✅ 2. Interfaces Actualizadas

#### `interfaces/reserva.interface.ts`
```typescript
// Agregado en todas las interfaces relevantes:
plataforma_origen?: string; // En CreateReservaRequest y EditReservaRequest
plataforma_origen: string;  // En Reserva (requerido)
```

#### `interfaces/movimiento.interface.ts`  
```typescript
// Agregado en todas las interfaces relevantes:
plataforma_origen?: string | null; // En todas las interfaces de movimiento
// Agregado en MovimientosQueryParams para filtros:
plataforma_origen?: string;
```

### ✅ 3. Schemas de Validación Actualizados

#### `schemas/movimiento.schema.ts`
- Importado constantes de plataformas
- Agregado `plataformaOrigenSchema` con validación de valores válidos
- Actualizado `CreateMovimientoSchema` con validación de lógica de negocio
- Actualizado `EditMovimientoSchema` con validación condicional
- Actualizado `MovimientosFechaQuerySchema` para incluir filtro opcional

#### `schemas/reserva.schema.ts`
- Agregado campo `plataforma_origen` en schemas de crear y editar reserva
- Validación de enum con valores válidos

### ✅ 4. Servicios Actualizados y Creados

#### Servicios de Reservas
**`services/reservas/createReservaService.ts`**
- Agregado método `validatePlataformaOrigen()`
- Validación automática y asignación de valor por defecto
- Soporte completo para crear reservas con plataforma

**`services/reservas/editReservaService.ts`**
- Agregado validación de plataforma en edición
- Soporte para actualizar plataforma de origen

#### Servicios de Movimientos
**`services/movimientos/getMovimientosFechaService.ts`**
- Agregado parámetro opcional `plataformaOrigen`
- Validación de plataforma válida
- Filtrado por plataforma integrado

**`services/movimientos/filtrarMovimientosPorPlataformaService.ts`** (NUEVO)
- Servicio dedicado para filtrar movimientos por plataforma y fecha
- Validaciones completas de parámetros

**`services/movimientos/reportePorPlataformaService.ts`** (NUEVO)
- Servicio para generar reportes de ingresos por plataforma
- Manejo de rangos de fechas

### ✅ 5. Repositorios Actualizados

#### `repositories/reservas.repository.ts`
- Agregado campo `plataforma_origen` en método `createReserva()`
- Actualizado SELECT para incluir `plataforma_origen`
- Agregado campo en `updateReserva()` con validación

#### `repositories/movimientos.repository.ts`
- Actualizados todos los métodos SELECT para incluir `plataforma_origen`
- Modificado `createMovimiento()` para soportar plataforma
- Modificado `updateMovimiento()` para soportar plataforma
- Agregado `getMovimientosByFecha()` con filtro por plataforma
- Agregado método `getReportePorPlataforma()` (NUEVO)

### ✅ 6. Controladores Actualizados

#### `controllers/movimientos.controller.ts`
- Actualizado `getMovimientosByFecha` para soportar filtro por plataforma
- Agregado endpoint `filtrarMovimientosPorPlataforma` (NUEVO)
- Agregado endpoint `reportePorPlataforma` (NUEVO)
- Validaciones de parámetros query

### ✅ 7. Rutas Actualizadas y Creadas

#### `routes/movimientos.routes.ts`
- Actualizada documentación de endpoint existente
- Agregada ruta `/filtrar-por-plataforma`

#### `routes/reportes.routes.ts` (NUEVO)
- Nueva ruta `/por-plataforma` para reportes

### ✅ 8. Scripts de Base de Datos

#### `scripts_sql_plataforma_origen.sql` (NUEVO)
- Script completo para agregar columnas `plataforma_origen`
- Validaciones a nivel de base de datos
- Índices optimizados para consultas
- Triggers para validación automática
- Sincronización automática entre reservas y movimientos
- Datos de prueba y consultas de verificación

## Endpoints Implementados

### Endpoints Existentes Modificados

#### 📝 POST /api/reservas
**Agregado en Request Body:**
```json
{
  "plataforma_origen": "airbnb" // opcional, default: "directa"
}
```

#### 📝 GET /api/reservas
**Agregado en Response:**
```json
{
  "plataforma_origen": "airbnb"
}
```

#### 📝 PUT /api/reservas/:id
**Agregado en Request Body:**
```json
{
  "plataforma_origen": "booking" // opcional
}
```

#### 📝 POST /api/movimientos
**Agregado en Request Body:**
```json
{
  "plataforma_origen": "airbnb" // opcional, solo para ingresos de reserva
}
```

#### 📝 GET /api/movimientos/fecha/{fecha}
**Agregado query parameter:**
```
?empresa_id=1&plataforma_origen=airbnb
```

#### 📝 PUT /api/movimientos/:id
**Agregado en Request Body:**
```json
{
  "plataforma_origen": "booking" // opcional
}
```

### Nuevos Endpoints Opcionales

#### 🆕 GET /api/movimientos/filtrar-por-plataforma
**Query Parameters:**
```
?fecha=2025-01-20&plataforma=airbnb&empresa_id=1
```
**Response:**
```json
{
  "success": true,
  "data": [/* movimientos filtrados */],
  "message": "Movimientos filtrados exitosamente"
}
```

#### 🆕 GET /api/reportes/por-plataforma
**Query Parameters:**
```
?fecha_inicio=2025-01-01&fecha_fin=2025-01-31&empresa_id=1
```
**Response:**
```json
{
  "success": true,
  "data": {
    "airbnb": { "total_ingresos": 1000000, "cantidad_reservas": 5 },
    "booking": { "total_ingresos": 800000, "cantidad_reservas": 3 },
    "pagina_web": { "total_ingresos": 600000, "cantidad_reservas": 2 },
    "directa": { "total_ingresos": 400000, "cantidad_reservas": 2 }
  },
  "message": "Reporte generado exitosamente"
}
```

## Validaciones Implementadas

### 1. Validaciones de Backend

#### Reglas de Negocio
- **Reservas**: `plataforma_origen` es opcional, si no se envía usar 'directa'
- **Movimientos**: `plataforma_origen` solo debe asignarse si:
  - `tipo` = 'ingreso' 
  - `concepto` = 'reserva'
- **Enum**: Solo valores válidos ('airbnb', 'booking', 'pagina_web', 'directa')

#### Validaciones en Servicios
```typescript
// Validación de plataforma válida
if (plataformaOrigen && !isPlataformaValida(plataformaOrigen)) {
  throw new Error('La plataforma de origen especificada no es válida');
}

// Validación de lógica de negocio en movimientos
if (plataforma_origen && (tipo !== 'ingreso' || concepto !== 'reserva')) {
  throw new Error('Plataforma de origen solo válida para ingresos de reserva');
}
```

### 2. Validaciones de Base de Datos

#### Constraints
```sql
-- Validación de valores válidos
CHECK (plataforma_origen IN ('airbnb', 'booking', 'pagina_web', 'directa'))

-- Trigger para validar lógica de negocio
CREATE TRIGGER trg_validar_plataforma_movimiento
```

#### Sincronización Automática
- Los movimientos de ingreso/reserva heredan automáticamente la plataforma de su reserva
- Trigger automático para sincronización entre tablas

## Funcionalidades Adicionales

### 1. Filtrado Avanzado
- Filtro por plataforma en endpoint de movimientos existente
- Endpoint dedicado para filtrado específico
- Soporte para filtros combinados (fecha + plataforma + empresa)

### 2. Reportes y Analytics
- Endpoint de reporte consolidado por plataforma
- Métricas de ingresos y cantidad de reservas por plataforma
- Soporte para rangos de fechas personalizados

### 3. Optimización de Performance
- Índices específicos para consultas por plataforma
- Índices compuestos para filtros combinados
- Consultas optimizadas en repositorio

## Instrucciones de Instalación

### 1. Ejecutar Script SQL
```bash
psql -d nombre_base_datos -f scripts_sql_plataforma_origen.sql
```

### 2. Verificar Instalación
El script incluye consultas de verificación que validan:
- Columnas agregadas correctamente
- Índices creados
- Triggers funcionando
- Datos de prueba (opcional)

### 3. Configurar Rutas (si es necesario)
Asegurar que las rutas estén registradas en el servidor principal:
```typescript
server.register(reportesRoutes, { prefix: '/reportes' });
```

## Casos de Uso Implementados

### Ejemplo 1: Crear Reserva con Plataforma
```bash
POST /api/reservas
{
  "id_inmueble": 1,
  "fecha_entrada": "2025-01-25",
  "fecha_salida": "2025-01-30",
  "numero_huespedes": 2,
  "precio_total": 200000,
  "total_reserva": 200000,
  "estado": "confirmada",
  "id_empresa": 1,
  "plataforma_origen": "airbnb",
  "huespedes": [...]
}
```

### Ejemplo 2: Crear Movimiento con Plataforma
```bash
POST /api/movimientos
{
  "fecha": "2025-01-20",
  "tipo": "ingreso",
  "concepto": "reserva",
  "descripcion": "Pago reserva Airbnb",
  "monto": 200000,
  "id_inmueble": "1",
  "id_reserva": "123",
  "metodo_pago": "transferencia",
  "id_empresa": "1",
  "plataforma_origen": "airbnb"
}
```

### Ejemplo 3: Filtrar Movimientos por Plataforma
```bash
GET /api/movimientos/filtrar-por-plataforma?fecha=2025-01-20&plataforma=airbnb&empresa_id=1
```

### Ejemplo 4: Generar Reporte de Plataformas
```bash
GET /api/reportes/por-plataforma?fecha_inicio=2025-01-01&fecha_fin=2025-01-31&empresa_id=1
```

## Retrocompatibilidad

### ✅ Sin Breaking Changes
- Todos los endpoints existentes siguen funcionando sin cambios
- Campos `plataforma_origen` son opcionales en requests existentes
- Valores por defecto aplicados automáticamente

### ✅ Migración Automática
- Reservas existentes se marcan como 'directa'
- Movimientos existentes heredan plataforma de su reserva asociada
- Triggers aseguran consistencia futura

## Estado del Proyecto

**✅ Completado (Backend)**
- Todas las funcionalidades implementadas
- Validaciones completas
- Endpoints funcionales
- Base de datos preparada
- Documentación completa

**⏳ Pendiente**
- Integración con frontend
- Pruebas de integración
- Despliegue en producción

---
*Documentación de implementación generada el 20 de Octubre de 2025*