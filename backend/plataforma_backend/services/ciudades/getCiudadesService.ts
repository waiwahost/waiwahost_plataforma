import { CiudadesRepository } from '../../repositories/ciudades.repository';

const ciudadesRepository = new CiudadesRepository();

export async function getCiudadesService(ciudadId?: number, paisId?: number) {
    try {
        // Si se proporciona un ID de ciudad, obtener una ciudad específica
        if (ciudadId) {
            const { data, error } = await ciudadesRepository.getCiudadById(ciudadId);

            if (error) {
                console.error('Error al obtener ciudad:', error);
                return {
                    data: null,
                    error: {
                        message: 'Error al obtener la ciudad',
                        status: 500,
                        details: error
                    }
                };
            }

            if (!data) {
                return {
                    data: null,
                    error: {
                        message: 'Ciudad no encontrada',
                        status: 404,
                        details: 'CIUDAD_NOT_FOUND'
                    }
                };
            }

            return { data, error: null };
        }

        // Si se proporciona un ID de país, filtrar por país
        if (paisId) {
            const { data, error } = await ciudadesRepository.getCiudadesByPais(paisId);

            if (error) {
                console.error('Error al obtener ciudades por país:', error);
                return {
                    data: null,
                    error: {
                        message: 'Error al obtener las ciudades',
                        status: 500,
                        details: error
                    }
                };
            }

            return { data, error: null };
        }

        // Si no se proporciona ningún filtro, obtener todas las ciudades
        const { data, error } = await ciudadesRepository.getAllCiudades();

        if (error) {
            console.error('Error al obtener ciudades:', error);
            return {
                data: null,
                error: {
                    message: 'Error al obtener las ciudades',
                    status: 500,
                    details: error
                }
            };
        }

        return { data, error: null };

    } catch (err) {
        console.error('Error inesperado en getCiudadesService:', err);
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
