import { CiudadesRepository } from '../../repositories/ciudades.repository';
import { PaisesRepository } from '../../repositories/paises.repository';
import { CreateCiudadData } from '../../interfaces/ciudad.interface';

const ciudadesRepository = new CiudadesRepository();
const paisesRepository = new PaisesRepository();

export async function createCiudadService(ciudadData: CreateCiudadData) {
    try {
        // Verificar que el país existe
        const { exists: paisExists, error: paisError } = await paisesRepository.paisExists(ciudadData.id_pais);

        if (paisError) {
            console.error('Error al verificar país:', paisError);
            return {
                data: null,
                error: {
                    message: 'Error al verificar país',
                    status: 500,
                    details: paisError
                }
            };
        }

        if (!paisExists) {
            return {
                data: null,
                error: {
                    message: 'El país especificado no existe',
                    status: 400,
                    details: 'PAIS_NOT_FOUND'
                }
            };
        }

        // Validar que el nombre no exista en el país
        const { exists: nombreExists, error: nombreError } = await ciudadesRepository.checkUniqueNombreInPais(
            ciudadData.nombre,
            ciudadData.id_pais
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
                    message: 'Ya existe una ciudad con ese nombre en el país seleccionado',
                    status: 400,
                    details: 'NOMBRE_DUPLICADO'
                }
            };
        }

        // Crear la ciudad
        const { data: ciudad, error } = await ciudadesRepository.createCiudad(ciudadData);

        if (error) {
            console.error('Error al crear ciudad:', error);

            if (error.code === '23503') {
                return {
                    data: null,
                    error: {
                        message: 'El país especificado no existe',
                        status: 400,
                        details: 'FOREIGN_KEY_VIOLATION'
                    }
                };
            }

            if (error.code === '23505') {
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
                    message: 'Error al crear la ciudad',
                    status: 500,
                    details: error
                }
            };
        }

        if (!ciudad) {
            return {
                data: null,
                error: {
                    message: 'No se pudo crear la ciudad',
                    status: 500,
                    details: 'CREATION_FAILED'
                }
            };
        }

        return {
            data: ciudad,
            error: null
        };

    } catch (err) {
        console.error('Error inesperado en createCiudadService:', err);
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
