# Documentación de Endpoints - Inmuebles

## Descripción General
Los endpoints de inmuebles permiten realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre los inmuebles en el sistema. Todos los endpoints requieren autenticación mediante el middleware `authMiddleware`.

**URL Base:** `/api/inmuebles`

---

## 1. GET - Obtener Inmuebles
**Endpoint:** `GET /inmuebles/getInmuebles`

### Descripción
Obtiene todos los inmuebles de la empresa a la que pertenece el usuario que está consultando, o un inmueble específico si se proporciona el parámetro `id`.

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id_empresa` | number | No | ID de la empresa para filtrar inmuebles (solo para superadmin) |
| `id` | number | No | ID específico del inmueble a consultar |

### Headers Requeridos
```
Authorization: Bearer <token>
```

### Respuesta Exitosa (200)
```json
{
  "isError": false,
  "data": [
    {
      "id_inmueble": 1,
      "nombre": "Apartamento Centro",
      "descripcion": "Hermoso apartamento en el centro de la ciudad",
      "direccion": "Calle 123 #45-67",
      "capacidad": 4,
      "id_propietario": 1,
      "id_empresa": 1,
      "estado": "activo",
      "edificio": "Torre Central",
      "apartamento": "801",
      "id_prod_sigo": "APT001",
      "comision": 10.5,
      "precio_limpieza": 50000,
      "capacidad_maxima": 6,
      "nro_habitaciones": 2,
      "nro_bahnos": 2,
      "cocina": true,
      "empresa_nombre": "Inmobiliaria ABC",
      "propietario_nombre": "Juan Pérez",
      "propietario_email": "juan@email.com"
    }
  ]
}
```

### Respuesta para un inmueble específico (cuando se usa `?id=1`)
```json
{
  "isError": false,
  "data": {
    "id_inmueble": 1,
    "nombre": "Apartamento Centro",
    "descripcion": "Hermoso apartamento en el centro de la ciudad",
    "direccion": "Calle 123 #45-67",
    "capacidad": 4,
    "id_propietario": 1,
    "id_empresa": 1,
    "estado": "activo",
    "edificio": "Torre Central",
    "apartamento": "801",
    "id_prod_sigo": "APT001",
    "comision": 10.5,
    "precio_limpieza": 50000,
    "capacidad_maxima": 6,
    "nro_habitaciones": 2,
    "nro_bahnos": 2,
    "cocina": true,
    "empresa_nombre": "Inmobiliaria ABC",
    "propietario_nombre": "Juan Pérez",
    "propietario_email": "juan@email.com"
  }
}
```

### Respuestas de Error
```json
// 401 - No autenticado
{
  "isError": true,
  "message": "No autenticado",
  "code": 401,
  "error": "Unauthorized"
}

// 400 - Parámetros inválidos
{
  "isError": true,
  "message": "Parámetros de consulta inválidos",
  "code": 400,
  "error": [...]
}

// 404 - Inmueble no encontrado (cuando se usa ID específico)
{
  "isError": true,
  "message": "Inmueble no encontrado",
  "code": 404,
  "error": "INMUEBLE_NOT_FOUND"
}
```

---

## 2. POST - Crear Inmueble
**Endpoint:** `POST /inmuebles/createInmueble`

### Descripción
Crea un nuevo registro en base de datos de un nuevo inmueble.

### Headers Requeridos
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `nombre` | string | Sí | Nombre del inmueble |
| `descripcion` | string | No | Descripción del inmueble |
| `direccion` | string | Sí | Dirección física del inmueble |
| `capacidad` | number | Sí | Capacidad básica del inmueble (debe ser > 0) |
| `id_propietario` | number | Sí | ID del propietario del inmueble |
| `id_empresa` | number | No | ID de la empresa (opcional) |
| `edificio` | string | No | Nombre del edificio |
| `apartamento` | string | No | Número de apartamento |
| `id_prod_sigo` | string | No | ID de producto SIGO |
| `comision` | number | No | Comisión en porcentaje |
| `precio_limpieza` | number | No | Precio de limpieza |
| `capacidad_maxima` | number | No | Capacidad máxima del inmueble |
| `nro_habitaciones` | number | No | Número de habitaciones |
| `nro_bahnos` | number | No | Número de baños |
| `cocina` | boolean | No | Indica si tiene cocina |

### Ejemplo de Request Body
```json
{
  "nombre": "Apartamento Centro",
  "descripcion": "Hermoso apartamento en el centro de la ciudad",
  "direccion": "Calle 123 #45-67",
  "capacidad": 4,
  "id_propietario": 1,
  "id_empresa": 1,
  "edificio": "Torre Central",
  "apartamento": "801",
  "id_prod_sigo": "APT001",
  "comision": 10.5,
  "precio_limpieza": 50000,
  "capacidad_maxima": 6,
  "nro_habitaciones": 2,
  "nro_bahnos": 2,
  "cocina": true
}
```

### Respuesta Exitosa (201)
```json
{
  "isError": false,
  "data": {
    "id_inmueble": 1,
    "nombre": "Apartamento Centro",
    "descripcion": "Hermoso apartamento en el centro de la ciudad",
    "direccion": "Calle 123 #45-67",
    "capacidad": 4,
    "id_propietario": 1,
    "id_empresa": 1,
    "estado": "activo",
    "edificio": "Torre Central",
    "apartamento": "801",
    "id_prod_sigo": "APT001",
    "comision": 10.5,
    "precio_limpieza": 50000,
    "capacidad_maxima": 6,
    "nro_habitaciones": 2,
    "nro_bahnos": 2,
    "cocina": true
  }
}
```

### Respuestas de Error
```json
// 400 - Propietario no existe
{
  "isError": true,
  "message": "El propietario especificado no existe",
  "code": 400,
  "error": "PROPIETARIO_NOT_FOUND"
}

