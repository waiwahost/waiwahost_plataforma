---
description: Cómo crear un nuevo endpoint en el backend Waiwa siguiendo la arquitectura limpia en capas (Fastify + TypeScript + PostgreSQL)
---

# Workflow: Crear Nuevo Endpoint

Sigue este orden EXACTO al crear cualquier nueva ruta o funcionalidad en el backend Waiwa.
Este workflow aplica tanto si es un módulo nuevo como si se agrega un endpoint a uno existente.

---

## Paso 1 — INTERFACE (`interfaces/[entidad].interface.ts`)

Define o actualiza los tipos TypeScript de la entidad.

- Crea la interfaz base: `export interface Entidad { ... }`
- Crea el DTO de creación: `export interface CreateEntidadData { ... }`
- Crea el DTO de edición (todos los campos opcionales): `export interface EditEntidadData { ... }`
- Exporta alias si hace falta: `export type EntidadUpdate = EditEntidadData;`
- Los campos opcionales en BD usan `?`. Los `id` generados por la BD también son opcionales.
- Los valores de enums deben coincidir EXACTAMENTE con los valores en la base de datos.

---

## Paso 2 — SCHEMA (`schemas/[entidad].schema.ts`)

Define los schemas de validación Zod por tipo de operación.

- `[Entidad]QuerySchema` → para GET con query params. Usar `.strict()` y `.transform()` para convertir strings a números.
- `Create[Entidad]Schema` → para POST. Usar `.superRefine()` para validaciones condicionales.
- `Edit[Entidad]Schema` → para PUT. Todos los campos como `.optional()`.
- `[Entidad]QueryByIdSchema` → para endpoints que reciben un `id` en query param.
- Exporta los tipos inferidos cuando sean necesarios: `export type EntidadUpdate = z.infer<typeof Edit[Entidad]Schema>;`
- NUNCA hagas validaciones de negocio o permisos aquí. Solo validación de estructura y tipos.

---

## Paso 3 — REPOSITORY (`repositories/[entidad].repository.ts`)

Agrega los métodos de acceso a base de datos necesarios para el nuevo endpoint.

- Importa `pool` desde `'../libs/db'` y los tipos de la Interface.
- Cada método retorna `Promise<{ data: Tipo | null; error: any }>`.
- Usa parámetros posicionales `$1, $2...` para prevenir SQL injection.
- INSERT y UPDATE deben terminar con `RETURNING *`.
- El "borrado" es lógico: `UPDATE tabla SET estado = 'inactivo' WHERE id = $1 RETURNING *`. Nunca `DELETE FROM`.
- Usa `try/catch` en cada método. En el `catch`, retorna `{ data: null, error }`.
- Agrupa TODOS los métodos de una entidad en un solo archivo de repository.

---

## Paso 4 — SERVICE (`services/[entidad]/[accion][Entidad]Service.ts`)

Crea un archivo de servicio por acción de negocio.

- Importa el Repository y los constantes de roles: `import { ROLES } from '../../constants/globalConstants';`
- La clase recibe `userContext` y aplica lógica diferenciada por rol:
  - `ROLES.SUPERADMIN` → acceso total, puede filtrar por empresa opcional.
  - `ROLES.EMPRESA` / `ROLES.ADMINISTRADOR` → solo su empresa.
  - `ROLES.PROPIETARIO` → solo su empresa y sus inmuebles.
- El método principal se llama `execute(userContext, params...)`.
- Retorna siempre `{ data, error: null }` o `{ data: null, error: { status, message, details } }`.
- Al final del archivo, exporta una instancia singleton: `export const miServicio = new MiServicioClass();`
- NUNCA escribas SQL aquí. Solo llama al Repository.

---

## Paso 5 — CONTROLLER (`controllers/[entidad].controller.ts`)

Agrega el método al objeto controller de la entidad.

- Primero verifica autenticación: `const ctx = req.userContext; if (!ctx || !ctx.id) return reply.status(401).send(errorResponse(...));`
- Valida query params con `QuerySchema.safeParse(req.query)`.
- Valida body con `CreateSchema.safeParse(req.body)` o `EditSchema.safeParse(req.body)`.
- Si la validación falla: `return reply.status(400).send(errorResponse({ message: '...', code: 400, error: validation.error.errors }));`
- Llama al servicio pasando `ctx` y los datos validados.
- Si el servicio retorna error: `return reply.status(error.status || 500).send(errorResponse(...));`
- Si el servicio retorna datos: `return reply.send(successResponse(data));` o `reply.status(201).send(successResponse(data, 201));` para POST.
- Envuelve todo en `try/catch` y retorna `500` en caso de error inesperado.
- NUNCA escribas SQL ni lógica de negocio aquí.

