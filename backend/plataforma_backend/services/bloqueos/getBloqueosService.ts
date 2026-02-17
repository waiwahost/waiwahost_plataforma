import { BloqueosRepository } from '../../repositories/bloqueos.repository';
import { GetBloqueosQuery, Bloqueo } from '../../interfaces/bloqueo.interface';

export class GetBloqueosService {
    private bloqueosRepository: BloqueosRepository;

    constructor() {
        this.bloqueosRepository = new BloqueosRepository();
    }

    async execute(query: GetBloqueosQuery): Promise<Bloqueo[]> {
        try {
            return await this.bloqueosRepository.getBloqueos(query);
        } catch (error) {
            console.error('Error en GetBloqueosService:', error);
            throw error;
        }
    }
}
