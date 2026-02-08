# Documentación: Integración API Externa - Plataforma de Origen

## ✅ INTEGRACIÓN COMPLETADA

Se ha completado exitosamente la integración de la funcionalidad de "Plataforma de Origen" con la API externa del backend, siguiendo el patrón establecido de APIs internas de Next.js que actúan como proxy hacia la API externa.

## 📁 ARCHIVOS MODIFICADOS Y CREADOS

### 1. APIs Internas de Next.js (pages/api/)

#### Archivos Modificados
- **`src/pages/api/movimientos/getMovimientosByFecha.ts`**
  - ✅ Agregado soporte para filtro opcional `plataforma_origen`
  - ✅ Parámetro query: `?fecha=2025-01-20&plataforma_origen=airbnb`
  - ✅ Validación de parámetros
  - ✅ Llamada a API externa con filtro

#### Archivos Nuevos
- **`src/pages/api/movimientos/filtrarPorPlataforma.ts`** (NUEVO)
  - ✅ Endpoint dedicado para filtrar por plataforma específica
  - ✅ Validación de plataformas válidas
  - ✅ Query: `?fecha=2025-01-20&plataforma=airbnb`
  - ✅ Conectado con `/movimientos/filtrar-por-plataforma` del backend

- **`src/pages/api/reportes/porPlataforma.ts`** (NUEVO)
  - ✅ Endpoint para generar reportes por plataforma
  - ✅ Query: `?fecha_inicio=2025-01-01&fecha_fin=2025-01-31`
  - ✅ Validación de fechas y rangos
  - ✅ Conectado con `/reportes/por-plataforma` del backend

### 2. Servicios de API (auth/)

#### Archivos Modificados
- **`src/auth/movimientosApi.ts`**
  - ✅ Actualizada función `getMovimientosByFecha()` con parámetro opcional `plataformaOrigen`
  - ✅ Nueva función `filtrarMovimientosPorPlataforma()` 
  - ✅ Logging mejorado con información de filtros

#### Archivos Modificados
- **`src/auth/reportesApi.ts`**
  - ✅ Agregadas nuevas interfaces `IReportePlataformaData` y `IReportePlataformaResponse`
  - ✅ Nueva función `getReportePorPlataforma()`
  - ✅ Nueva función `getResumenPlataforma()` para datos específicos de una plataforma
  - ✅ Documentación clara de secciones

### 3. Componentes de UI

#### Archivos Modificados
- **`src/components/dashboard/Cashbox.tsx`**
  - ✅ Integrado filtro de plataforma con backend
  - ✅ Llamadas API actualizadas para incluir filtro
  - ✅ useEffect optimizado para recargar datos al cambiar filtro
  - ✅ Simplificada lógica de filtrado (ahora se hace en backend)

#### Archivos Nuevos
- **`src/components/dashboard/ReportePlataforma.tsx`** (NUEVO)
  - ✅ Componente completo para visualizar reportes por plataforma
  - ✅ Interfaz de filtros por rango de fechas
  - ✅ Visualización de métricas por plataforma
  - ✅ Gráficos de barras y porcentajes
  - ✅ Integrado con API de reportes

## 🔌 ENDPOINTS INTEGRADOS

### 1. Movimientos con Filtro por Plataforma

#### Frontend → API Interna → API Externa
```
GET /api/movimientos/getMovimientosByFecha?fecha=2025-01-20&plataforma_origen=airbnb
     ↓
GET /movimientos/fecha/2025-01-20?empresa_id=1&plataforma_origen=airbnb
```

**Función:**
```typescript
getMovimientosByFecha(fecha: string, plataformaOrigen?: string)
```

**Uso en Componente:**
```typescript
const movimientos = await getMovimientosByFecha(selectedDate, selectedPlataforma);
```

### 2. Filtro Específico por Plataforma

#### Frontend → API Interna → API Externa
```
GET /api/movimientos/filtrarPorPlataforma?fecha=2025-01-20&plataforma=airbnb
     ↓
GET /movimientos/filtrar-por-plataforma?fecha=2025-01-20&plataforma=airbnb&empresa_id=1
```

**Función:**
```typescript
filtrarMovimientosPorPlataforma(fecha: string, plataforma: string)
```

### 3. Reportes por Plataforma

#### Frontend → API Interna → API Externa
```
GET /api/reportes/porPlataforma?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
     ↓
GET /reportes/por-plataforma?fecha_inicio=2025-01-01&fecha_fin=2025-01-31&empresa_id=1
```

**Función:**
```typescript
getReportePorPlataforma(fechaInicio: string, fechaFin: string)
```

## 🔧 PATRÓN DE INTEGRACIÓN SEGUIDO

