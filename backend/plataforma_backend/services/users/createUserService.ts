import { ROLES } from '../../constants/globalConstants';
import { UserRepository } from '../../repositories/user.repository';
import bcrypt from 'bcryptjs';

const userRepository = new UserRepository();

/**
 * Lógica de creación de usuario con control de permisos y reglas de negocio.
 * @param loggedUserId id del usuario autenticado
 * @param newUserData datos del usuario a crear
 */
export async function createUserService(loggedUserId: number, newUserData: any) {
  // 1. Consultar usuario autenticado
  const { data: loggedUser } = await userRepository.findById(loggedUserId);
  if (!loggedUser) {
    return { error: { status: 401, message: 'No autenticado' } };
  }

  // 2. Validar campos obligatorios
  const requiredFields = ['cedula', 'email', 'nombre', 'apellido', 'password', 'id_roles'];
  for (const field of requiredFields) {
    if (!newUserData[field]) {
      return { error: { status: 400, message: `El campo ${field} es obligatorio` } };
    }
  }

  // 3. Username: si no viene, tomar parte antes del @ del correo
  let username = newUserData.username;
  if (!username || username.trim() === '') {
    username = newUserData.email.split('@')[0];
  }

  // 4. Hashear contraseña
  const password_hash = await bcrypt.hash(newUserData.password, 10);
  const userToCreate = { ...newUserData, username, password_hash };
  // Eliminar plain password del objeto final
  delete userToCreate.password;

  // 5. Reglas de negocio según el rol del autenticado
  const rolNuevo = Number(newUserData.id_roles);
  const empresaNueva = Number(newUserData.id_empresa);

  if (loggedUser.id_roles === ROLES.SUPERADMIN) {
    // Puede crear cualquier usuario
    return await userRepository.insert(userToCreate);
  }

  if (loggedUser.id_roles === ROLES.EMPRESA) {
    // Solo puede crear administradores o propietarios en su empresa
    if (![ROLES.ADMINISTRADOR, ROLES.PROPIETARIO].includes(rolNuevo)) {
      return { error: { status: 403, message: 'Solo puede crear administradores o propietarios' } };
    }
    if (empresaNueva !== loggedUser.id_empresa) {
      return { error: { status: 403, message: 'Solo puede crear usuarios en su empresa' } };
    }
    return await userRepository.insert({ ...userToCreate, id_empresa: loggedUser.id_empresa });
  }

  if (loggedUser.id_roles === ROLES.ADMINISTRADOR) {
    // Solo puede crear propietarios en su empresa
    if (rolNuevo !== ROLES.PROPIETARIO) {
      return { error: { status: 403, message: 'Solo puede crear propietarios' } };
    }
    if (empresaNueva !== loggedUser.id_empresa) {
      return { error: { status: 403, message: 'Solo puede crear usuarios en su empresa' } };
    }
    return await userRepository.insert({ ...userToCreate, id_empresa: loggedUser.id_empresa });
  }

  // Propietario no puede crear usuarios
  return { error: { status: 403, message: 'No tiene permisos para crear usuarios' } };
}