---

## Paso 6 — ROUTE (`routes/[entidad].routes.ts`)

Agrega el endpoint al archivo de rutas de la entidad.

- Registra el endpoint con el verbo HTTP correcto: `GET`, `POST`, `PUT`, `DELETE`.
- Si requiere autenticación: `{ preHandler: [authMiddleware] }`.
- Si es pública: pasa `{}` como segundo argumento.
- Agrega un comentario descriptivo encima de cada ruta.

```typescript
// GET /entidad/getEntidades - Descripción del endpoint
server.get('/getEntidades', { preHandler: [authMiddleware] }, entidadController.getEntidades);
```

Si es un módulo nuevo, registra las rutas en `index.ts`:
```typescript
server.register(entidadRoutes, { prefix: '/api/entidad' });
```

---

## Paso 7 — SWAGGER (Documentación del Endpoint)

Documenta el nuevo endpoint con JSDoc / Swagger inline en el controller o en un archivo `swagger/[entidad].swagger.ts`.

Agrega la anotación encima del método del controller o en la ruta:

```typescript
/**
 * @swagger
 * /api/entidad/getEntidades:
 *   get:
 *     summary: Obtiene la lista de entidades según el rol del usuario
 *     tags: [Entidad]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: ID opcional de la entidad específica
 *     responses:
 *       200:
 *         description: Lista de entidades obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *       400:
 *         description: Parámetros de consulta inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos para este recurso
 *       500:
 *         description: Error interno del servidor
 */
```

Incluye para cada endpoint:
- `summary`: descripción breve en español
- `tags`: agrupa por módulo/entidad
- `security`: `bearerAuth` si es ruta protegida, omitir si es pública
- `parameters`: documenta todos los query params y path params
- `requestBody`: documenta el body para POST y PUT
- `responses`: documenta al menos los códigos 200/201, 400, 401, 403, 404 y 500

---

## Paso 8 — DOCUMENTACIÓN DEL CAMBIO (`IMPLEMENTACION_[MODULO].md`)

Crea o actualiza el documento de implementación en `backend/plataforma_backend/IMPLEMENTACION_[MODULO].md`.

Usa este formato:

```markdown
# 🎉 Módulo [Nombre] - [Descripción breve del cambio]

## ✅ Estado: IMPLEMENTADO Y FUNCIONANDO

[Descripción general de qué se implementó y para qué sirve.]

## 🔧 Problemática Resuelta

[Explica el problema que resuelve o la necesidad que cubre.]

## 📁 Archivos Implementados y Modificados

### **1. Interfaces (`interfaces/[entidad].interface.ts`)**
- `[Interfaz]`: [descripción]

### **2. Schemas (`schemas/[entidad].schema.ts`)**
- `[Schema]`: [descripción]

### **3. Repository (`repositories/[entidad].repository.ts`)**
- `[método]`: [descripción]

### **4. Services (`services/[entidad]/`)**
- `[archivo].ts`: [descripción]

### **5. Controller (`controllers/[entidad].controller.ts`)**
[Descripción de qué métodos se agregaron/modificaron.]

### **6. Routes (`routes/[entidad].routes.ts`)**
[Descripción de qué endpoints se registraron.]

## 🌐 Endpoints Implementados

### **[Nombre del Endpoint]**
[Descripción del endpoint.]
\`\`\`http
METHOD /api/[entidad]/[ruta]
Auth: Bearer Token ([ROL REQUERIDO])
Content-Type: application/json

{
  "campo": "valor"
}
\`\`\`

## 🏗️ Arquitectura y Seguridad

- [Nota de seguridad relevante]
- [Nota de integridad o transaccionalidad si aplica]

## ✅ Resultados
[Resumen breve del módulo entregado.]
```

---

## Checklist Final

Antes de dar por terminado el endpoint, verifica:

- [ ] `interfaces/[entidad].interface.ts` — Tipos creados/actualizados
- [ ] `schemas/[entidad].schema.ts` — Validaciones Zod creadas
- [ ] `repositories/[entidad].repository.ts` — Queries SQL agregadas
- [ ] `services/[entidad]/[accion][Entidad]Service.ts` — Lógica de negocio y permisos
- [ ] `controllers/[entidad].controller.ts` — Método del controller agregado
- [ ] `routes/[entidad].routes.ts` — Endpoint registrado con/sin `preHandler`
- [ ] `index.ts` — Rutas registradas (si es módulo nuevo)
- [ ] **Swagger** — Endpoint documentado con parámetros y respuestas
- [ ] **`IMPLEMENTACION_[MODULO].md`** — Documento de cambio creado/actualizado
