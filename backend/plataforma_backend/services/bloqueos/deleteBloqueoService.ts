import { BloqueosRepository } from '../../repositories/bloqueos.repository';

export class DeleteBloqueoService {
    private bloqueosRepository: BloqueosRepository;

    constructor() {
        this.bloqueosRepository = new BloqueosRepository();
    }

    async execute(id: number): Promise<boolean> {
        try {
            return await this.bloqueosRepository.deleteBloqueo(id);
        } catch (error) {
            console.error('Error en DeleteBloqueoService:', error);
            throw error;
        }
    }
}
