import { UserRepository } from '../../repositories/user.repository';
import { ROLES } from '../../constants/globalConstants';

const userRepository = new UserRepository();

/**
 * Obtiene los usuarios visibles para el usuario autenticado según su rol.
 * @param userId id del usuario autenticado
 * @returns lista de usuarios visibles o error
 */
export async function getVisibleUsers(userId: number) {
  // 1. Consultar el usuario autenticado y su rol
  const { data: authUser, error: userError } = await userRepository.findById(userId);
  if (!authUser) {
    return { data: null, error: { message: 'Usuario autenticado no encontrado', ...userError } };
  }

  // 2. Lógica según el rol
  if (authUser.id_roles === ROLES.SUPERADMIN) {
    // Superadmin: puede ver todos los usuarios excepto a sí mismo
    return await userRepository.listAllExcept(authUser.id_usuario);
  } else if (authUser.id_roles === ROLES.EMPRESA) {
    // Empresa: puede ver todos los usuarios de su empresa excepto a sí mismo
    return await userRepository.listByEmpresaExcept(authUser.id_empresa, authUser.id_usuario);
  } else if (authUser.id_roles === ROLES.ADMINISTRADOR) {
    // Administrador: puede ver administradores y propietarios de su empresa excepto a sí mismo
    return await userRepository.listAdminsAndOwnersByEmpresaExcept(
      authUser.id_empresa,
      authUser.id_usuario,
      ROLES.ADMINISTRADOR,
      ROLES.PROPIETARIO
    );
  } else {
    // Propietario u otros roles: no puede ver usuarios
    return { data: [], error: null };
  }
}
