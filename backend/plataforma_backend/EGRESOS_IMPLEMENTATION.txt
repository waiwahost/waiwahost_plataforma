# Implementación del Componente de Egresos

## Resumen de la Implementación

Se ha desarrollado exitosamente el componente de **Egresos** que permite gestionar y visualizar todos los egresos de la plataforma, con funcionalidades de filtrado por fecha e inmueble. Además, se cambió la nomenclatura de "Deducibles" por "Egresos" en toda la interfaz.

## Cambios de Nomenclatura

### 1. Cambio de "Deducibles" a "Egresos"
- **Archivos modificados**:
  - `src/components/organisms/SidebarMenu.tsx`: Cambio en el menú lateral
  - `src/app/dashboard/page.tsx`: Cambio en las pestañas del dashboard
  - `src/components/dashboard/Deductions.tsx`: Actualización del contenido

## Nuevas Funcionalidades Implementadas

### 1. Componente Principal de Egresos
- **Archivo**: `src/components/dashboard/Deductions.tsx` (actualizado)
- **Funcionalidades**:
  - Navegación por días usando el componente `DateSelector` existente
  - Filtrado por inmueble específico o visualización de todos los inmuebles
  - Visualización de resumen diario de egresos
  - Lista detallada de todos los egresos del día
  - Modal de detalle para ver información completa de cada egreso

### 2. Reutilización del Selector de Inmuebles
- **Archivo**: `src/components/dashboard/PropertySelector.tsx` (reutilizado de Ingresos)
- **Funcionalidades**:
  - Lista desplegable con todos los inmuebles disponibles
  - Opción "Todos los inmuebles" para ver egresos sin filtro
  - Indicador visual del inmueble seleccionado
  - Estado de carga mientras se obtienen los inmuebles

### 3. Resumen de Egresos (ExpensesSummary)
- **Archivo**: `src/components/dashboard/ExpensesSummary.tsx`
- **Funcionalidades**:
  - Título dinámico que muestra el inmueble seleccionado o "Todos los inmuebles"
  - Cards con métricas clave:
    - Total de egresos del día (en rojo para indicar salida de dinero)
    - Cantidad de egresos registrados
    - Promedio por egreso
  - Desglose por inmueble (cuando no hay filtro específico)
  - Esquema de colores diferenciado para egresos (rojos/naranjas)

### 4. Tabla de Egresos (ExpensesTable)
- **Archivo**: `src/components/dashboard/ExpensesTable.tsx`
- **Funcionalidades**:
  - Lista completa de egresos con columnas:
    - Hora del registro
    - Concepto del egreso (con badges de colores por tipo)
    - Descripción
    - Inmueble asociado
    - Monto (formateado como moneda colombiana con signo negativo)
    - Método de pago con iconos
    - Código de reserva (si aplica)
    - Acciones (ver detalle)
  - Estados de carga y vacío
  - Ordenamiento por fecha de creación
  - Conceptos específicos de egresos con colores distintivos

### 5. Modal de Detalle (ExpenseDetailModal)
- **Archivo**: `src/components/dashboard/ExpenseDetailModal.tsx`
- **Funcionalidades**:
  - Vista completa de toda la información del egreso
  - Formato amigable de fechas y montos (con signo negativo)
  - Badges coloridos para tipo de concepto
  - Información técnica (IDs, fechas de auditoría)
  - Diseño consistente con el modal de ingresos pero adaptado para egresos

## Nuevas Interfaces y Tipos

### 1. Interface IEgreso
- **Archivo**: `src/interfaces/Egreso.ts`
- **Propósito**: Define la estructura de datos para los egresos (solo movimientos tipo egreso)
- **Diferencias con IIngreso**: Solo incluye movimientos, no hay concepto de "pagos" para egresos

### 2. Interface IResumenEgresos
- **Archivo**: `src/interfaces/Egreso.ts`
- **Propósito**: Define la estructura para el resumen diario de egresos

### 3. Interface IFiltrosEgresos
- **Archivo**: `src/interfaces/Egreso.ts`
- **Propósito**: Define los parámetros de filtrado disponibles para egresos

## Nuevos Endpoints API

### 1. GET /api/egresos/getEgresos
- **Archivo**: `src/pages/api/egresos/getEgresos.ts`
- **Parámetros**:
  - `fecha` (obligatorio): Fecha en formato YYYY-MM-DD
  - `id_inmueble` (opcional): ID del inmueble para filtrar
- **Respuesta**: Lista de egresos filtrados por los parámetros
- **Funcionalidad**: Filtra solo movimientos tipo "egreso"

### 2. GET /api/egresos/getResumenEgresos
- **Archivo**: `src/pages/api/egresos/getResumenEgresos.ts`
- **Parámetros**:
  - `fecha` (obligatorio): Fecha en formato YYYY-MM-DD
  - `id_inmueble` (opcional): ID del inmueble para filtrar
- **Respuesta**: Resumen agregado de egresos del día
- **Funcionalidad**: Calcula totales, promedios y desglose por inmueble

### 3. GET /api/egresos/getInmueblesFiltro
- **Archivo**: `src/pages/api/egresos/getInmueblesFiltro.ts`
- **Parámetros**: Ninguno
- **Respuesta**: Lista simplificada de inmuebles para el selector
- **Funcionalidad**: Proporciona opciones para el filtro de inmuebles

## Nuevas APIs de Cliente

