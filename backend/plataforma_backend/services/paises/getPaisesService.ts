import { PaisesRepository } from '../../repositories/paises.repository';

const paisesRepository = new PaisesRepository();

export async function getPaisesService(paisId?: number) {
    try {
        // Si se proporciona un ID, obtener un país específico
        if (paisId) {
            const { data, error } = await paisesRepository.getPaisById(paisId);

            if (error) {
                console.error('Error al obtener país:', error);
                return {
                    data: null,
                    error: {
                        message: 'Error al obtener el país',
                        status: 500,
                        details: error
                    }
                };
            }

            if (!data) {
                return {
                    data: null,
                    error: {
                        message: 'País no encontrado',
                        status: 404,
                        details: 'PAIS_NOT_FOUND'
                    }
                };
            }

            return { data, error: null };
        }

        // Si no se proporciona ID, obtener todos los países
        const { data, error } = await paisesRepository.getAllPaises();

        if (error) {
            console.error('Error al obtener países:', error);
            return {
                data: null,
                error: {
                    message: 'Error al obtener los países',
                    status: 500,
                    details: error
                }
            };
        }

        return { data, error: null };

    } catch (err) {
        console.error('Error inesperado en getPaisesService:', err);
        return {
            data: null,
            error: {
                message: 'Error interno del servidor',
                status: 500,
                details: err
            }
        };
    }
}
