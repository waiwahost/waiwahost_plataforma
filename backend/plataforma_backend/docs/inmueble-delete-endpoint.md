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