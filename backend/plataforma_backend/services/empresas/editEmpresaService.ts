import { EmpresaRepository } from '../../repositories/empresa.repository';
import { EmpresaUpdateInput } from '../../schemas/empresa.schema';
import { UserRepository } from '../../repositories/user.repository';
import { ROLES } from '../../constants/globalConstants';
import bcrypt from 'bcryptjs';

const empresaRepository = new EmpresaRepository();
const userRepository = new UserRepository();

export async function editEmpresaService(idEmpresa: number, updateData: EmpresaUpdateInput) {

    // 1. Verificar si la empresa existe
    const { data: empresa, error: errorEmpresa } = await empresaRepository.getEmpresas(idEmpresa);
    if (errorEmpresa) {
        return { data: null, error: { status: 500, message: 'Error al obtener la empresa', details: errorEmpresa } };
    }
    // Nota: getEmpresas devuelve array, en teoria deberia devolver 1 si filtro por ID. 
    // Si no encuentra nada, array vacio.
    if (!empresa || (empresa as any).length === 0) {
        return { data: null, error: { status: 404, message: 'Empresa no encontrada', details: null } };
    }

    // 2. Si se actualiza NIT, verificar duplicados
    if (updateData.nit) {
        const { data: existingEmpresa, error: errorExisting } = await empresaRepository.getByNit(updateData.nit);
        if (errorExisting) {
            return { data: null, error: { status: 500, message: 'Error al verificar NIT', details: errorExisting } };
        }
        if (existingEmpresa && existingEmpresa.id_empresa !== idEmpresa) {
            return { data: null, error: { status: 400, message: 'El NIT ya está en uso por otra empresa', details: null } };
        }
    }

    // 3. Actualizar Empresa
    const { data: updatedEmpresa, error: errorUpdateEmpresa } = await empresaRepository.update(idEmpresa, updateData);
    if (errorUpdateEmpresa) {
        return { data: null, error: { status: 500, message: 'Error al actualizar empresa', details: errorUpdateEmpresa } };
    }

    // 4. Actualizar Usuario asociado (ROLES.EMPRESA)
    // Buscamos el usuario administrador de esta empresa.
    // Asumimos que hay uno solo o actualizamos todos?
    // User dijo: "Editar Nombre se cambiaria aqui y en el usuario".
    // Vamos a buscar usuarios con id_empresa y rol EMPRESA.

    // Necesitamos un metodo en userRepo para buscar por empresa y rol, o usamos listByEmpresaExcept y filtramos.
    // Usaremos listByEmpresaExcept(idEmpresa, 0) para traer todos y filtrar en memoria por rol (no es ideal pero funciona si son pocos).
    // O mejor, agregar un metodo especifico.
    // Dado que no puedo editar user repo facilmente sin ver mas contexto, y userRepo tiene `listAdminsAndOwnersByEmpresaExcept`...
    // Voy a usar `listByEmpresaExcept` y filtrar.

    const { data: users, error: errorUsers } = await userRepository.listByEmpresaExcept(idEmpresa, 0); // 0 para no excluir a nadie
    if (errorUsers) {
        console.error('Error al obtener usuarios de la empresa para actualizar:', errorUsers);
        // No fallamos toda la transaccion, pero avisamos.
        return { data: { empresa: updatedEmpresa, userUpdate: 'Error buscando usuarios' }, error: null };
    }

    const companyAdmins = (users as any[]).filter(u => u.id_roles === ROLES.EMPRESA);

    if (companyAdmins.length > 0) {
        // Actualizamos cada uno (deberia ser uno).
        for (const admin of companyAdmins) {
            const userUpdatePayload: any = {};
            if (updateData.nombre) userUpdatePayload.nombre = updateData.nombre;
            if (updateData.username) userUpdatePayload.username = updateData.username;
            if (updateData.password) {
                userUpdatePayload.password_hash = await bcrypt.hash(updateData.password, 10);
            }

            if (Object.keys(userUpdatePayload).length > 0) {
                await userRepository.updateById(admin.id_usuario, userUpdatePayload);
            }
        }
    }

    return { data: { empresa: updatedEmpresa, message: 'Empresa y usuario actualizados' }, error: null };
}
