# Documentación: Implementación de Plataforma de Origen

## Resumen Ejecutivo

Se implementó exitosamente la funcionalidad de "Plataforma de Origen" para reservas y movimientos de caja, permitiendo identificar y filtrar transacciones según su fuente (Airbnb, Booking, Página Web, o Directa). Esta mejora facilita el seguimiento y análisis de ingresos por plataforma específica.

## Objetivos Cumplidos

### ✅ 1. Nueva Columna de Plataforma Origen
- **Implementado**: Columna "plataforma_origen" agregada a reservas y movimientos
- **Valores soportados**: 'airbnb', 'booking', 'pagina_web', 'directa'
- **Valor por defecto**: 'directa'

### ✅ 2. Selector en Creación de Reserva
- **Implementado**: Selector opcional en modal de crear reserva
- **Comportamiento**: Si no se selecciona, guarda automáticamente como "Directa"

### ✅ 3. Visualización en Movimientos de Caja
- **Implementado**: Nueva columna "Plataforma" en tabla de movimientos
- **Implementado**: Campo de plataforma en popup de crear movimiento

### ✅ 4. Lógica Condicional en Movimientos
- **Implementado**: Selector de plataforma solo aparece cuando:
  - Tipo de movimiento: "Ingreso" 
  - Concepto: "Reserva"

### ✅ 5. Filtro por Plataforma
- **Implementado**: Filtro dropdown en vista de caja
- **Funcionalidad**: Filtra movimientos por plataforma seleccionada
- **Opción**: "Todas las plataformas" para ver todo

### ✅ 6. Documentación Completa
- **Implementado**: Documentación de cambios y requerimientos de API

## Archivos Modificados

### 1. Interfaces y Tipos
- **`src/interfaces/Reserva.ts`**
  - Agregado campo `plataforma_origen` opcional en `IReservaForm`
  - Agregado campo `plataforma_origen` requerido en `IReserva`

- **`src/interfaces/Movimiento.ts`**
  - Agregado campo `plataforma_origen` opcional en `IMovimiento`
  - Agregado campo `plataforma_origen` opcional en `IMovimientoForm`

### 2. Constantes y Utilidades
- **`src/constants/plataformas.ts`** (NUEVO)
  - Definición del tipo `PlataformaOrigen`
  - Array `PLATAFORMAS_ORIGEN` con opciones y colores
  - Funciones de utilidad `getPlataformaLabel()` y `getPlataformaColor()`

### 3. Componentes de UI

#### Modal de Reservas
- **`src/components/dashboard/CreateReservaModal.tsx`**
  - Importado constantes de plataformas
  - Agregado selector de plataforma en formulario
  - Valor por defecto: 'directa'

#### Tabla de Reservas
- **`src/components/dashboard/ReservasTable.tsx`**
  - Importado utilidades de plataforma
  - Agregada columna "Plataforma" en header
  - Agregada celda con badge de plataforma por fila
  - Actualizado colspan para modal vacío

#### Modal de Movimientos
- **`src/components/dashboard/CreateMovimientoModal.tsx`**
  - Importado constantes de plataformas
  - Agregado campo `plataforma_origen` en estado del formulario
  - Implementada lógica condicional para mostrar selector
  - Solo visible cuando: tipo="ingreso" AND concepto="reserva"

#### Tabla de Movimientos
- **`src/components/dashboard/MovimientosTable.tsx`**
  - Importado utilidades de plataforma
  - Agregada columna "Plataforma" en header
  - Agregada celda con badge de plataforma por fila

#### Vista de Caja
- **`src/components/dashboard/Cashbox.tsx`**
  - Importado constantes de plataformas
  - Agregado estado para movimientos filtrados
  - Agregado estado para plataforma seleccionada
  - Implementado useEffect para filtrado automático
  - Agregada UI de filtros con selector
  - Actualizada tabla para usar movimientos filtrados

## Implementación Mockeada Actual

### Datos de Prueba
Los datos actualmente se manejan de forma mockeada con valores por defecto:

```typescript
// Reservas nuevas se crean con plataforma_origen: 'directa'
// Movimientos pueden tener plataforma_origen asignada manualmente
// Filtros funcionan con datos locales del frontend
```

### Comportamiento Actual
1. **Reservas**: Al crear, se asigna automáticamente 'directa' si no se selecciona otra plataforma
2. **Movimientos**: Solo movimientos de tipo "ingreso" con concepto "reserva" pueden tener plataforma asignada
3. **Filtros**: Funcionan en tiempo real filtrando el array local de movimientos
4. **Visualización**: Badges de colores para identificar rápidamente las plataformas

## Requerimientos para API Externa (BACKEND)

### 1. Modificaciones en Base de Datos

#### Tabla `reservas`
```sql
ALTER TABLE reservas 
ADD COLUMN plataforma_origen ENUM('airbnb', 'booking', 'pagina_web', 'directa') 
DEFAULT 'directa';
```

#### Tabla `movimientos`
```sql
ALTER TABLE movimientos 
ADD COLUMN plataforma_origen ENUM('airbnb', 'booking', 'pagina_web', 'directa') 
NULL;
```

### 2. Endpoints a Modificar

#### POST /api/reservas
**Request Body (agregar):**
```json
{
  "plataforma_origen": "airbnb" // opcional, default: "directa"
}
```

**Response (agregar):**
```json
{
  "plataforma_origen": "airbnb"
}
```

