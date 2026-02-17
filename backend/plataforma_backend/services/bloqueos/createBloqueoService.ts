import { BloqueosRepository } from '../../repositories/bloqueos.repository';
import { ReservasRepository } from '../../repositories/reservas.repository';
import { CreateBloqueoRequest, Bloqueo } from '../../interfaces/bloqueo.interface';

export class CreateBloqueoService {
    private bloqueosRepository: BloqueosRepository;
    private reservasRepository: ReservasRepository;

    constructor() {
        this.bloqueosRepository = new BloqueosRepository();
        this.reservasRepository = new ReservasRepository();
    }

    async execute(data: CreateBloqueoRequest): Promise<Bloqueo> {
        try {
            // 1. Validar fechas
            const inicio = new Date(data.fecha_inicio);
            const fin = new Date(data.fecha_fin);

            if (inicio > fin) {
                throw new Error('La fecha de inicio debe ser anterior o igual a la fecha de fin');
            }

            // 2. Verificar traslapes con reservas
            const overlappingReservations = await this.reservasRepository.countOverlappingReservations(
                data.id_inmueble,
                data.fecha_inicio,
                data.fecha_fin
            );

            if (overlappingReservations > 0) {
                throw new Error('No se puede crear el bloqueo: ya existe una reserva en estas fechas');
            }

            // 3. Verificar traslapes con otros bloqueos
            const overlappingBlocks = await this.bloqueosRepository.countOverlappingBlocks(
                data.id_inmueble,
                data.fecha_inicio,
                data.fecha_fin
            );

            if (overlappingBlocks > 0) {
                throw new Error('No se puede crear el bloqueo: ya existe otro bloqueo en estas fechas');
            }

            // 4. Crear el bloqueo
            return await this.bloqueosRepository.createBloqueo(data);
        } catch (error) {
            console.error('Error en CreateBloqueoService:', error);
            throw error;
        }
    }
}
