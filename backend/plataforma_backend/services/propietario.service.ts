import { PropietarioRepository } from '../repositories/propietario.repository';
import { Propietario, CreatePropietarioRequest, EditPropietarioRequest } from '../interfaces/propietario.interface';

export class PropietarioService {
  private propietarioRepository: PropietarioRepository;

  constructor() {
    this.propietarioRepository = new PropietarioRepository();
  }

  async getPropietarios(id_empresa?: number) {
    try {
      const { data, error } = await this.propietarioRepository.getPropietarios(id_empresa);
      
      if (error) {
        return { 
          data: null, 
          error: { 
            status: 500, 
            message: 'Error al obtener propietarios', 
            details: error 
          } 
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error en PropietarioService.getPropietarios:', error);
      return { 
        data: null, 
        error: { 
          status: 500, 
          message: 'Error interno del servidor', 
          details: error 
        } 
      };
    }
  }

  async createPropietario(loggedUserId: number, propietarioData: CreatePropietarioRequest) {
    // Este método podría implementar lógica adicional si es necesario
    // Por ahora delegamos al servicio específico
    const { createPropietarioService } = await import('./propietarios/createPropietarioService');
    return createPropietarioService(loggedUserId, propietarioData);
  }

  async editPropietario(loggedUserId: number, propietarioId: number, propietarioData: EditPropietarioRequest) {
    // Este método podría implementar lógica adicional si es necesario
    // Por ahora delegamos al servicio específico
    const { editPropietarioService } = await import('./propietarios/editPropietarioService');
    return editPropietarioService(loggedUserId, propietarioId, propietarioData);
  }
}
