import { InmueblesRepository } from '../../repositories/inmuebles.repository';
import { CreateInmuebleData } from '../../interfaces/inmueble.interface';

const inmueblesRepository = new InmueblesRepository();

export async function createInmuebleService(
  userId: number,
  inmuebleData: CreateInmuebleData
) {
  try {
    // Verificar que el propietario existe
    const { exists: propietarioExists, error: propietarioError } = await inmueblesRepository.propietarioExists(inmuebleData.id_propietario);

    if (propietarioError) {
      console.error('Error al verificar propietario:', propietarioError);
      return {
        data: null,
        error: {
          message: 'Error al verificar propietario',
          status: 500,
          details: propietarioError
        }
      };
    }

    if (!propietarioExists) {
      return {
        data: null,
        error: {
          message: 'El propietario especificado no existe',
          status: 400,
          details: 'PROPIETARIO_NOT_FOUND'
        }
      };
    }

    // Crear el inmueble
    const { data: inmueble, error } = await inmueblesRepository.createInmueble(inmuebleData);

    if (error) {
      console.error('Error al crear inmueble:', error);

      // Manejar errores específicos de base de datos
      if (error.code === '23503') { // Foreign key violation
        return {
          data: null,
          error: {
            message: 'Error de referencia: propietario o empresa no válidos',
            status: 400,
            details: 'FOREIGN_KEY_VIOLATION'
          }
        };
      }

      return {
        data: null,
        error: {
          message: 'Error al crear el inmueble',
          status: 500,
          details: error
        }
      };
    }

    if (!inmueble) {
      return {
        data: null,
        error: {
          message: 'No se pudo crear el inmueble',
          status: 500,
          details: 'CREATION_FAILED'
        }
      };
    }

    return {
      data: inmueble,
      error: null
    };

  } catch (err) {
    console.error('Error inesperado en createInmuebleService:', err);
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