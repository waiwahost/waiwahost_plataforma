---
trigger: always_on
---

# Arquitectura del Backend Waiwa

El backend usa **Fastify** con **TypeScript** y sigue una arquitectura limpia en capas. Cada capa tiene una responsabilidad única y bien delimitada. Cuando crees o modifiques funcionalidad, SIEMPRE sigue este flujo en orden.

---

## Flujo de capas (orden obligatorio)

```
Request HTTP
    ↓
1. ROUTE         → Registra endpoint y aplica middleware
    ↓
2. MIDDLEWARE    → Protege la ruta (auth) y enriquece el contexto
    ↓
3. CONTROLLER    → Valida entrada con Schema Zod, extrae contexto del usuario, llama al Service
    ↓
4. SERVICE       → Contiene la lógica de negocio y reglas de permisos por rol
    ↓
5. REPOSITORY    → Ejecuta las queries SQL a la base de datos
    ↑
6. INTERFACE     → Define los tipos TypeScript usados en Repository y Service
    ↑
7. SCHEMA (Zod)  → Define y valida los parámetros de entrada en el Controller
```

---

## Capa 1 — ROUTE (`routes/[entidad].routes.ts`)

- Registra los endpoints usando el `FastifyInstance`.
- Decide si una ruta es **pública** (sin middleware) o **protegida** (`preHandler: [authMiddleware]`).
- Llama al método del controller correspondiente.
- Se registra en `index.ts` con un prefijo de URL.

**Reglas:**
- Las rutas públicas NO deben llevar `preHandler`.
- Las rutas que requieren sesión SIEMPRE deben llevar `{ preHandler: [authMiddleware] }`.
- Agrupa todas las rutas de una entidad en su propio archivo de rutas.
- Usa verbos HTTP semánticos: `GET` para consultas, `POST` para crear, `PUT` para editar, `DELETE` para eliminar.

```typescript
// Ejemplo
server.get('/getInmuebles', { preHandler: [authMiddleware] }, inmueblesController.getInmuebles);
server.get('/public/:id', {}, inmueblesController.getInmueblePublic);
```

---

## Capa 2 — MIDDLEWARE (`middlewares/authMiddleware.ts`)

- El `authMiddleware` verifica el JWT con `req.jwtVerify()`.
- Extrae los datos del usuario autenticado del payload del token y los almacena en `req.userContext`.
- `req.userContext` contiene: `id`, `id_roles`, `role`, `empresaId`.
- Si el token es inválido o no existe, responde con `401 Unauthorized` usando `errorResponse`.

**Reglas:**
- NO toques el middleware a menos que necesites agregar nuevos campos al contexto.
- El contexto del usuario SIEMPRE se lee desde `req.userContext` en el controller.
- Nunca hagas lógica de negocio en el middleware.

---

## Capa 3 — CONTROLLER (`controllers/[entidad].controller.ts`)

Es el punto de entrada HTTP. Su única responsabilidad es:
1. **Verificar** que `req.userContext` exista (usuario autenticado).
2. **Validar** los parámetros de entrada con el Schema Zod correspondiente (`safeParse`).
3. **Determinar** datos de contexto relevantes (ej: `id_empresa` según rol superadmin o empresa).
4. **Llamar** al Service correspondiente y pasar el `userContext` y los datos validados.
5. **Responder** `successResponse` o `errorResponse` según el resultado del Service.

**Reglas:**
- Usa SIEMPRE `Schema.safeParse()` para query params y body. Nunca confíes en `req.query` o `req.body` crudos.
- Si la validación falla, responde con `400` y los errores del schema.
- Si el usuario no está autenticado, responde con `401`.
- Envuelve todo en `try/catch` y responde `500` en caso de error inesperado.
- El controller NO debe contener lógica de negocio ni queries SQL.
- Exporta el controller como un objeto con métodos: `export const entidadController = { metodo: async (req, reply) => {} }`.

```typescript
// Patrón estándar de controller
const ctx = req.userContext;
if (!ctx || !ctx.id) return reply.status(401).send(errorResponse({ message: 'No autenticado', code: 401, error: 'Unauthorized' }));

const queryValidation = MiQuerySchema.safeParse(req.query);
if (!queryValidation.success) return reply.status(400).send(errorResponse({ message: 'Parámetros inválidos', code: 400, error: queryValidation.error.errors }));

const { data, error } = await miServicio.execute(ctx, queryValidation.data);
if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status || 500, error: error.details }));

return reply.send(successResponse(data));
```

---

## Capa 4 — SCHEMA (`schemas/[entidad].schema.ts`)

- Usa **Zod** para definir los schemas de validación de entrada.
- Define schemas separados por tipo de operación: `QuerySchema`, `CreateSchema`, `EditSchema`, `QueryByIdSchema`.
- Usa `.transform()` en query params para convertir strings a números cuando sea necesario.
- Usa `.superRefine()` para validaciones condicionales complejas.
- Exporta los tipos inferidos con `z.infer<typeof Schema>` cuando se necesiten en otros archivos.

**Reglas:**
- Query params son siempre strings → usa `.transform()` para convertir a `Number()`.
- Usa `.strict()` en schemas de query para rechazar campos desconocidos.
- Los schemas de edición deben tener todos los campos como `.optional()`.
- Nunca hagas validaciones de negocio aquí (ej: si el usuario tiene permisos). Eso va en el Service.

```typescript
// Ejemplo de schema de query
export const MiQuerySchema = z.object({
  id: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
}).strict();
```

---

## Capa 5 — SERVICE (`services/[entidad]/[accion][Entidad]Service.ts`)

