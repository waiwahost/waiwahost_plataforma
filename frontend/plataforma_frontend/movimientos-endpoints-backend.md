# 📊 DOCUMENTACIÓN API - SISTEMA DE MOVIMIENTOS FINANCIEROS

## 📋 Resumen

Se ha implementado un sistema completo de gestión de movimientos financieros (caja diaria) que permite registrar, consultar y gestionar todos los ingresos y egresos de los inmuebles por empresa. El sistema incluye validaciones robustas, cálculos automáticos de resúmenes y navegación temporal.

---

## 🏗️ **ARQUITECTURA IMPLEMENTADA**

### **Componentes Creados/Modificados:**

✅ **Interfaces**: `movimiento.interface.ts`  
✅ **Schemas**: `movimiento.schema.ts`  
✅ **Repository**: `movimientos.repository.ts`  
✅ **Services**: 8 servicios modulares en `/services/movimientos/`  
✅ **Controller**: `movimientos.controller.ts`  
✅ **Routes**: `movimientos.routes.ts` + modificación de `inmuebles.routes.ts`  
✅ **Database**: Scripts SQL para tabla y datos de prueba  
✅ **Integration**: Registro en `index.ts` del servidor principal  

---

## 🚀 **ENDPOINTS IMPLEMENTADOS**

### **1. Obtener Movimientos por Fecha**
```http
GET /movimientos/fecha/{fecha}?empresa_id={empresa_id}
```

**Descripción**: Obtiene todos los movimientos de una empresa para una fecha específica

**Parámetros**:
- `fecha` (path): Fecha en formato YYYY-MM-DD
- `empresa_id` (query): ID de la empresa

**Ejemplo Request**:
```
GET /movimientos/fecha/2025-10-09?empresa_id=1
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "isError": false,
  "data": [
    {
      "id": "mov_001",
      "fecha": "2025-10-09",
      "tipo": "ingreso",
      "concepto": "reserva", 
      "descripcion": "Pago inicial reserva RSV-2025-001",
      "monto": 200000,
      "id_inmueble": "1",
      "nombre_inmueble": "Apartamento Centro 101",
      "id_reserva": "1",
      "codigo_reserva": "RSV-2025-001",
      "metodo_pago": "transferencia",
      "comprobante": "TRF-001234",
      "id_empresa": "1",
      "fecha_creacion": "2025-10-09T08:30:00.000Z",
      "fecha_actualizacion": "2025-10-09T08:30:00.000Z"
    }
  ],
  "code": 200,
  "timestamp": "2025-10-09T12:00:00.000Z"
}
```

---

### **2. Obtener Movimientos por Inmueble y Fecha**
```http
GET /movimientos/inmueble?id_inmueble={id}&fecha={fecha}
```

**Descripción**: Obtiene movimientos de un inmueble específico para una fecha con resumen automático

**Parámetros**:
- `id_inmueble` (query): ID del inmueble
- `fecha` (query): Fecha en formato YYYY-MM-DD

**Ejemplo Request**:
```
GET /movimientos/inmueble?id_inmueble=1&fecha=2025-10-09
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "isError": false,
  "data": {
    "ingresos": 350000,
    "egresos": 50000,
    "movimientos": [
      {
        "id": "mov_001",
        "fecha": "2025-10-09",
        "tipo": "ingreso",
        "concepto": "reserva",
        "descripcion": "Pago inicial reserva RSV-2025-001",
        "monto": 200000,
        "id_inmueble": "1",
        "nombre_inmueble": "Apartamento Centro 101",
        "id_reserva": "1", 
        "codigo_reserva": "RSV-2025-001",
        "metodo_pago": "transferencia",
        "comprobante": "TRF-001234",
        "id_empresa": "1",
        "fecha_creacion": "2025-10-09T08:30:00.000Z",
        "fecha_actualizacion": "2025-10-09T08:30:00.000Z"
      }
    ]
  },
  "code": 200,
  "timestamp": "2025-10-09T12:00:00.000Z"
}
```

---

### **3. Obtener Resumen Diario**
```http
GET /movimientos/resumen/{fecha}?empresa_id={empresa_id}
```

**Descripción**: Obtiene resumen financiero consolidado de una empresa para una fecha

**Parámetros**:
- `fecha` (path): Fecha en formato YYYY-MM-DD
- `empresa_id` (query): ID de la empresa

