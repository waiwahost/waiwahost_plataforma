import { PropietarioRepository } from '../../repositories/propietario.repository';

const propietarioRepository = new PropietarioRepository();

/**
 * Obtiene los propietarios según los filtros proporcionados
 * @param id_empresa - ID opcional de la empresa para filtrar propietarios
 * @returns lista de propietarios o error
 */
export async function getPropietariosService(id_empresa?: number) {
    try {
        // 1. Consultar propietarios desde el repositorio
        const { data: propietarios, error } = await propietarioRepository.getPropietarios(id_empresa);
        if (error) {
            return { 
                data: null, 
                error: { 
                    status: 500, 
                    message: 'Error al obtener los propietarios', 
                    details: error 
                } 
            };
        }
        // 2. Retornar los propietarios obtenidos
        return { data: propietarios, error: null };
    } catch (error) {
        console.error('Error en getPropietariosService:', error);
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