- Contiene la **lógica de negocio** y las **reglas de permisos por rol**.
- Instancia el Repository para hacer consultas a la base de datos.
- Recibe el `userContext` para aplicar lógica diferenciada según `id_roles` (SUPERADMIN, EMPRESA, ADMINISTRADOR, PROPIETARIO).
- Retorna siempre el patrón `{ data, error }` donde `error` tiene la forma `{ status, message, details }`.
- Exporta una instancia singleton al final: `export const miServicio = new MiServicioClass()`.

**Reglas:**
- Un servicio = una acción de negocio (ej: `getInmueblesService`, `createInmuebleService`).
- Organiza los servicios en subcarpetas por entidad: `services/[entidad]/`.
- Nunca escribas SQL aquí. Llama siempre al Repository.
- Maneja los casos de error del Repository antes de continuar la lógica.
- Las verificaciones de permisos por rol van AQUÍ, no en el controller ni en el repository.

```typescript
// Patrón de servicio
export class MiServicioClass {
  private repo: MiRepository;
  constructor() { this.repo = new MiRepository(); }

  async execute(userContext: UserContext, params: MiParams) {
    try {
      if (userContext.id_roles === ROLES.SUPERADMIN) { /* lógica superadmin */ }
      if (userContext.id_roles === ROLES.EMPRESA) { /* lógica empresa */ }
      // ...
      const { data, error } = await this.repo.miMetodo(params);
      if (error) return { data: null, error: { status: 500, message: 'Error', details: error } };
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { status: 500, message: 'Error interno', details: error } };
    }
  }
}
export const miServicio = new MiServicioClass();
```

---

## Capa 6 — REPOSITORY (`repositories/[entidad].repository.ts`)

- Es la **única capa que accede a la base de datos** usando el pool de PostgreSQL (`import pool from '../libs/db'`).
- Contiene las queries SQL puras con parámetros `$1, $2...` para prevenir SQL injection.
- Retorna siempre el patrón `{ data, error }`.
- Los métodos reciben los tipos definidos en las **Interfaces**.
- Agrupa todas las queries de una entidad en un solo archivo de repository.

**Reglas:**
- Nunca hagas lógica de negocio aquí. Solo consultas SQL.
- Usa `RETURNING *` en INSERT y UPDATE para retornar el registro afectado.
- Las eliminaciones son **lógicas**: cambia `estado = 'inactivo'`, nunca uses `DELETE FROM`.
- Usa `try/catch` en cada método y retorna `{ data: null, error }` en caso de fallo.
- Los tipos del parámetro y del retorno deben corresponderse con las Interfaces.

```typescript
// Patrón de repository
async getMiEntidad(id: number): Promise<{ data: MiEntidad | null; error: any }> {
  const query = `SELECT * FROM mi_tabla WHERE id = $1 AND estado = 'activo'`;
  try {
    const { rows } = await pool.query(query, [id]);
    return { data: rows[0] || null, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}
```

---

## Capa 7 — INTERFACE (`interfaces/[entidad].interface.ts`)

- Define los **tipos TypeScript** que representan las entidades de la base de datos.
- Incluye interfaces separadas para cada caso de uso: entidad base, datos de creación (`CreateXxxData`), datos de edición (`EditXxxData`).

**Reglas:**
- Los campos opcionales en la BD usan `?` en la interfaz.
- Los campos `id` suelen ser opcionales en la interfaz base (se genera en la BD).
- Exporta aliases de tipo cuando sea necesario para compatibilidad: `export type XxxUpdate = EditXxxData`.
- Mantén consistencia entre la interfaz, el schema Zod y las queries SQL.

---

## Respuestas HTTP estándar

Siempre usa las funciones del `responseHelper`:

```typescript
import { successResponse, errorResponse } from '../libs/responseHelper';

// Éxito
return reply.send(successResponse(data));
return reply.status(201).send(successResponse(data, 201));

// Error
return reply.status(400).send(errorResponse({ message: 'Mensaje', code: 400, error: detalles }));
```

| Código | Cuándo usarlo |
|--------|--------------|
| 200    | GET / PUT exitoso |
| 201    | POST exitoso (recurso creado) |
| 400    | Validación Zod fallida, parámetros inválidos |
| 401    | No autenticado o token inválido |
| 403    | Autenticado pero sin permisos para el recurso |
| 404    | Recurso no encontrado |
| 500    | Error interno del servidor |

---

## Ubicación de archivos

```
backend/plataforma_backend/
├── routes/            → [entidad].routes.ts
├── middlewares/       → authMiddleware.ts
├── controllers/       → [entidad].controller.ts
├── schemas/           → [entidad].schema.ts
├── services/
│   └── [entidad]/    → [accion][Entidad]Service.ts
├── repositories/      → [entidad].repository.ts
└── interfaces/        → [entidad].interface.ts
```

---

## Registro de rutas en index.ts

Toda ruta nueva debe registrarse en el `index.ts` o `app.ts` principal con su prefijo:

```typescript
server.register(miEntidadRoutes, { prefix: '/api/mi-entidad' });
```

---

## Checklist para nueva funcionalidad

Al crear un nuevo endpoint o módulo, sigue este orden:

- [ ] Crear/actualizar `interfaces/[entidad].interface.ts` con los tipos necesarios
- [ ] Crear/actualizar `schemas/[entidad].schema.ts` con los schemas Zod de validación
- [ ] Crear `services/[entidad]/[accion][Entidad]Service.ts` con la lógica de negocio
- [ ] Crear/actualizar `repositories/[entidad].repository.ts` con las queries SQL
- [ ] Crear/actualizar `controllers/[entidad].controller.ts` con el método del endpoint
- [ ] Crear/actualizar `routes/[entidad].routes.ts` con el registro del endpoint (+ `preHandler` si es protegido)
- [ ] Registrar las rutas en `index.ts` si es un módulo nuevo