**Ejemplo Request**:
```
GET /movimientos/resumen/2025-10-09?empresa_id=1
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "isError": false,
  "data": {
    "fecha": "2025-10-09",
    "total_ingresos": 675000,
    "total_egresos": 95000,
    "balance": 580000,
    "cantidad_movimientos": 6
  },
  "code": 200,
  "timestamp": "2025-10-09T12:00:00.000Z"
}
```

---

### **4. Crear Movimiento**
```http
POST /movimientos
```

**Descripción**: Crea un nuevo movimiento financiero

**Body (JSON)**:
```json
{
  "fecha": "2025-10-09",
  "tipo": "ingreso",
  "concepto": "reserva",
  "descripcion": "Pago reserva - Check-in apartamento",
  "monto": 250000,
  "id_inmueble": "1",
  "id_reserva": "1",
  "metodo_pago": "transferencia", 
  "comprobante": "TRF-001234",
  "id_empresa": "1"
}
```

**Validaciones Aplicadas**:
- ✅ `fecha`: Requerida, formato YYYY-MM-DD, no futura
- ✅ `tipo`: Requerido, 'ingreso' o 'egreso'
- ✅ `concepto`: Requerido, debe ser válido según el tipo
- ✅ `descripcion`: Requerida, mínimo 3 caracteres
- ✅ `monto`: Requerido, mayor a 0
- ✅ `id_inmueble`: Requerido, debe existir en la empresa
- ✅ `id_reserva`: Opcional, debe existir si se envía
- ✅ `metodo_pago`: Requerido, valores válidos
- ✅ `id_empresa`: Requerido, debe existir

**Conceptos Válidos por Tipo**:

**INGRESOS**: `reserva`, `limpieza`, `deposito_garantia`, `servicios_adicionales`, `multa`, `otro`

**EGRESOS**: `mantenimiento`, `limpieza`, `servicios_publicos`, `suministros`, `comision`, `devolucion`, `impuestos`, `otro`

**Respuesta Exitosa (201)**:
```json
{
  "isError": false,
  "data": {
    "id": "mov_123",
    "fecha": "2025-10-09",
    "tipo": "ingreso",
    "concepto": "reserva",
    "descripcion": "Pago reserva - Check-in apartamento",
    "monto": 250000,
    "id_inmueble": "1",
    "nombre_inmueble": "Apartamento Centro 101",
    "id_reserva": "1",
    "codigo_reserva": "RSV-2025-001",
    "metodo_pago": "transferencia",
    "comprobante": "TRF-001234",
    "id_empresa": "1",
    "fecha_creacion": "2025-10-09T10:15:00.000Z",
    "fecha_actualizacion": "2025-10-09T10:15:00.000Z"
  },
  "code": 201,
  "timestamp": "2025-10-09T12:00:00.000Z"
}
```

---

### **5. Actualizar Movimiento**
```http
PUT /movimientos/{id}
```

**Descripción**: Actualiza un movimiento existente

**Parámetros**:
- `id` (path): ID del movimiento a actualizar

**Body (JSON)** - Todos los campos son opcionales:
```json
{
  "fecha": "2025-10-09",
  "tipo": "ingreso",
  "concepto": "deposito_garantia",
  "descripcion": "Descripción actualizada",
  "monto": 300000,
  "metodo_pago": "efectivo",
  "comprobante": "EFE-001"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "isError": false,
  "data": {
    // Objeto movimiento actualizado completo
  },
  "code": 200,
  "timestamp": "2025-10-09T12:00:00.000Z"
}
```

---

### **6. Obtener Movimiento por ID**
```http
GET /movimientos/{id}
```

**Descripción**: Obtiene un movimiento específico por su ID

**Parámetros**:
- `id` (path): ID del movimiento

**Ejemplo Request**:
```
GET /movimientos/mov_123
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "isError": false,
  "data": {
    // Objeto movimiento completo con JOINs
  },
  "code": 200,
  "timestamp": "2025-10-09T12:00:00.000Z"
}
```

---

### **7. Eliminar Movimiento**
```http
DELETE /movimientos/{id}
```

**Descripción**: Elimina un movimiento de forma permanente

**Parámetros**:
- `id` (path): ID del movimiento a eliminar

**Ejemplo Request**:
```
DELETE /movimientos/mov_123
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "isError": false,
  "data": null,
  "code": 200,
  "timestamp": "2025-10-09T12:00:00.000Z"
}
```

---

