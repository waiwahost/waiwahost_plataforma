import { PaisesRepository } from '../../repositories/paises.repository';
import { CreatePaisData } from '../../interfaces/pais.interface';

const paisesRepository = new PaisesRepository();

export async function createPaisService(paisData: CreatePaisData) {
    try {
        // Validar que el nombre no exista
        const { exists: nombreExists, error: nombreError } = await paisesRepository.checkUniqueNombre(paisData.nombre);

        if (nombreError) {
            console.error('Error al verificar nombre del país:', nombreError);
            return {
                data: null,
                error: {
                    message: 'Error al verificar nombre del país',
                    status: 500,
                    details: nombreError
                }
            };
        }

        if (nombreExists) {
            return {
                data: null,
                error: {
                    message: 'Ya existe un país con ese nombre',
                    status: 400,
                    details: 'NOMBRE_DUPLICADO'
                }
            };
        }

        // Validar que el código ISO2 no exista
        const { exists: iso2Exists, error: iso2Error } = await paisesRepository.checkUniqueIso2(paisData.codigo_iso2);

        if (iso2Error) {
            console.error('Error al verificar código ISO2:', iso2Error);
            return {
                data: null,
                error: {
                    message: 'Error al verificar código ISO2',
                    status: 500,
                    details: iso2Error
                }
            };
        }

        if (iso2Exists) {
            return {
                data: null,
                error: {
                    message: 'Ya existe un país con ese código ISO2',
                    status: 400,
                    details: 'ISO2_DUPLICADO'
                }
            };
        }

        // Crear el país
        const { data: pais, error } = await paisesRepository.createPais(paisData);

        if (error) {
            console.error('Error al crear país:', error);

            // Manejar errores específicos de base de datos
            if (error.code === '23505') { // Unique violation
                return {
                    data: null,
                    error: {
                        message: 'Ya existe un país con ese nombre o código ISO',
                        status: 400,
                        details: 'UNIQUE_VIOLATION'
                    }
                };
            }

            return {
                data: null,
                error: {
                    message: 'Error al crear el país',
                    status: 500,
                    details: error
                }
            };
        }

        if (!pais) {
            return {
                data: null,
                error: {
                    message: 'No se pudo crear el país',
                    status: 500,
                    details: 'CREATION_FAILED'
                }
            };
        }

        return {
            data: pais,
            error: null
        };

    } catch (err) {
        console.error('Error inesperado en createPaisService:', err);
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
