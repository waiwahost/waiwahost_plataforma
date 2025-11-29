import { ROLES } from '../../constants/globalConstants';
import { UserRepository } from '../../repositories/user.repository';

const userRepository = new UserRepository();

/**
 * Lógica de eliminación de usuario con control de permisos.
 * @param loggedUserId id del usuario autenticado
 * @param targetUserId id del usuario a eliminar
 */
export async function deleteUserService(loggedUserId: number, targetUserId: number) {
  // 1. Consultar usuario autenticado
  const { data: loggedUser } = await userRepository.findById(loggedUserId);
  if (!loggedUser) {
    return { error: { status: 401, message: 'No autenticado' } };
  }

  // 2. Consultar usuario a eliminar
  const { data: targetUser } = await userRepository.findById(Number(targetUserId));
  if (!targetUser) {
    return { error: { status: 404, message: 'Usuario a eliminar no encontrado' } };
  }

  // 3. Lógica de permisos
  if (loggedUser.id_roles === ROLES.SUPERADMIN) {
    if (loggedUser.id_usuario === targetUser.id_usuario) {
      return { error: { status: 403, message: 'No puede eliminarse a sí mismo' } };
    }
    // Puede eliminar cualquier usuario
    return await userRepository.deleteById(String(targetUserId));
  }

  if (loggedUser.id_roles === ROLES.EMPRESA) {
    if (loggedUser.id_usuario === targetUser.id_usuario) {
      return { error: { status: 403, message: 'No puede eliminarse a sí mismo' } };
    }
    // Solo puede eliminar administradores o propietarios de su empresa
    const puedeEliminar =
      (targetUser.id_roles === ROLES.ADMINISTRADOR || targetUser.id_roles === ROLES.PROPIETARIO) &&
      targetUser.id_empresa === loggedUser.id_empresa;
    if (!puedeEliminar) {
      return { error: { status: 403, message: 'No tiene permisos para eliminar este usuario' } };
    }
    return await userRepository.deleteById(String(targetUserId));
  }

  // Administrador y propietario no pueden eliminar usuarios
  return { error: { status: 403, message: 'No tiene permisos para eliminar usuarios' } };
}
