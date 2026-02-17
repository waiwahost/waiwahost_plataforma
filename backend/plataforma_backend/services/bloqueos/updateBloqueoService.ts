import { BloqueosRepository } from '../../repositories/bloqueos.repository';
import { ReservasRepository } from '../../repositories/reservas.repository';
import { CreateBloqueoRequest, Bloqueo } from '../../interfaces/bloqueo.interface';

export class UpdateBloqueoService {
    private bloqueosRepository: BloqueosRepository;
    private reservasRepository: ReservasRepository;

    constructor() {
        this.bloqueosRepository = new BloqueosRepository();
        this.reservasRepository = new ReservasRepository();
    }

    async execute(id: number, data: Partial<CreateBloqueoRequest>): Promise<Bloqueo> {
        try {
            // 0. Obtener el bloqueo actual para completar fechas si solo se envía una
            const current = await this.bloqueosRepository.getBloqueoById(id);
            if (!current) {
                throw new Error('Bloqueo no encontrado');
            }

            const inicio = data.fecha_inicio || current.fecha_inicio;
            const fin = data.fecha_fin || current.fecha_fin;

            // 1. Validar fechas
            if (new Date(inicio) > new Date(fin)) {
                throw new Error('La fecha de inicio debe ser anterior o igual a la fecha de fin');
            }

            // 2. Verificar traslapes si las fechas cambiaron
            if (data.fecha_inicio || data.fecha_fin) {
                const overlappingReservations = await this.reservasRepository.countOverlappingReservations(
                    current.id_inmueble,
                    inicio,
                    fin
                );

                if (overlappingReservations > 0) {
                    throw new Error('No se puede actualizar el bloqueo: el nuevo rango coincide con una reserva');
                }

                const overlappingBlocks = await this.bloqueosRepository.countOverlappingBlocks(
                    current.id_inmueble,
                    inicio,
                    fin,
                    id
                );

                if (overlappingBlocks > 0) {
                    throw new Error('No se puede actualizar el bloqueo: el nuevo rango coincide con otro bloqueo');
                }
            }

            // 3. Actualizar
            const updated = await this.bloqueosRepository.updateBloqueo(id, data);
            if (!updated) throw new Error('Error al actualizar el bloqueo');

            return updated;
        } catch (error) {
            console.error('Error en UpdateBloqueoService:', error);
            throw error;
        }
    }
}
