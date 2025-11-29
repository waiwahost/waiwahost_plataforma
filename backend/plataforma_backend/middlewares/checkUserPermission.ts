import { FastifyRequest } from 'fastify';

export type UserAction = 'crear' | 'ver' | 'editar' | 'eliminar';

export function checkUserPermission(req: FastifyRequest, action: UserAction, targetUser?: { id_roles: number; id_empresa?: number | null }) {
  const ctx = req.userContext;
  if (!ctx) return { allowed: false, reason: 'Sin contexto de usuario' };

  // Validación explícita de pertenencia a la empresa para roles limitados
  const requiereEmpresa = ['empresa', 'administrador'];
  if (['ver', 'editar', 'eliminar'].includes(action) && requiereEmpresa.includes(ctx.role)) {
    if (!targetUser) return { allowed: false, reason: 'Falta usuario objetivo' };
    if (targetUser.id_empresa !== ctx.empresaId) {
      return { allowed: false, reason: 'Solo puede operar sobre usuarios de su empresa' };
    }
  }

  // Reglas por acción
  switch (action) {
    case 'crear':
      // superadmin puede crear cualquier usuario
      if (ctx.role === 'superadmin') return { allowed: true };
      // empresa puede crear administradores o propietarios, solo en su empresa
      if (ctx.role === 'empresa') {
        if (!targetUser) return { allowed: false, reason: 'Falta usuario objetivo' };
        if ([3, 4].includes(targetUser.id_roles) && targetUser.id_empresa === ctx.empresaId) return { allowed: true };
        return { allowed: false, reason: 'Solo puede crear administradores o propietarios de su empresa' };
      }
      // administrador puede crear solo propietarios, solo en su empresa
      if (ctx.role === 'administrador') {
        if (!targetUser) return { allowed: false, reason: 'Falta usuario objetivo' };
        if (targetUser.id_roles === 4 && targetUser.id_empresa === ctx.empresaId) return { allowed: true };
        return { allowed: false, reason: 'Solo puede crear propietarios de su empresa' };
      }
      // propietario no puede crear
      if (ctx.role === 'propietario') return { allowed: false, reason: 'No puede crear usuarios' };
      break;
    case 'ver':
      if (ctx.role === 'superadmin') return { allowed: true };
      if (ctx.role === 'empresa' || ctx.role === 'administrador') {
        return { allowed: true };
      }
      if (ctx.role === 'propietario') return { allowed: false, reason: 'No puede ver usuarios' };
      break;
    case 'editar':
    case 'eliminar':
      if (ctx.role === 'superadmin') return { allowed: true };
      if (ctx.role === 'empresa') {
        return { allowed: true };
      }
      if (ctx.role === 'administrador' || ctx.role === 'propietario') return { allowed: false, reason: 'No puede editar/eliminar usuarios' };
      break;
    default:
      return { allowed: false, reason: 'Acción no reconocida' };
  }
  return { allowed: false, reason: 'Permiso denegado' };
}