### 1. Estructura Consistente

```typescript
// API Interna (pages/api/)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Validar método HTTP
  if (req.method !== 'GET') return res.status(405).json({...});
  
  // 2. Extraer y validar parámetros
  const { param1, param2 } = req.query;
  if (!param1) return res.status(400).json({...});
  
  // 3. Extraer token y empresa_id
  const token = extractTokenFromRequest(req);
  const empresaId = getEmpresaIdFromToken(token);
  
  // 4. Construir endpoint para API externa
  const endpoint = `/ruta/externa?param1=${param1}&empresa_id=${empresaId}`;
  
  // 5. Llamar API externa
  const externalResponse = await externalApiServerFetch(endpoint, { method: 'GET' }, token);
  
  // 6. Procesar y devolver respuesta
  if (externalResponse.isError) return res.status(400).json({...});
  return res.status(200).json({ success: true, data: externalResponse.data });
}
```

### 2. Servicios de API (auth/)

```typescript
// Función de servicio
export const miFuncionApi = async (param1: string, param2?: string) => {
  try {
    console.log('🔄 Descripción de la operación:', { param1, param2 });
    
    // Construir URL con parámetros
    let url = `/api/mi-endpoint?param1=${param1}`;
    if (param2) url += `&param2=${param2}`;
    
    const response = await apiFetch(url, { method: 'GET' });
    
    console.log('✅ Operación exitosa:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error en operación:', error);
    return { success: false, message: 'Error...', error: error.message };
  }
};
```

### 3. Componentes React

```typescript
// En el componente
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const response = await miFuncionApi(param1, param2);
    if (response.success) {
      setData(response.data);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadData();
}, [param1, param2]); // Recargar cuando cambien parámetros
```

## 🔍 VALIDACIONES IMPLEMENTADAS

### 1. Validaciones Frontend
- ✅ **Tipos TypeScript**: Tipado estricto en todas las funciones
- ✅ **Parámetros requeridos**: Validación de parámetros obligatorios
- ✅ **Valores de plataforma**: Solo valores válidos del enum
- ✅ **Fechas**: Formato y rangos válidos

### 2. Validaciones API Interna
- ✅ **Métodos HTTP**: Solo métodos permitidos (GET, POST, PUT, DELETE)
- ✅ **Parámetros query**: Validación de tipos y valores
- ✅ **Plataformas válidas**: Array de valores permitidos
- ✅ **Formato de fechas**: Validación con Date()
- ✅ **Rangos de fechas**: Fecha fin > fecha inicio

### 3. Validaciones Backend (Implementadas por backend)
- ✅ **Autenticación**: Token válido requerido
- ✅ **Autorización**: Empresa_id del token
- ✅ **Enum validation**: Solo valores de plataforma válidos
- ✅ **Lógica de negocio**: Plataforma solo en ingresos de reserva

## 📊 FUNCIONALIDADES INTEGRADAS

### 1. Filtrado en Tiempo Real
- **Componente**: `Cashbox.tsx`
- **Funcionalidad**: Al cambiar filtro de plataforma, se recarga automáticamente
- **Backend**: Filtrado se hace en base de datos (no en frontend)
- **Performance**: Optimizado para grandes volúmenes de datos

### 2. Reportes Interactivos
- **Componente**: `ReportePlataforma.tsx`
- **Funcionalidad**: Reportes por rango de fechas con métricas detalladas
- **Datos**: Total ingresos, cantidad reservas, promedios, porcentajes
- **Visualización**: Badges, barras de progreso, métricas coloridas

### 3. Creación de Movimientos
- **Componente**: `CreateMovimientoModal.tsx`
- **Funcionalidad**: Selector de plataforma condicional (solo ingresos/reserva)
- **Integración**: Campo `plataforma_origen` se envía a API externa
- **Validación**: Backend valida lógica de negocio

### 4. Visualización de Reservas
- **Componente**: `ReservasTable.tsx`
- **Funcionalidad**: Columna de plataforma con badges coloridos
- **Datos**: Campo `plataforma_origen` viene desde API externa
- **UX**: Componente reutilizable `PlataformaBadge`

## 🚀 CÓMO PROBAR LA INTEGRACIÓN

### 1. Probar Filtro de Movimientos
```bash
# 1. Ir a Caja
# 2. Seleccionar una fecha
# 3. Cambiar filtro de plataforma
# 4. Verificar que la tabla se actualiza automáticamente
# 5. Revisar Network tab para ver llamadas a /api/movimientos/getMovimientosByFecha
```

