import { EmpresaRepository } from '../../repositories/empresa.repository';

const empresaRepository = new EmpresaRepository();

export async function hardDeleteEmpresaService(idEmpresa: number) {
    // 1. Verificar si la empresa existe
    const { data: empresa, error: errorEmpresa } = await empresaRepository.getEmpresas(idEmpresa);
    // getEmpresas devuelve array, revisamos si tiene elementos
    if (errorEmpresa) {
        return { data: null, error: { status: 500, message: 'Error al verificar la empresa', details: errorEmpresa } };
    }
    if (!empresa || (empresa as any).length === 0) {
        return { data: null, error: { status: 404, message: 'Empresa no encontrada', details: null } };
    }

    // 2. Hard Delete (Cascading Delete Manual)
    const { data: deletedEmpresa, error: errorDelete } = await empresaRepository.hardDelete(idEmpresa);

    if (errorDelete) {
        return { data: null, error: { status: 500, message: 'Error eliminando empresa y datos relacionados', details: errorDelete } };
    }

    return {
        data: {
            message: 'Empresa y todos sus datos relacionados eliminados permanentemente',
            empresa: deletedEmpresa
        },
        error: null
    };
}