#### GET /api/reservas
**Response (agregar en cada reserva):**
```json
{
  "plataforma_origen": "airbnb"
}
```

#### PUT /api/reservas/:id
**Request Body (agregar):**
```json
{
  "plataforma_origen": "booking" // opcional
}
```

#### POST /api/movimientos
**Request Body (agregar):**
```json
{
  "plataforma_origen": "airbnb" // opcional, solo para ingresos de reserva
}
```

**Response (agregar):**
```json
{
  "plataforma_origen": "airbnb"
}
```

#### GET /api/movimientos
**Response (agregar en cada movimiento):**
```json
{
  "plataforma_origen": "airbnb" // puede ser null
}
```

#### PUT /api/movimientos/:id
**Request Body (agregar):**
```json
{
  "plataforma_origen": "booking" // opcional
}
```

### 3. Nuevos Endpoints Sugeridos (Opcional)

#### GET /api/movimientos/filtrar-por-plataforma
**Query Parameters:**
```
?fecha=2025-01-20&plataforma=airbnb
```

**Response:**
```json
{
  "success": true,
  "data": [/* movimientos filtrados */],
  "message": "Movimientos filtrados exitosamente"
}
```

#### GET /api/reportes/por-plataforma
**Query Parameters:**
```
?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
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
  }
}
```

### 4. Validaciones de Backend

#### Reglas de Negocio
1. **Reservas**: `plataforma_origen` es opcional, si no se envía usar 'directa'
2. **Movimientos**: `plataforma_origen` solo debe asignarse si:
   - `tipo` = 'ingreso' 
   - `concepto` = 'reserva'
3. **Validación de Enum**: Solo permitir valores válidos ('airbnb', 'booking', 'pagina_web', 'directa')

#### Ejemplo de Validación (Node.js/Express)
```javascript
// Validación para reservas
const validarReserva = (req, res, next) => {
  const { plataforma_origen } = req.body;
  const plataformasValidas = ['airbnb', 'booking', 'pagina_web', 'directa'];
  
  if (plataforma_origen && !plataformasValidas.includes(plataforma_origen)) {
    return res.status(400).json({
      success: false,
      message: 'Plataforma de origen inválida'
    });
  }
  
  // Si no se especifica, asignar 'directa'
  if (!plataforma_origen) {
    req.body.plataforma_origen = 'directa';
  }
  
  next();
};

// Validación para movimientos
const validarMovimiento = (req, res, next) => {
  const { tipo, concepto, plataforma_origen } = req.body;
  
  // Solo permitir plataforma_origen en ingresos de reserva
  if (plataforma_origen && (tipo !== 'ingreso' || concepto !== 'reserva')) {
    return res.status(400).json({
      success: false,
      message: 'Plataforma de origen solo válida para ingresos de reserva'
    });
  }
  
  next();
};
```

## Funcionalidades Implementadas

### 1. Visualización Mejorada
- **Badges de colores** para identificar rápidamente plataformas
- **Íconos y colores consistentes** en toda la aplicación
- **Tooltips informativos** en selectors

### 2. UX/UI Optimizada
- **Selector condicional** que solo aparece cuando es relevante
- **Valores por defecto inteligentes** ('directa' como fallback)
- **Filtros en tiempo real** sin necesidad de recargar página

### 3. Mantenimiento del Código
- **Constantes centralizadas** en archivo dedicado
- **Funciones de utilidad reutilizables** para labels y colores
- **Tipado estricto** con TypeScript para prevenir errores

## Casos de Uso

### Ejemplo 1: Crear Reserva desde Airbnb
1. Usuario abre modal "Crear Reserva"
2. Completa datos básicos
3. Selecciona "Airbnb" en Plataforma de Origen
4. Guarda reserva
5. Sistema almacena con `plataforma_origen: 'airbnb'`

### Ejemplo 2: Registrar Ingreso de Reserva
1. Usuario crea movimiento tipo "Ingreso"
2. Selecciona concepto "Reserva"
3. Aparece automáticamente selector de plataforma
4. Selecciona "Booking"
5. Sistema guarda movimiento con plataforma vinculada

### Ejemplo 3: Filtrar Movimientos
1. Usuario accede a vista "Caja"
2. Selecciona filtro "Airbnb"
3. Tabla muestra solo movimientos de esa plataforma
4. Puede cambiar a "Todas" para ver todos nuevamente

## Próximos Pasos

### Fase 1: Integración con Backend ⏳
1. Implementar cambios en base de datos
2. Modificar endpoints existentes
3. Agregar validaciones de backend
4. Probar integración completa

### Fase 2: Reportes y Analytics 📊
1. Crear reportes por plataforma
2. Gráficos de distribución de ingresos
3. Comparativas entre plataformas
4. Exportación de datos filtrados

### Fase 3: Mejoras Adicionales 🚀
1. Sincronización automática con APIs de plataformas
2. Alertas de inconsistencias
3. Historial de cambios de plataforma
4. Métricas de rendimiento por canal

## Conclusión

La implementación de la funcionalidad de "Plataforma de Origen" ha sido completada exitosamente en el frontend, proporcionando una base sólida para el seguimiento y análisis de reservas e ingresos por canal. El código está preparado para la integración con el backend siguiendo las especificaciones documentadas.

**Estado del Proyecto**: ✅ Completado (Frontend) - Pendiente integración Backend

---
*Documentación generada el 20 de Octubre de 2025*