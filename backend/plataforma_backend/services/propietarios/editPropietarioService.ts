import { PropietarioRepository } from '../../repositories/propietario.repository';
import { UserRepository } from '../../repositories/user.repository';
import { EditPropietarioRequest } from '../../interfaces/propietario.interface';
import { ROLES } from '../../constants/globalConstants';

const propietarioRepository = new PropietarioRepository();
const userRepository = new UserRepository();

/**
 * Edita un propietario existente, actualizando tanto el usuario como el registro de propietario
 * @param loggedUserId - ID del usuario autenticado
 * @param propietarioId - ID del propietario a editar
 * @param propietarioData - Datos del propietario a actualizar
 * @returns El propietario actualizado o error
 */
export async function editPropietarioService(
    loggedUserId: number, 
    propietarioId: number, 
    propietarioData: EditPropietarioRequest
) {
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

        // 2. Verificar que el propietario existe y obtener su información
        const { data: propietarioExistente, error: errorPropietario } = await propietarioRepository.getPropietarioWithUserId(propietarioId);
        if (errorPropietario || !propietarioExistente) {
            return { 
                data: null, 
                error: { 
                    status: 404, 
                    message: 'Propietario no encontrado' 
                } 
            };
        }

        // 3. Validar permisos según rol del usuario autenticado
        if (![ROLES.SUPERADMIN, ROLES.EMPRESA, ROLES.ADMINISTRADOR].includes(loggedUser.id_roles)) {
            return { 
                data: null, 
                error: { 
                    status: 403, 
                    message: 'No tiene permisos para editar propietarios' 
                } 
            };
        }

        // 4. Validar que el usuario empresa/administrador solo edite en su empresa
        if (loggedUser.id_roles === ROLES.EMPRESA || loggedUser.id_roles === ROLES.ADMINISTRADOR) {
            // Verificar que el propietario pertenece a la misma empresa
            if (propietarioExistente.id_empresa !== loggedUser.id_empresa) {
                return { 
                    data: null, 
                    error: { 
                        status: 403, 
                        message: 'Solo puede editar propietarios de su empresa' 
                    } 
                };
            }
            
            // Verificar que no esté intentando cambiar a otra empresa (solo si se proporciona id_empresa)
            if (propietarioData.id_empresa !== undefined && propietarioData.id_empresa !== loggedUser.id_empresa) {
                return { 
                    data: null, 
                    error: { 
                        status: 403, 
                        message: 'No puede mover propietarios a otra empresa' 
                    } 
                };
            }
        }

        // 5. Preparar datos para actualizar usuario (solo campos presentes)
        const userUpdateData: {
            nombre?: string;
            apellido?: string;
            email?: string;
            estado_activo?: boolean;
            id_empresa?: number;
        } = {};

        if (propietarioData.nombre !== undefined) {
            userUpdateData.nombre = propietarioData.nombre;
        }
        if (propietarioData.apellido !== undefined) {
            userUpdateData.apellido = propietarioData.apellido;
        }
        if (propietarioData.email !== undefined) {
            userUpdateData.email = propietarioData.email;
        }
        if (propietarioData.estado !== undefined) {
            userUpdateData.estado_activo = propietarioData.estado === 'activo';
        }
        if (propietarioData.id_empresa !== undefined) {
            userUpdateData.id_empresa = propietarioData.id_empresa;
        }

        // 6. Actualizar el usuario (solo si hay campos de usuario para actualizar)
        let usuarioActualizado = null;
        if (Object.keys(userUpdateData).length > 0) {
            const result = await propietarioRepository.updateUsuario(
                propietarioExistente.id_usuario, 
                userUpdateData
            );
            
            if (result.error) {
                return { 
                    data: null, 
                    error: { 
                        status: 400, 
                        message: 'Error al actualizar datos del usuario', 
                        details: result.error 
                    } 
                };
            }
            usuarioActualizado = result.data;
        }

        // 7. Preparar datos para actualizar propietario (solo campos presentes)
        const propietarioUpdateData: {
            telefono?: string;
            direccion?: string;
        } = {};

        if (propietarioData.telefono !== undefined) {
            propietarioUpdateData.telefono = propietarioData.telefono;
        }
        if (propietarioData.direccion !== undefined) {
            propietarioUpdateData.direccion = propietarioData.direccion;
        }

        // 8. Actualizar el registro en propietarios (solo si hay campos para actualizar)
        let propietarioActualizado = null;
        if (Object.keys(propietarioUpdateData).length > 0) {
            const result = await propietarioRepository.updatePropietario(
                propietarioId, 
                propietarioUpdateData
            );

            if (result.error) {
                return { 
                    data: null, 
                    error: { 
                        status: 400, 
                        message: 'Error al actualizar datos del propietario', 
                        details: result.error 
                    } 
                };
            }
            propietarioActualizado = result.data;
        }

        // 9. Obtener el propietario completo actualizado
        const { data: propietarioCompleto, error: errorGet } = await propietarioRepository.getPropietarioById(propietarioId);

        if (errorGet) {
            return { 
                data: null, 
                error: { 
                    status: 500, 
                    message: 'Error al obtener propietario actualizado', 
                    details: errorGet 
                } 
            };
        }

        return { 
            data: propietarioCompleto, 
            error: null 
        };

    } catch (error) {
        console.error('Error en editPropietarioService:', error);
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
