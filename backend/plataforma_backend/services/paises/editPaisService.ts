import { PaisesRepository } from '../../repositories/paises.repository';
import { EditPaisData } from '../../interfaces/pais.interface';

const paisesRepository = new PaisesRepository();

export async function editPaisService(paisId: number, paisData: EditPaisData) {
    try {
        // Verificar que el país existe
        const { exists: paisExists, error: paisExistsError } = await paisesRepository.paisExists(paisId);

        if (paisExistsError) {
            console.error('Error al verificar existencia del país:', paisExistsError);
            return {
                data: null,
                error: {
                    message: 'Error al verificar existencia del país',
                    status: 500,
                    details: paisExistsError
                }
            };
        }

        if (!paisExists) {
            return {
                data: null,
                error: {
                    message: 'País no encontrado',
                    status: 404,
                    details: 'PAIS_NOT_FOUND'
                }
            };
        }

        // Si se está actualizando el nombre, validar que no exista
        if (paisData.nombre) {
            const { exists: nombreExists, error: nombreError } = await paisesRepository.checkUniqueNombre(paisData.nombre, paisId);

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
        }

        // Si se está actualizando el código ISO2, validar que no exista
        if (paisData.codigo_iso2) {
            const { exists: iso2Exists, error: iso2Error } = await paisesRepository.checkUniqueIso2(paisData.codigo_iso2, paisId);

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
        }

        // Actualizar el país
        const { data: pais, error } = await paisesRepository.updatePais(paisId, paisData);

        if (error) {
            console.error('Error al actualizar país:', error);

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
                    message: 'Error al actualizar el país',
                    status: 500,
                    details: error
                }
            };
        }

        if (!pais) {
            return {
                data: null,
                error: {
                    message: 'No se pudo actualizar el país',
                    status: 500,
                    details: 'UPDATE_FAILED'
                }
            };
        }

        return {
            data: pais,
            error: null
        };

    } catch (err) {
        console.error('Error inesperado en editPaisService:', err);
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
