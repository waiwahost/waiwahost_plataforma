import { EmpresaRepository } from '../../repositories/empresa.repository';
import { UserRepository } from '../../repositories/user.repository';

const empresaRepository = new EmpresaRepository();
const userRepository = new UserRepository();

export async function softDeleteEmpresaService(idEmpresa: number) {
    // 1. Verificar si la empresa existe
    const { data: empresa, error: errorEmpresa } = await empresaRepository.getEmpresas(idEmpresa);
    if (errorEmpresa) {
        return { data: null, error: { status: 500, message: 'Error al obtener la empresa', details: errorEmpresa } };
    }
    if (!empresa || (empresa as any).length === 0) {
        return { data: null, error: { status: 404, message: 'Empresa no encontrada', details: null } };
    }

    // 2. Soft Delete Empresa (estado=inactiva, fecha_fin=NOW())
    const { data: deletedEmpresa, error: errorDelete, warning } = await empresaRepository.softDelete(idEmpresa);

    if (errorDelete) {
        if ((errorDelete as any).message === 'Columna fecha_fin no existe en empresas') { // Custom check if we added strictly
            // Ya lo maneja el repo devolviendo warning
        }
        return { data: null, error: { status: 500, message: 'Error desactivando empresa', details: errorDelete } };
    }

    // 3. Desactivar usuarios (estado_activo=false)
    const { success, error: errorUsers } = await userRepository.deactivateByEmpresa(idEmpresa);

    if (errorUsers) {
        // No fallamos todo si los usuarios fallan? El usuario pidio ambas cosas.
        // Pero si la columna no existe (errorUsers.message), avisamos.
        console.warn('Advertencia en desactivacion de usuarios:', errorUsers);
    }

    return {
        data: {
            message: 'Empresa desactivada correctamente com Soft Delete',
            empresa: deletedEmpresa,
            usersDeactivated: success,
            warnings: [warning, errorUsers ? 'Error desactivando usuarios: ' + (errorUsers as any).message : null].filter(Boolean)
        },
        error: null
    };
}