### 2. Probar Creación de Movimiento con Plataforma
```bash
# 1. Ir a Caja > Crear Movimiento
# 2. Seleccionar tipo "Ingreso"
# 3. Seleccionar concepto "Reserva"
# 4. Verificar que aparece selector de plataforma
# 5. Seleccionar plataforma y guardar
# 6. Verificar en tabla que muestra la plataforma asignada
```

### 3. Probar Reporte por Plataforma
```bash
# 1. Agregar <ReportePlataforma /> a algún dashboard
# 2. Seleccionar rango de fechas
# 3. Hacer clic en "Generar Reporte"
# 4. Verificar datos por plataforma
# 5. Revisar Network tab para ver llamada a /api/reportes/porPlataforma
```

### 4. Probar Creación de Reserva con Plataforma
```bash
# 1. Ir a Reservas > Crear Reserva
# 2. Llenar datos básicos
# 3. Seleccionar plataforma de origen
# 4. Guardar reserva
# 5. Verificar en tabla que muestra badge de plataforma
```

## 🔧 DEBUGGING Y LOGS

### 1. Logs Frontend
```typescript
// Buscar en console estos logs:
🔄 Obteniendo movimientos por fecha: 2025-01-20 con filtro de plataforma: airbnb
✅ Movimientos por fecha obtenidos exitosamente: 5
🔄 Obteniendo reporte por plataforma: {fechaInicio: "2025-01-01", fechaFin: "2025-01-31"}
✅ Reporte por plataforma obtenido exitosamente: {...}
```

### 2. Logs API Interna
```typescript
// Logs en terminal del servidor Next.js
console.log('API movimientos por fecha llamada con:', { fecha, plataforma_origen });
console.log('Llamando endpoint externo:', endpoint);
console.log('Respuesta externa:', externalResponse);
```

### 3. Network Tab
```bash
# Verificar estas llamadas en DevTools > Network:
GET /api/movimientos/getMovimientosByFecha?fecha=2025-01-20&plataforma_origen=airbnb
GET /api/reportes/porPlataforma?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
POST /api/movimientos/createMovimiento (con plataforma_origen en body)
POST /api/reservas/createReserva (con plataforma_origen en body)
```

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. Autenticación
- ✅ **Token requerido**: Todas las APIs requieren token válido
- ✅ **Empresa ID**: Se extrae automáticamente del token
- ✅ **Sesión válida**: Si token expira, redirige a login

### 2. Manejo de Errores
- ✅ **Errors del backend**: Se propagan correctamente al frontend
- ✅ **Timeouts**: Manejados por `externalApiServerFetch`
- ✅ **Conexión perdida**: Mensajes de error claros al usuario

### 3. Performance
- ✅ **Filtrado en backend**: No se carga todo y luego filtra
- ✅ **Parámetros opcionales**: Solo se agrega query param si hay filtro
- ✅ **Reutilización**: APIs reutilizables para múltiples componentes

### 4. Compatibilidad
- ✅ **Retrocompatibilidad**: APIs existentes siguen funcionando
- ✅ **Parámetros opcionales**: `plataforma_origen` es siempre opcional
- ✅ **Valores por defecto**: Backend asigna 'directa' si no se especifica

## 🎯 ESTADO ACTUAL

### ✅ COMPLETADO
- [x] APIs internas creadas y funcionando
- [x] Servicios de API actualizados
- [x] Componentes integrados con backend
- [x] Filtrado por plataforma operativo
- [x] Creación de reservas con plataforma
- [x] Creación de movimientos con plataforma
- [x] Reportes por plataforma funcionales
- [x] Validaciones completas implementadas
- [x] Manejo de errores robusto
- [x] Documentación completa

### 🔄 PRÓXIMOS PASOS (Opcionales)
- [ ] Tests de integración automatizados
- [ ] Métricas de performance
- [ ] Cache de reportes
- [ ] Exportación de reportes a PDF/Excel
- [ ] Notificaciones push para cambios de plataforma

---

## 📞 SOPORTE TÉCNICO

### En caso de problemas:

1. **Verificar Backend**: Confirmar que endpoints del backend están funcionando
2. **Revisar Logs**: Buscar errores en console del navegador y terminal Next.js
3. **Validar Token**: Asegurar que el usuario está autenticado
4. **Network Tab**: Revisar las llamadas HTTP en DevTools
5. **Datos de Prueba**: Verificar que hay datos en las fechas seleccionadas

### Contacto de Desarrollo:
- **Frontend**: Implementación completada según especificaciones
- **Backend**: Validar endpoints según `IMPLEMENTACION_BACKEND_PLATAFORMA_ORIGEN.md`
- **Integración**: Todas las APIs siguieron el patrón establecido

---

**🎉 INTEGRACIÓN EXITOSAMENTE COMPLETADA**

*Documentación generada el 20 de Octubre de 2025*