### **8. Obtener Inmuebles para Selector**
```http
GET /inmuebles/selector?empresa_id={empresa_id}
```

**Descripción**: Obtiene lista simplificada de inmuebles activos para formularios

**Parámetros**:
- `empresa_id` (query): ID de la empresa

**Ejemplo Request**:
```
GET /inmuebles/selector?empresa_id=1
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "isError": false,
  "data": [
    {
      "id": "1",
      "nombre": "Apartamento Centro 101",
      "direccion": "Carrera 7 # 26-85",
      "estado": "activo"
    },
    {
      "id": "2", 
      "nombre": "Casa Familiar Norte",
      "direccion": "Calle 85 # 15-30",
      "estado": "activo"
    }
  ],
  "code": 200,
  "timestamp": "2025-10-09T12:00:00.000Z"
}
```

---

## 🔒 **SEGURIDAD Y AUTENTICACIÓN**

### **Middleware Aplicado**:
- ✅ **Authentication**: Todos los endpoints requieren `Bearer token`
- ✅ **Authorization**: Validación de contexto de usuario
- ✅ **Input Validation**: Validación exhaustiva con Zod schemas
- ✅ **Business Rules**: Validaciones de integridad de datos

### **Permisos Requeridos**:
- Usuario autenticado con token válido
- Acceso a la empresa especificada en los parámetros

---

## ❌ **RESPUESTAS DE ERROR ESTÁNDAR**

### **400 - Bad Request**
```json
{
  "isError": true,
  "data": null,
  "code": 400,
  "message": "Datos de movimiento inválidos",
  "error": [
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "string",
      "path": ["monto"],
      "message": "Expected number, received string"
    }
  ],
  "timestamp": "2025-10-09T12:00:00.000Z"
}
```

### **401 - Unauthorized**
```json
{
  "isError": true,
  "data": null,
  "code": 401,
  "message": "No autenticado",
  "error": "Unauthorized",
  "timestamp": "2025-10-09T12:00:00.000Z"
}
```

### **404 - Not Found**
```json
{
  "isError": true,
  "data": null,
  "code": 404,
  "message": "Movimiento no encontrado",
  "error": "El movimiento especificado no existe",
  "timestamp": "2025-10-09T12:00:00.000Z"
}
```

### **500 - Internal Server Error**
```json
{
  "isError": true,
  "data": null,
  "code": 500,
  "message": "Error interno del servidor",
  "error": "Database connection failed",
  "timestamp": "2025-10-09T12:00:00.000Z"
}
```

---

## 💾 **BASE DE DATOS**

### **Tabla Creada**: `movimientos`

**Estructura**:
```sql
CREATE TABLE movimientos (
    id VARCHAR PRIMARY KEY,
    fecha DATE NOT NULL,                                    -- Solo fecha (YYYY-MM-DD)
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    concepto VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    monto DECIMAL(15,2) NOT NULL CHECK (monto > 0),
    id_inmueble VARCHAR NOT NULL,                           -- FK a inmuebles
    id_reserva VARCHAR NULL,                                -- FK a reservas (opcional)
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'otro')),
    comprobante VARCHAR(100) NULL,
    id_empresa VARCHAR NOT NULL,                            -- FK a empresas
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Hora exacta
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Índices Optimizados**:
- ✅ `idx_movimientos_fecha` - Para filtros por fecha
- ✅ `idx_movimientos_fecha_empresa` - Para consultas combinadas
- ✅ `idx_movimientos_inmueble` - Para filtros por inmueble
- ✅ `idx_movimientos_reserva` - Para relaciones con reservas
- ✅ `idx_movimientos_empresa` - Para filtros por empresa

### **Triggers Implementados**:
- ✅ **Auto-update**: `fecha_actualizacion` se actualiza automáticamente
- ✅ **Concept Validation**: Valida conceptos según tipo de movimiento
- ✅ **Date Validation**: Evita fechas futuras

### **Scripts Proporcionados**:
- ✅ `create_movimientos_table.sql` - Creación completa de tabla
- ✅ `datos_prueba_movimientos.sql` - 20+ registros de prueba realistas

---

## 📊 **EJEMPLOS DE USO**

### **1. Flujo de Consulta Diaria**
```bash
# 1. Obtener resumen del día
GET /movimientos/resumen/2025-10-09?empresa_id=1

# 2. Obtener movimientos detallados
GET /movimientos/fecha/2025-10-09?empresa_id=1