// 400 - Datos inválidos
{
  "isError": true,
  "message": "Datos de inmueble inválidos",
  "code": 400,
  "error": [...]
}
```

---

## 3. PUT - Editar Inmueble
**Endpoint:** `PUT /inmuebles/editInmueble?id=IDINMUEBLE`

### Descripción
Edita un inmueble existente. Puede editar uno o varios datos. El campo `id_inmueble` no se puede editar.

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | number | Sí | ID del inmueble a editar |

### Headers Requeridos
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
Todos los campos son opcionales excepto que al menos uno debe estar presente:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | string | Nombre del inmueble |
| `descripcion` | string | Descripción del inmueble |
| `direccion` | string | Dirección física del inmueble |
| `capacidad` | number | Capacidad básica del inmueble |
| `id_propietario` | number | ID del propietario del inmueble |
| `id_empresa` | number | ID de la empresa |
| `estado` | string | Estado del inmueble ("activo" o "inactivo") |
| `edificio` | string | Nombre del edificio |
| `apartamento` | string | Número de apartamento |
| `id_prod_sigo` | string | ID de producto SIGO |
| `comision` | number | Comisión en porcentaje |
| `precio_limpieza` | number | Precio de limpieza |
| `capacidad_maxima` | number | Capacidad máxima del inmueble |
| `nro_habitaciones` | number | Número de habitaciones |
| `nro_bahnos` | number | Número de baños |
| `cocina` | boolean | Indica si tiene cocina |

### Ejemplo de Request Body
```json
{
  "nombre": "Apartamento Centro Renovado",
  "precio_limpieza": 60000,
  "nro_habitaciones": 3
}
```

### Respuesta Exitosa (200)
```json
{
  "isError": false,
  "data": {
    "id_inmueble": 1,
    "nombre": "Apartamento Centro Renovado",
    "descripcion": "Hermoso apartamento en el centro de la ciudad",
    "direccion": "Calle 123 #45-67",
    "capacidad": 4,
    "id_propietario": 1,
    "id_empresa": 1,
    "estado": "activo",
    "edificio": "Torre Central",
    "apartamento": "801",
    "id_prod_sigo": "APT001",
    "comision": 10.5,
    "precio_limpieza": 60000,
    "capacidad_maxima": 6,
    "nro_habitaciones": 3,
    "nro_bahnos": 2,
    "cocina": true
  }
}
```

### Respuestas de Error
```json
// 404 - Inmueble no encontrado
{
  "isError": true,
  "message": "El inmueble especificado no existe",
  "code": 404,
  "error": "INMUEBLE_NOT_FOUND"
}

// 400 - ID inválido
{
  "isError": true,
  "message": "ID de inmueble inválido",
  "code": 400,
  "error": [...]
}
```

---

## 4. DELETE - Eliminar Inmueble
**Endpoint:** `DELETE /inmuebles/deleteInmueble?id=IDINMUEBLE`

### Descripción
Elimina un inmueble existente mediante eliminación lógica (cambia el estado a "inactivo", no lo elimina físicamente de la base de datos).

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | number | Sí | ID del inmueble a eliminar |

### Headers Requeridos
```
Authorization: Bearer <token>
```

### Body
No requiere body.

### Respuesta Exitosa (200)
```json
{
  "isError": false,
  "data": {
    "id_inmueble": 1,
    "nombre": "Apartamento Centro",
    "descripcion": "Hermoso apartamento en el centro de la ciudad",
    "direccion": "Calle 123 #45-67",
    "capacidad": 4,
    "id_propietario": 1,
    "id_empresa": 1,
    "estado": "inactivo",
    "edificio": "Torre Central",
    "apartamento": "801",
    "id_prod_sigo": "APT001",
    "comision": 10.5,
    "precio_limpieza": 50000,
    "capacidad_maxima": 6,
    "nro_habitaciones": 2,
    "nro_bahnos": 2,
    "cocina": true
  }
}
```

### Respuestas de Error
```json
// 404 - Inmueble no encontrado
{
  "isError": true,
  "message": "El inmueble especificado no existe",
  "code": 404,
  "error": "INMUEBLE_NOT_FOUND"
}

