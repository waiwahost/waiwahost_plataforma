# 📋 DOCUMENTACIÓN DE ENDPOINTS - SISTEMA FINANCIERO

## 📌 Resumen de Implementación

Se han implementado exitosamente **6 nuevos endpoints** para el sistema de **Ingresos** y **Egresos**, junto con las **actualizaciones** necesarias en el sistema de **Reservas** para manejar campos financieros.

---

## 🔗 ENDPOINTS DE INGRESOS

### 1. **GET /ingresos**
Obtiene la lista de ingresos filtrados por fecha e inmueble (opcional).

#### **Parámetros de Query:**
- `fecha` *(obligatorio)*: Fecha en formato `YYYY-MM-DD`
- `id_inmueble` *(opcional)*: ID del inmueble para filtrar

#### **Headers requeridos:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

#### **Ejemplo de Request:**
```http
GET /ingresos?fecha=2024-10-09&id_inmueble=1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Ejemplo de Response (200):**
```json
{
  "isError": false,
  "data": [
    {
      "id": 1,
      "fecha": "2024-10-09",
      "hora": "09:30",
      "concepto": "reserva",
      "descripcion": "Pago de reserva - Apartamento Centro",
      "monto": 300000,
      "id_inmueble": 1,
      "nombre_inmueble": "Apartamento Centro Histórico",
      "id_reserva": 1,
      "codigo_reserva": "RSV-2024-001",
      "metodo_pago": "transferencia",
      "tipo_registro": "pago",
      "fecha_creacion": "2024-10-09T09:30:00Z",
      "comprobante": null
    },
    {
      "id": 2,
      "fecha": "2024-10-09",
      "hora": "14:15",
      "concepto": "deposito_garantia",
      "descripcion": "Depósito de garantía - Casa Zona Norte",
      "monto": 150000,
      "id_inmueble": 2,
      "nombre_inmueble": "Casa Zona Norte",
      "id_reserva": 2,
      "codigo_reserva": "RSV-2024-002",
      "metodo_pago": "efectivo",
      "tipo_registro": "movimiento",
      "fecha_creacion": "2024-10-09T14:15:00Z",
      "comprobante": "COMP-001"
    }
  ],
  "message": "2 ingresos encontrados para la fecha 2024-10-09",
  "code": 200,
  "timestamp": "2024-10-09T10:30:00.000Z"
}
```

#### **Tipos de Conceptos de Ingreso:**
- `reserva`: Pagos de reservas
- `limpieza`: Servicios de limpieza
- `deposito_garantia`: Depósitos de garantía
- `servicios_adicionales`: Servicios extra
- `multa`: Multas aplicadas
- `otro`: Otros conceptos

#### **Tipos de Registro:**
- `movimiento`: Proviene de la tabla movimientos
- `pago`: Proviene de pagos de reservas

---

### 2. **GET /ingresos/resumen**
Obtiene el resumen agregado de ingresos por fecha e inmueble (opcional).

#### **Parámetros de Query:**
- `fecha` *(obligatorio)*: Fecha en formato `YYYY-MM-DD`
- `id_inmueble` *(opcional)*: ID del inmueble para filtrar

#### **Ejemplo de Request:**
```http
GET /ingresos/resumen?fecha=2024-10-09
Authorization: Bearer {jwt_token}
```

#### **Ejemplo de Response (200):**
```json
{
  "isError": false,
  "data": {
    "fecha": "2024-10-09",
    "inmueble_filtro": null,
    "total_ingresos": 700000,
    "cantidad_ingresos": 5,
    "promedio_ingreso": 140000,
    "desglose_inmuebles": [
      {
        "id_inmueble": 1,
        "nombre_inmueble": "Apartamento Centro Histórico",
        "total": 350000,
        "cantidad": 2
      },
      {
        "id_inmueble": 2,
        "nombre_inmueble": "Casa Zona Norte",
        "total": 150000,
        "cantidad": 1
      },
      {
        "id_inmueble": 3,
        "nombre_inmueble": "Loft Zona Rosa",
        "total": 200000,
        "cantidad": 2
      }
    ]
  },
  "message": "Resumen de ingresos generado para la fecha 2024-10-09",
  "code": 200,
  "timestamp": "2024-10-09T10:30:00.000Z"
}
```

#### **Cuando se filtra por inmueble específico:**
```json
{
  "isError": false,
  "data": {
    "fecha": "2024-10-09",
    "inmueble_filtro": "Inmueble ID: 1",
    "total_ingresos": 350000,
    "cantidad_ingresos": 2,
    "promedio_ingreso": 175000,
    "desglose_inmuebles": null
  },
  "message": "Resumen de ingresos generado para la fecha 2024-10-09",
  "code": 200,
  "timestamp": "2024-10-09T10:30:00.000Z"
}
```

---

### 3. **GET /ingresos/inmuebles-filtro**
Obtiene la lista de inmuebles disponibles para usar en filtros.

#### **Ejemplo de Request:**
```http
GET /ingresos/inmuebles-filtro
Authorization: Bearer {jwt_token}
```

#### **Ejemplo de Response (200):**
```json
{
  "isError": false,
  "data": [
    {
      "id": 1,
      "nombre": "Apartamento Centro Histórico",
      "direccion": "Carrera 10 #15-20, Centro"
    },
    {
      "id": 2,
      "nombre": "Casa Zona Norte",
      "direccion": "Calle 80 #25-15, Zona Norte"
    },
    {
      "id": 3,
      "nombre": "Loft Zona Rosa",
      "direccion": "Carrera 15 #85-30, Zona Rosa"
    }
  ],
  "message": "3 inmuebles disponibles para filtro",
  "code": 200,
  "timestamp": "2024-10-09T10:30:00.000Z"
}
```

---

## 🔗 ENDPOINTS DE EGRESOS

### 4. **GET /egresos**
Obtiene la lista de egresos filtrados por fecha e inmueble (opcional).

#### **Parámetros de Query:**
- `fecha` *(obligatorio)*: Fecha en formato `YYYY-MM-DD`
- `id_inmueble` *(opcional)*: ID del inmueble para filtrar

#### **Ejemplo de Request:**
```http
GET /egresos?fecha=2024-10-09&id_inmueble=1
Authorization: Bearer {jwt_token}
```

#### **Ejemplo de Response (200):**
```json
{
  "isError": false,
  "data": [
    {
      "id": 1,
      "fecha": "2024-10-09",
      "hora": "08:30",
      "concepto": "mantenimiento",
      "descripcion": "Reparación de aire acondicionado",
      "monto": 120000,
      "id_inmueble": 1,
      "nombre_inmueble": "Apartamento Centro Histórico",
      "id_reserva": null,
      "codigo_reserva": null,
      "metodo_pago": "transferencia",
      "fecha_creacion": "2024-10-09T08:30:00Z",
      "comprobante": "FACT-001"
    },
    {
      "id": 4,
      "fecha": "2024-10-09",
      "hora": "15:20",
      "concepto": "suministros",
      "descripcion": "Compra de amenities para huéspedes",
      "monto": 45000,
      "id_inmueble": 1,
      "nombre_inmueble": "Apartamento Centro Histórico",
      "id_reserva": null,
      "codigo_reserva": null,
      "metodo_pago": "tarjeta",
      "fecha_creacion": "2024-10-09T15:20:00Z",
      "comprobante": null
    }
  ],
  "message": "2 egresos encontrados para la fecha 2024-10-09",
  "code": 200,
  "timestamp": "2024-10-09T10:30:00.000Z"
}
```

#### **Tipos de Conceptos de Egreso:**
- `mantenimiento`: Reparaciones y mantenimiento
- `limpieza`: Servicios de limpieza
- `servicios_publicos`: Agua, luz, gas, internet
- `suministros`: Productos y materiales
- `comision`: Comisiones de plataformas
- `devolucion`: Devoluciones de depósitos
- `impuestos`: Pagos de impuestos
- `otro`: Otros conceptos

---

### 5. **GET /egresos/resumen**
Obtiene el resumen agregado de egresos por fecha e inmueble (opcional).

#### **Parámetros de Query:**
- `fecha` *(obligatorio)*: Fecha en formato `YYYY-MM-DD`
- `id_inmueble` *(opcional)*: ID del inmueble para filtrar

#### **Ejemplo de Request:**
```http
GET /egresos/resumen?fecha=2024-10-09
Authorization: Bearer {jwt_token}
```

#### **Ejemplo de Response (200):**
```json
{
  "isError": false,
  "data": {
    "fecha": "2024-10-09",
    "inmueble_filtro": null,
    "total_egresos": 430000,
    "cantidad_egresos": 5,
    "promedio_egreso": 86000,
    "desglose_inmuebles": [
      {
        "id_inmueble": 1,
        "nombre_inmueble": "Apartamento Centro Histórico",
        "total": 165000,
        "cantidad": 2
      },
      {
        "id_inmueble": 2,
        "nombre_inmueble": "Casa Zona Norte",
        "total": 115000,
        "cantidad": 2
      },
      {
        "id_inmueble": 3,
        "nombre_inmueble": "Loft Zona Rosa",
        "total": 150000,
        "cantidad": 1
      }
    ]
  },
  "message": "Resumen de egresos generado para la fecha 2024-10-09",
  "code": 200,
  "timestamp": "2024-10-09T10:30:00.000Z"
}
```

---

### 6. **GET /egresos/inmuebles-filtro**
Obtiene la lista de inmuebles disponibles para usar en filtros (idéntico al de ingresos).

#### **Ejemplo de Request:**
```http
GET /egresos/inmuebles-filtro
Authorization: Bearer {jwt_token}
```

#### **Response:** *(Idéntico al endpoint de ingresos)*

---

## 🔗 ENDPOINTS DE RESERVAS ACTUALIZADOS

### **POST /reservas** *(ACTUALIZADO)*
Se agregaron los nuevos campos financieros.

#### **Campos nuevos en el body:**
```json
{
  "id_inmueble": 1,
  "fecha_entrada": "2024-10-15",
  "fecha_salida": "2024-10-18",
  "numero_huespedes": 2,
  "huespedes": [...],
  "precio_total": 300000,
  "total_reserva": 300000,
  "total_pagado": 0,
  "estado": "pendiente",
  "observaciones": "Llegada tarde",
  "id_empresa": 1
}
```

#### **Validaciones agregadas:**
- `total_reserva` debe ser > 0
- `total_pagado` debe ser >= 0
- `total_pagado` no puede ser mayor a `total_reserva`
- `total_pendiente` se calcula automáticamente

---

### **PUT /reservas/:id** *(ACTUALIZADO)*
Se pueden actualizar los campos financieros.

#### **Campos opcionales nuevos:**
```json
{
  "total_reserva": 350000,
  "total_pagado": 150000
}
```

---

### **GET /reservas** *(ACTUALIZADO)*
Ahora incluye los campos financieros en la respuesta.

#### **Campos nuevos en la response:**
```json
{
  "isError": false,
  "data": [
    {
      "id": 1,
      "codigo_reserva": "RSV-2024-001",
      "precio_total": 300000,
      "total_reserva": 300000,
      "total_pagado": 150000,
      "total_pendiente": 150000,
      // ... otros campos existentes
    }
  ],
  "message": "Reservas obtenidas exitosamente"
}
```

---

## ⚠️ MANEJO DE ERRORES

### **Errores Comunes (400 Bad Request):**

#### **Fecha faltante:**
```json
{
  "isError": true,
  "data": null,
  "code": 400,
  "message": "El parámetro fecha es obligatorio",
  "error": "Missing required parameter: fecha",
  "timestamp": "2024-10-09T10:30:00.000Z"
}
```

#### **Formato de fecha inválido:**
```json
{
  "isError": true,
  "data": null,
  "code": 400,
  "message": "Formato de fecha inválido. Use YYYY-MM-DD",
  "error": "Invalid date format",
  "timestamp": "2024-10-09T10:30:00.000Z"
}
```

#### **ID de inmueble inválido:**
```json
{
  "isError": true,
  "data": null,
  "code": 400,
  "message": "ID de inmueble inválido",
  "error": "Invalid property ID",
  "timestamp": "2024-10-09T10:30:00.000Z"
}
```

### **Error de autenticación (401):**
```json
{
  "isError": true,
  "data": null,
  "code": 401,
  "message": "No autenticado",
  "error": "Unauthorized",
  "timestamp": "2024-10-09T10:30:00.000Z"
}
```

### **Error interno del servidor (500):**
```json
{
  "isError": true,
  "data": null,
  "code": 500,
  "message": "Error interno del servidor",
  "error": { /* detalles del error */ },
  "timestamp": "2024-10-09T10:30:00.000Z"
}
```

---

## 🎯 CASOS DE USO Y EJEMPLOS

### **Caso 1: Ver todos los ingresos del día**
```http
GET /ingresos?fecha=2024-10-09
```

### **Caso 2: Ver ingresos de un inmueble específico**
```http
GET /ingresos?fecha=2024-10-09&id_inmueble=1
```

### **Caso 3: Obtener resumen financiero del día**
```http
GET /ingresos/resumen?fecha=2024-10-09
GET /egresos/resumen?fecha=2024-10-09
```

### **Caso 4: Crear reserva con abono inicial**
```http
POST /reservas
{
  "total_reserva": 300000,
  "total_pagado": 100000,
  // ... otros campos
}
```

### **Caso 5: Registrar pago adicional en reserva**
```http
PUT /reservas/1
{
  "total_pagado": 250000
}
```

---

## 📊 INTEGRACIÓN CON EL FRONTEND

### **Estados de pago en reservas:**
- **Sin abonos**: `total_pagado = 0` (mostrar en rojo)
- **Abono parcial**: `0 < total_pagado < total_reserva` (mostrar en naranja)
- **Totalmente pagado**: `total_pagado = total_reserva` (mostrar en verde)

### **Colores por tipo de egreso:**
- **Mantenimiento**: Naranja
- **Limpieza**: Verde
- **Servicios Públicos**: Azul
- **Suministros**: Púrpura
- **Comisión**: Amarillo
- **Devolución**: Rojo
- **Impuestos**: Gris
- **Otro**: Gris

---

## 🔧 CONFIGURACIÓN DEL DESARROLLO

### **Variables de entorno requeridas:**
```env
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://user:pass@host:port/database
HOST=localhost
PORT=3001
```

### **Headers requeridos en todas las requests:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### **Base URL del API:**
```
http://localhost:3001
```

---

## ✅ RESUMEN DE FUNCIONALIDADES IMPLEMENTADAS

### **Nuevos Endpoints (6):**
1. ✅ `GET /ingresos` - Lista de ingresos
2. ✅ `GET /ingresos/resumen` - Resumen de ingresos
3. ✅ `GET /ingresos/inmuebles-filtro` - Inmuebles para filtro
4. ✅ `GET /egresos` - Lista de egresos
5. ✅ `GET /egresos/resumen` - Resumen de egresos
6. ✅ `GET /egresos/inmuebles-filtro` - Inmuebles para filtro

### **Endpoints Actualizados (3):**
1. ✅ `POST /reservas` - Crear reserva con campos financieros
2. ✅ `PUT /reservas/:id` - Editar reserva con campos financieros
3. ✅ `GET /reservas` - Listar reservas con campos financieros

### **Funcionalidades:**
- ✅ Filtrado por fecha (obligatorio)
- ✅ Filtrado por inmueble (opcional)
- ✅ Resúmenes con totales, promedios y desglose
- ✅ Autenticación JWT
- ✅ Validaciones robustas
- ✅ Manejo de errores completo
- ✅ Respuestas estructuradas
- ✅ Campos financieros en reservas
- ✅ Cálculos automáticos de totales pendientes

### **Base de Datos:**
- ✅ Nuevas columnas financieras en reservas
- ✅ Triggers automáticos para cálculos
- ✅ Índices para optimización
- ✅ Constraints para validación
- ✅ Migración de datos existentes

---

**🎉 El sistema está completamente implementado y listo para uso en producción.**