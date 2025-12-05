import { EmpresaRepository } from '../../repositories/empresa.repository';

const empresaRepository = new EmpresaRepository();

/**
 * Obtiene los usuarios visibles para el usuario autenticado según su rol.
 * @returns lista de empresas visibles o error
 */
export async function getEmpresas(id_empresa?: number) {
    // 1. Consultar todas las empresas activas
    const { data: empresas, error } = await empresaRepository.getEmpresas(id_empresa);

    if (error) {
        return { data: null, error: { status: 500, message: 'Error al obtener las empresas', details: error } };
    }

    // 2. Retornar las empresas obtenidas
    return { data: empresas, error: null };
}
