import { InmueblesRepository } from '../../repositories/inmuebles.repository';
import { CreateInmuebleData } from '../../interfaces/inmueble.interface';

export class CreateInmuebleService {
  private inmueblesRepository: InmueblesRepository;

  constructor() {
    this.inmueblesRepository = new InmueblesRepository();
  }

  async execute(
    userId: number,
    inmuebleData: CreateInmuebleData
  ) {
    try {
      // Si tiene un parent_id, intentar heredar campos faltantes del padre
      if (inmuebleData.parent_id) {
        const { data: parentInmueble, error: parentError } = await this.inmueblesRepository.getInmuebleById(inmuebleData.parent_id);

        if (parentError) {
          console.error('Error al obtener inmueble padre:', parentError);
        } else if (parentInmueble) {
          // Heredar campos si no están presentes
          if (!inmuebleData.id_propietario) inmuebleData.id_propietario = Number(parentInmueble.id_propietario);
          if (!inmuebleData.direccion) inmuebleData.direccion = parentInmueble.direccion;
          if (!inmuebleData.ciudad) inmuebleData.ciudad = parentInmueble.ciudad;
          if (!inmuebleData.rnt) inmuebleData.rnt = parentInmueble.rnt;
          if (!inmuebleData.tra_token) inmuebleData.tra_token = parentInmueble.tra_token;
          if (!inmuebleData.edificio && parentInmueble.tipo_registro === 'edificio') {
            inmuebleData.edificio = parentInmueble.nombre;
          }
        }
      }

      // Validaciones finales después de herencia
      if (!inmuebleData.id_propietario) {
        return { data: null, error: { message: 'El ID del propietario es requerido', status: 400, details: 'ID_PROPIETARIO_MISSING' } };
      }

      const { exists: propietarioExists, error: propietarioError } = await this.inmueblesRepository.propietarioExists(inmuebleData.id_propietario);

      if (propietarioError) {
        console.error('Error al verificar propietario:', propietarioError);
        return { data: null, error: { message: 'Error al verificar propietario', status: 500, details: propietarioError } };
      }

      if (!propietarioExists) {
        return { data: null, error: { message: 'El propietario especificado no existe', status: 400, details: 'PROPIETARIO_NOT_FOUND' } };
      }

      if (!inmuebleData.rnt || !inmuebleData.tra_token) {
        return {
          data: null,
          error: {
            message: 'RNT y Token son requeridos (no se pudieron heredar ni fueron proporcionados)',
            status: 400,
            details: 'RNT_OR_TOKEN_MISSING'
          }
        };
      }

      // Validacion especificacion_acomodacion - Si es Apartamento
      if (inmuebleData.tipo_acomodacion === 'Apartamento') {
        if (!inmuebleData.edificio || !inmuebleData.apartamento) {
          return {
            data: null,
            error: {
              message: 'Edificio y apartamento son requeridos para tipo Apartamento',
              status: 400,
              details: 'EDIFICIO_APARTAMENTO_REQUIRED'
            }
          };
        }

        inmuebleData.especificacion_acomodacion =
          `${inmuebleData.edificio} Apto ${inmuebleData.apartamento}`;
      }

      if (inmuebleData.tipo_acomodacion !== 'Apartamento' && inmuebleData.tipo_registro !== 'edificio') {
        if (!inmuebleData.especificacion_acomodacion) {
          return {
            data: null,
            error: {
              message: 'La especificación es requerida para este tipo de acomodación',
              status: 400,
              details: 'ESPECIFICACION_REQUIRED'
            }
          };
        }
      }

      // Crear el inmueble
      const { data: inmueble, error } = await this.inmueblesRepository.createInmueble(inmuebleData);

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
}

// Exportar instancia para compatibilidad o uso directo si se prefiere
export const createInmuebleService = new CreateInmuebleService();