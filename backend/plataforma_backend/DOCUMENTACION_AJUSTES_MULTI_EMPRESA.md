# DOCUMENTACIÓN DE AJUSTES MULTI-EMPRESA

## Cambios realizados en el backend

### 1. Controladores ajustados
- **pagos.controller.ts**: Todos los endpoints ahora usan el id de empresa del usuario autenticado (`request.userContext.empresaId`). Se eliminó cualquier hardcodeo o posibilidad de que el cliente sobreescriba el id de empresa.
- **reservas.controller.ts**: Se fuerza el uso del id de empresa del usuario autenticado en la creación y consulta de reservas.
- **movimientos.controller.ts**: Todos los endpoints relevantes usan el id de empresa del usuario autenticado, convertido a número, y nunca permiten acceso cruzado.
- **inmuebles.controller.ts**: Se fuerza el uso del id de empresa del usuario autenticado en todas las operaciones.
- **egresos.controller.ts** y **ingresos.controller.ts**: Se fuerza el uso del id de empresa del usuario autenticado en los filtros y consultas.
- **propietario.controller.ts**: Se fuerza el uso del id de empresa del usuario autenticado en la creación, edición y consulta de propietarios.

### 2. Middleware
- Se creó `middlewares/empresaValidationMiddleware.ts` para validar que los recursos consultados/modificados pertenezcan a la empresa del usuario autenticado.

### 3. Seguridad
- Ningún endpoint permite que el cliente sobreescriba el id de empresa.
- Todos los recursos sensibles están protegidos por el id de empresa del usuario autenticado.

## Queries SQL sugeridas para la base de datos

Asegúrate de que todas las tablas relevantes tengan el campo `id_empresa` y los índices necesarios:

```sql
-- Agregar campo id_empresa si no existe
ALTER TABLE inmuebles ADD COLUMN IF NOT EXISTS id_empresa INTEGER NOT NULL;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS id_empresa INTEGER NOT NULL;
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS id_empresa INTEGER NOT NULL;
ALTER TABLE movimientos ADD COLUMN IF NOT EXISTS id_empresa INTEGER NOT NULL;
ALTER TABLE propietarios ADD COLUMN IF NOT EXISTS id_empresa INTEGER NOT NULL;

-- Índices para optimizar búsquedas por empresa
CREATE INDEX IF NOT EXISTS idx_inmuebles_empresa ON inmuebles(id_empresa);
CREATE INDEX IF NOT EXISTS idx_reservas_empresa ON reservas(id_empresa);
CREATE INDEX IF NOT EXISTS idx_pagos_empresa ON pagos(id_empresa);
CREATE INDEX IF NOT EXISTS idx_movimientos_empresa ON movimientos(id_empresa);
CREATE INDEX IF NOT EXISTS idx_propietarios_empresa ON propietarios(id_empresa);
```

## Notas
- Si alguna tabla ya tiene el campo `id_empresa`, solo asegúrate de que esté correctamente poblado y relacionado.
- Si tienes datos históricos, deberás migrar los registros existentes para asignarles el id de empresa correcto.
- Revisa los servicios y repositorios para asegurar que siempre se filtre por empresa en las consultas.

---

**Cualquier duda o ajuste adicional, consulta este documento o revisa los controladores mencionados.**
