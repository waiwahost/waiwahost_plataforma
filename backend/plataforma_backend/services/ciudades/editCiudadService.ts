import { CiudadesRepository } from '../../repositories/ciudades.repository';
import { EditCiudadData } from '../../interfaces/ciudad.interface';

const ciudadesRepository = new CiudadesRepository();

export async function editCiudadService(ciudadId: number, ciudadData: EditCiudadData) {
    try {
        // Verificar que la ciudad existe y obtener sus datos actuales
        const { data: ciudadActual, error: ciudadExistsError } = await ciudadesRepository.getCiudadById(ciudadId);

        if (ciudadExistsError) {
            console.error('Error al verificar existencia de la ciudad:', ciudadExistsError);
            return {
                data: null,
                error: {
                    message: 'Error al verificar existencia de la ciudad',
                    status: 500,
                    details: ciudadExistsError
                }
            };
        }

        if (!ciudadActual) {
            return {
                data: null,
                error: {
                    message: 'Ciudad no encontrada',
                    status: 404,
                    details: 'CIUDAD_NOT_FOUND'
                }
            };
        }

        // Si se está actualizando el nombre, validar que no exista en el mismo país
        if (ciudadData.nombre) {
            const { exists: nombreExists, error: nombreError } = await ciudadesRepository.checkUniqueNombreInPais(
                ciudadData.nombre,
                ciudadActual.id_pais,
                ciudadId
            );

            if (nombreError) {
                console.error('Error al verificar nombre de la ciudad:', nombreError);
                return {
                    data: null,
                    error: {
                        message: 'Error al verificar nombre de la ciudad',
                        status: 500,
                        details: nombreError
                    }
                };
            }

            if (nombreExists) {
                return {
                    data: null,
                    error: {
                        message: 'Ya existe una ciudad con ese nombre en el país',
                        status: 400,
                        details: 'NOMBRE_DUPLICADO'
                    }
                };
            }
        }

        // Actualizar la ciudad
        const { data: ciudad, error } = await ciudadesRepository.updateCiudad(ciudadId, ciudadData);

        if (error) {
            console.error('Error al actualizar ciudad:', error);

            // Manejar errores específicos de base de datos
            if (error.code === '23505') { // Unique violation
                return {
                    data: null,
                    error: {
                        message: 'Ya existe una ciudad con ese nombre en el país',
                        status: 400,
                        details: 'UNIQUE_VIOLATION'
                    }
                };
            }

            return {
                data: null,
                error: {
                    message: 'Error al actualizar la ciudad',
                    status: 500,
                    details: error
                }
            };
        }

        if (!ciudad) {
            return {
                data: null,
                error: {
                    message: 'No se pudo actualizar la ciudad',
                    status: 500,
                    details: 'UPDATE_FAILED'
                }
            };
        }

        return {
            data: ciudad,
            error: null
        };

    } catch (err) {
        console.error('Error inesperado en editCiudadService:', err);
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