// 400 - ID inválido
{
  "isError": true,
  "message": "ID de inmueble inválido",
  "code": 400,
  "error": [...]
}
```

---

## 5. GET - Obtener Inmueble Específico
**Endpoint:** `GET /inmuebles/getInmuebles?id=IDINMUEBLE`

### Descripción
Obtiene la información de un inmueble específico usando el mismo endpoint que la lista general pero con el parámetro `id`.

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | number | Sí | ID del inmueble específico a consultar |

### Headers Requeridos
```
Authorization: Bearer <token>
```

### Respuesta Exitosa (200)
```json
{
  "isError": false,
  "data": {
    "id_inmueble": 1,
    "nombre": "Apartamento Centro",
    "descripcion": "Hermoso apartamento en el centro de la ciudad",
    "direccion": "Calle 123 #45-67",
    "capacidad": 4,
    "id_propietario": 1,
    "id_empresa": 1,
    "estado": "activo",
    "edificio": "Torre Central",
    "apartamento": "801",
    "id_prod_sigo": "APT001",
    "comision": 10.5,
    "precio_limpieza": 50000,
    "capacidad_maxima": 6,
    "nro_habitaciones": 2,
    "nro_bahnos": 2,
    "cocina": true,
    "empresa_nombre": "Inmobiliaria ABC",
    "propietario_nombre": "Juan Pérez",
    "propietario_email": "juan@email.com"
  }
}
```

---

## Notas Importantes

### Autenticación
Todos los endpoints requieren un token de autenticación válido en el header `Authorization: Bearer <token>`.

### Permisos por Rol
- **Superadmin**: Puede ver, crear, editar y eliminar inmuebles de cualquier empresa
- **Empresa/Administrador**: Puede ver, crear, editar y eliminar inmuebles solo de su propia empresa
- **Propietario**: Puede ver inmuebles de su empresa y que le pertenezcan

### Validaciones
- Todos los campos de tipo `number` deben ser números válidos
- Los campos requeridos deben estar presentes en las operaciones de creación
- El `id_propietario` debe existir en la base de datos
- La `capacidad` debe ser mayor a 0

### Estructura de Respuesta Estándar
Todas las respuestas siguen la estructura:
```json
{
  "isError": boolean,
  "data": any,
  "message"?: string,
  "code"?: number,
  "error"?: any
}
```

### Base de Datos
Los inmuebles se almacenan en la tabla `inmuebles` con todas las columnas mencionadas. La eliminación es lógica, cambiando el estado a "inactivo".



# Inmueble DELETE Endpoint

## Endpoint: DELETE /inmuebles/:id

### Description
Performs logical deletion of a property (inmueble) by setting its status to 'inactivo'.

### Authentication
- Requires JWT authentication via Authorization header or token
- User must be logged in

### Parameters
- **id** (path parameter): The ID of the property to delete

### Permissions
- **Superadmin**: Can delete any property
- **Empresa/Admin**: Can only delete properties from their company
- **Propietario**: Cannot delete properties (403 Forbidden)

### Responses

#### Success (200 OK)
```json
{
  "isError": false,
  "data": {
    "success": true,
    "message": "Inmueble eliminado correctamente"
  },
  "code": 200,
  "timestamp": "2024-06-28T21:30:00.000Z"
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "isError": true,
  "data": null,
  "code": 401,
  "message": "No autenticado",
  "error": "Unauthorized",
  "timestamp": "2024-06-28T21:30:00.000Z"
}
```

**400 Bad Request**
```json
{
  "isError": true,
  "data": null,
  "code": 400,
  "message": "ID de inmueble inválido",
  "timestamp": "2024-06-28T21:30:00.000Z"
}
```

**403 Forbidden**
```json
{
  "isError": true,
  "data": null,
  "code": 403,
  "message": "No tiene permisos para eliminar inmuebles",
  "timestamp": "2024-06-28T21:30:00.000Z"
}
```

**404 Not Found**
```json
{
  "isError": true,
  "data": null,
  "code": 404,
  "message": "Inmueble no encontrado o ya inactivo",
  "timestamp": "2024-06-28T21:30:00.000Z"
}
```

### Example Usage

```bash
# Delete property with ID 123
curl -X DELETE http://localhost:3001/inmuebles/123 \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Implementation Details
- Uses logical deletion (sets `estado = 'inactivo'`)
- Validates user permissions based on role and company association
- Only deletes properties that are currently 'activo'
- Returns 404 if property is already deleted/inactive