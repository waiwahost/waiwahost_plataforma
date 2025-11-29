import { PropietarioRepository } from '../../repositories/propietario.repository';
import { UserRepository } from '../../repositories/user.repository';
import { CreatePropietarioRequest } from '../../interfaces/propietario.interface';
import { ROLES } from '../../constants/globalConstants';
import bcrypt from 'bcryptjs';

const propietarioRepository = new PropietarioRepository();
const userRepository = new UserRepository();

/**
 * Crea un nuevo propietario, primero creando el usuario y luego el registro en propietarios
 * @param loggedUserId - ID del usuario autenticado
 * @param propietarioData - Datos del propietario a crear
 * @returns El propietario creado o error
 */
export async function createPropietarioService(loggedUserId: number, propietarioData: CreatePropietarioRequest) {
    try {
        // 1. Verificar usuario autenticado
        const { data: loggedUser } = await userRepository.findById(loggedUserId);
        if (!loggedUser) {
            return { 
                data: null, 
                error: { 
                    status: 401, 
                    message: 'No autenticado' 
                } 
            };
        }

        // 2. Validar permisos según rol del usuario autenticado
        if (![ROLES.SUPERADMIN, ROLES.EMPRESA, ROLES.ADMINISTRADOR].includes(loggedUser.id_roles)) {
            return { 
                data: null, 
                error: { 
                    status: 403, 
                    message: 'No tiene permisos para crear propietarios' 
                } 
            };
        }

        // 3. Validar que el usuario empresa/administrador solo cree en su empresa
        if (loggedUser.id_roles === ROLES.EMPRESA || loggedUser.id_roles === ROLES.ADMINISTRADOR) {
            if (propietarioData.id_empresa !== loggedUser.id_empresa) {
                return { 
                    data: null, 
                    error: { 
                        status: 403, 
                        message: 'Solo puede crear propietarios en su empresa' 
                    } 
                };
            }
        }

        // 4. Generar username a partir del email
        const username = propietarioData.email.split('@')[0];

        // 5. Generar password temporal (se puede cambiar por un sistema de invitación)
        const tempPassword = 'PropietarioTemp123!';
        const password_hash = await bcrypt.hash(tempPassword, 10);

        // 6. Convertir estado de string a boolean
        const estado_activo = propietarioData.estado === 'activo';

        // 7. Crear el usuario
        const { data: usuarioCreado, error: errorUsuario } = await propietarioRepository.createUsuario({
            nombre: propietarioData.nombre,
            apellido: propietarioData.apellido,
            email: propietarioData.email,
            cedula: propietarioData.cedula,
            username,
            password_hash,
            id_roles: ROLES.PROPIETARIO,
            id_empresa: propietarioData.id_empresa,
            estado_activo
        });

        if (errorUsuario) {
            return { 
                data: null, 
                error: { 
                    status: 400, 
                    message: 'Error al crear usuario', 
                    details: errorUsuario 
                } 
            };
        }

        // 8. Crear el registro en propietarios
        const { data: propietarioCreado, error: errorPropietario } = await propietarioRepository.createPropietario({
            id_usuario: usuarioCreado.id_usuario,
            telefono: propietarioData.telefono,
            direccion: propietarioData.direccion
        });

        if (errorPropietario) {
            // TODO: Aquí deberíamos hacer rollback del usuario creado
            return { 
                data: null, 
                error: { 
                    status: 400, 
                    message: 'Error al crear propietario', 
                    details: errorPropietario 
                } 
            };
        }

        // 9. Obtener el propietario completo con todos los datos
        const { data: propietarioCompleto, error: errorGet } = await propietarioRepository.getPropietarioById(propietarioCreado.id_propietario);

        if (errorGet) {
            return { 
                data: null, 
                error: { 
                    status: 500, 
                    message: 'Error al obtener propietario creado', 
                    details: errorGet 
                } 
            };
        }

        return { 
            data: propietarioCompleto, 
            error: null 
        };

    } catch (error) {
        console.error('Error en createPropietarioService:', error);
        return { 
            data: null, 
            error: { 
                status: 500, 
                message: 'Error interno del servidor', 
                details: error 
            } 
        };
    }
}
