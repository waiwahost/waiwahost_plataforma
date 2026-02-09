import { InmueblesRepository } from '../../repositories/inmuebles.repository';

const inmueblesRepository = new InmueblesRepository();

export async function deleteInmuebleService(
  userId: number,
  inmuebleId: number
) {
  try {
    // Verificar que el inmueble existe
    const { exists: inmuebleExists, error: inmuebleExistsError } = await inmueblesRepository.inmuebleExists(inmuebleId);

    if (inmuebleExistsError) {
      console.error('Error al verificar inmueble:', inmuebleExistsError);
      return {
        data: null,
        error: {
          message: 'Error al verificar inmueble',
          status: 500,
          details: inmuebleExistsError
        }
      };
    }

    if (!inmuebleExists) {
      return {
        data: null,
        error: {
          message: 'El inmueble especificado no existe',
          status: 404,
          details: 'INMUEBLE_NOT_FOUND'
        }
      };
    }

    // Realizar eliminación lógica (cambiar estado a inactivo)
    const { data: inmueble, error } = await inmueblesRepository.deleteInmueble(inmuebleId);

    if (error) {
      console.error('Error al eliminar inmueble:', error);
      return {
        data: null,
        error: {
          message: 'Error al eliminar el inmueble',
          status: 500,
          details: error
        }
      };
    }

    if (!inmueble) {
      return {
        data: null,
        error: {
          message: 'No se pudo eliminar el inmueble',
          status: 500,
          details: 'DELETE_FAILED'
        }
      };
    }


    return {
      data: inmueble,
      error: null
    };

  } catch (err) {
    console.error('Error inesperado en deleteInmuebleService:', err);
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