### 1. egresosApi.ts
- **Archivo**: `src/auth/egresosApi.ts`
- **Funciones**:
  - `getEgresosByFiltros()`: Obtiene egresos filtrados
  - `getResumenEgresos()`: Obtiene resumen de egresos
  - `getInmueblesParaFiltro()`: Obtiene lista de inmuebles
- **Propósito**: Centralizar las llamadas a la API de egresos con data mockeada

## Conceptos de Egresos Implementados

### Tipos de Conceptos con Colores Distintivos
1. **Mantenimiento** (Naranja): Reparaciones y mantenimiento de inmuebles
2. **Limpieza** (Verde): Servicios de limpieza
3. **Servicios Públicos** (Azul): Agua, luz, gas, internet, etc.
4. **Suministros** (Púrpura): Productos y materiales
5. **Comisión** (Amarillo): Comisiones de plataformas o servicios
6. **Devolución** (Rojo): Devoluciones de depósitos
7. **Impuestos** (Gris): Pagos de impuestos
8. **Otro** (Gris): Otros conceptos no categorizados

## Integración con Sistemas Existentes

### 1. Reutilización de Componentes
- **DateSelector**: Reutilizado del componente Caja para mantener consistencia
- **PropertySelector**: Reutilizado del componente Ingresos
- **Estilos**: Utiliza las mismas clases de Tailwind y colores del sistema

### 2. Compatibilidad con APIs Existentes
- **getInmuebles**: Se integra con el endpoint existente de inmuebles
- **Formato de respuesta**: Mantiene la misma estructura que otras APIs

### 3. Datos Mockeados Específicos para Egresos
- **Conceptos realistas**: Mantenimiento, servicios públicos, suministros
- **Montos variados**: Desde gastos pequeños hasta impuestos importantes
- **Asociaciones**: Algunos egresos vinculados a reservas específicas

## Estructura de Datos

### Fuentes de Egresos
1. **Movimientos tipo "egreso"**:
   - Mantenimiento, limpieza, servicios públicos
   - Suministros, comisiones, devoluciones, impuestos

### Filtrado y Agrupación
- **Por fecha**: Todos los egresos del día seleccionado
- **Por inmueble**: Opcional, permite ver egresos de un inmueble específico
- **Ordenamiento**: Por fecha de creación (más recientes primero)

## Diferencias Clave con el Componente de Ingresos

### 1. Esquema de Colores
- **Egresos**: Rojos, naranjas y tonos cálidos para indicar salida de dinero
- **Montos**: Mostrados con signo negativo (-$XXX.XXX)

### 2. Conceptos Específicos
- **Egresos**: Conceptos orientados a gastos operativos
- **Sin pagos**: Solo movimientos de caja, no hay concepto de "pagos de reserva"

### 3. Badges y Visualización
- **Conceptos**: Cada tipo de egreso tiene un color distintivo
- **Indicadores**: Énfasis en la naturaleza del gasto

## Próximos Pasos

### 1. Integración con API Real
- Reemplazar datos mockeados con llamadas a la API externa
- Implementar manejo de errores robusto
- Agregar paginación si es necesario

### 2. Mejoras Potenciales
- Exportación de reportes (PDF, Excel)
- Filtros adicionales (rango de fechas, tipo de concepto)
- Gráficos comparativos ingresos vs egresos
- Búsqueda por texto

### 3. Optimizaciones
- Caché de datos para mejorar rendimiento
- Lazy loading para listas grandes
- Optimización de re-renders

## Archivos Modificados/Creados

### Nuevos Archivos
1. `src/interfaces/Egreso.ts`
2. `src/auth/egresosApi.ts`
3. `src/pages/api/egresos/getEgresos.ts`
4. `src/pages/api/egresos/getResumenEgresos.ts`
5. `src/pages/api/egresos/getInmueblesFiltro.ts`
6. `src/components/dashboard/ExpensesSummary.tsx`
7. `src/components/dashboard/ExpensesTable.tsx`
8. `src/components/dashboard/ExpenseDetailModal.tsx`

### Archivos Modificados
1. `src/components/organisms/SidebarMenu.tsx` (cambio "Deducibles" → "Egresos")
2. `src/app/dashboard/page.tsx` (cambio "Deducibles" → "Egresos")
3. `src/components/dashboard/Deductions.tsx` (contenido completamente reemplazado)

### Archivos Reutilizados
1. `src/components/dashboard/PropertySelector.tsx` (del módulo Ingresos)
2. `src/components/dashboard/DateSelector.tsx` (del módulo Caja)

## Conclusión

La implementación del componente de Egresos cumple con todos los objetivos planteados:

✅ **Cambio de nomenclatura**: "Deducibles" cambiado a "Egresos" en toda la interfaz
✅ **Funcionalidad completa**: Lista de egresos con filtrado por fecha e inmueble
✅ **Navegación por días**: Implementada con total de egresos diarios
✅ **Filtro por inmueble**: Funcionalidad completa con selector
✅ **Data mockeada**: Toda la funcionalidad usa datos mock a través de APIs internas
✅ **Documentación**: Documentación completa de cambios y nuevas funcionalidades
✅ **Consistencia**: Mantiene el mismo patrón y calidad que el componente de Ingresos
✅ **Diferenciación visual**: Esquema de colores apropiado para egresos

El componente está listo para uso inmediato y preparado para integración futura con APIs externas reales. La implementación sigue exactamente el mismo patrón que Ingresos, garantizando consistencia y mantenibilidad del código.