# 3. Filtrar por inmueble específico  
GET /movimientos/inmueble?id_inmueble=1&fecha=2025-10-09
```

### **2. Flujo de Creación de Movimiento**
```bash
# 1. Obtener inmuebles disponibles
GET /inmuebles/selector?empresa_id=1

# 2. Crear movimiento
POST /movimientos
{
  "fecha": "2025-10-09",
  "tipo": "ingreso", 
  "concepto": "reserva",
  "descripcion": "Pago inicial reserva",
  "monto": 250000,
  "id_inmueble": "1",
  "metodo_pago": "transferencia",
  "id_empresa": "1"
}

# 3. Verificar creación
GET /movimientos/{nuevo_id}
```

### **3. Flujo de Gestión de Movimiento**
```bash
# 1. Obtener movimiento existente
GET /movimientos/mov_123

# 2. Actualizar información
PUT /movimientos/mov_123
{
  "descripcion": "Descripción actualizada",
  "monto": 300000
}

# 3. Eliminar si es necesario
DELETE /movimientos/mov_123
```

---

## 🔍 **CONSULTAS SQL ÚTILES**

### **Resumen por Período**
```sql
SELECT 
    fecha,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as ingresos,
    SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as egresos,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) as balance
FROM movimientos 
WHERE fecha BETWEEN '2025-10-01' AND '2025-10-09'
    AND id_empresa = '1'
GROUP BY fecha 
ORDER BY fecha DESC;
```

### **Top Conceptos por Empresa**
```sql
SELECT 
    tipo,
    concepto,
    COUNT(*) as cantidad,
    SUM(monto) as total
FROM movimientos 
WHERE id_empresa = '1'
GROUP BY tipo, concepto 
ORDER BY total DESC;
```

---

## ✅ **TESTING Y VALIDACIÓN**

### **Casos de Prueba Implementados**:

1. **✅ Validación de Fechas**
   - Formato correcto YYYY-MM-DD
   - Restricción de fechas futuras
   - Manejo de fechas límite

2. **✅ Validación de Conceptos**
   - Conceptos válidos por tipo
   - Rechazo de conceptos inválidos
   - Validación cruzada tipo-concepto

3. **✅ Validación de Referencias**
   - Existencia de inmuebles
   - Existencia de reservas (opcional)
   - Pertenencia a empresa correcta

4. **✅ Validación de Montos**
   - Montos positivos únicamente
   - Formato decimal correcto
   - Límites de precisión

5. **✅ Cálculos Automáticos**
   - Resúmenes por fecha
   - Balances por inmueble
   - Totales por período

### **Datos de Prueba Disponibles**:
- ✅ 20+ movimientos distribuidos en 7 días
- ✅ 3 inmuebles con actividad variada
- ✅ Todos los tipos y conceptos representados
- ✅ Diferentes métodos de pago
- ✅ Montos realistas y variados

---

## 🚀 **SIGUIENTES PASOS RECOMENDADOS**

### **Mejoras Futuras Sugeridas**:

1. **📈 Analytics Avanzados**
   - Endpoints de reportes por rangos
   - Gráficos de tendencias
   - Comparativas período anterior

2. **📄 Exportación de Datos**
   - Reportes en PDF
   - Exportación a Excel
   - Integración con contabilidad

3. **🔔 Notificaciones**
   - Alertas por montos altos
   - Resúmenes diarios automáticos
   - Notificaciones de límites

4. **🔍 Filtros Avanzados**
   - Búsqueda por texto
   - Filtros combinados
   - Ordenamiento personalizado

5. **💰 Funciones Financieras**
   - Proyecciones de ingresos
   - Análisis de rentabilidad
   - Métricas de performance

---

## 📞 **SOPORTE Y MANTENIMIENTO**

### **Logs y Debugging**:
- ✅ Logging completo en todos los servicios
- ✅ Manejo de errores estandarizado
- ✅ Trazabilidad de operaciones

### **Monitoreo**:
- ✅ Respuestas HTTP estándar
- ✅ Timestamps en todas las respuestas
- ✅ Códigos de error específicos

### **Backup y Seguridad**:
- ✅ Operaciones transaccionales
- ✅ Validación de integridad
- ✅ Auditoría de cambios (fecha_actualizacion)

---

**🎯 El sistema está completamente funcional y listo para producción con todas las validaciones, documentación y casos de prueba implementados.**