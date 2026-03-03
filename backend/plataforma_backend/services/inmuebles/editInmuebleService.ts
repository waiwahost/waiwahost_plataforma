import { InmueblesRepository } from '../../repositories/inmuebles.repository';
import { EditInmuebleData } from '../../interfaces/inmueble.interface';

export class EditInmuebleService {
  private inmueblesRepository: InmueblesRepository;

  constructor() {
    this.inmueblesRepository = new InmueblesRepository();
  }

  async execute(
    userId: number,
    inmuebleId: number,
    inmuebleData: EditInmuebleData
  ) {
    try {
      // Verificar que el inmueble existe
      const { exists: inmuebleExists, error: inmuebleExistsError } = await this.inmueblesRepository.inmuebleExists(inmuebleId);

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

      // Actualizar el inmueble
      const { data: inmueble, error } = await this.inmueblesRepository.updateInmueble(inmuebleId, inmuebleData);

      if (error) {
        console.error('Error al actualizar inmueble:', error);

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
            message: 'Error al actualizar el inmueble',
            status: 500,
            details: error
          }
        };
      }

      if (!inmueble) {
        return {
          data: null,
          error: {
            message: 'No se pudo actualizar el inmueble',
            status: 500,
            details: 'UPDATE_FAILED'
          }
        };
      }

      return {
        data: inmueble,
        error: null
      };

    } catch (err) {
      console.error('Error inesperado en editInmuebleService:', err);
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
}

export const editInmuebleService = new EditInmuebleService();
