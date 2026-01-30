import { ReservasRepository } from '../../repositories/reservas.repository';
import { Reserva, Huesped, HuespedPrincipal } from '../../interfaces/reserva.interface';

export class GetReservaPublicService {
    private reservasRepository: ReservasRepository;

    constructor() {
        this.reservasRepository = new ReservasRepository();
    }

    /**
     * Procesa y completa los datos de un huésped
     */
    private processHuespedData(baseData: any, isPrincipal: boolean): Huesped {
        return {
            id: baseData.id,
            nombre: baseData.nombre || 'Sin nombre',
            apellido: baseData.apellido || 'Sin apellido',
            email: baseData.email || baseData.correo || 'sin-email@ejemplo.com',
            telefono: baseData.telefono || 'Sin teléfono',
            documento_tipo: baseData.documento_tipo || 'cedula',
            documento_numero: baseData.documento_numero || 'Sin documento',
            fecha_nacimiento: baseData.fecha_nacimiento ? new Date(baseData.fecha_nacimiento).toISOString().split('T')[0] : '',
            es_principal: isPrincipal,
            id_reserva: baseData.id_reserva,
            ...(isPrincipal &&{
                ciudad_procedencia: baseData.ciudad_procedencia,
                ciudad_residencia: baseData.ciudad_residencia,
                motivo: baseData.motivo
            }
            )
        };
    }

    /**
     * Obtiene el huésped principal de una lista de huéspedes
     */
    private getHuespedPrincipal(huespedes: Huesped[]): HuespedPrincipal {
        const principal = huespedes.find(h => h.es_principal) || huespedes[0];

        if (!principal) {
            return {
                nombre: 'Huésped',
                apellido: 'Principal',
                email: 'huesped@email.com',
                telefono: '+57 300 123 4567'
            };
        }

        return {
            nombre: principal.nombre,
            apellido: principal.apellido,
            email: principal.email,
            telefono: principal.telefono,

            ciudadResidencia: principal.ciudad_residencia,
            ciudadProcedencia: principal.ciudad_procedencia,
            motivo: principal.motivo
        };
    }

    /**
     * Servicio para obtener una reserva pública por ID
     */
    async execute(id: number): Promise<Reserva | null> {
        try {
            // 1. Obtener la reserva básica
            const reservaBasica = await this.reservasRepository.getReservaById(id);

            if (!reservaBasica) {
                return null;
            }

            // 2. Obtener huéspedes de la reserva
            const huespedesRaw = await this.reservasRepository.getHuespedesByReservaId(id);

            // 3. Procesar huéspedes
            const huespedes: Huesped[] = huespedesRaw.map(h =>
                this.processHuespedData(h, h.es_principal)
            );

            // 4. Construir respuesta completa
            const reservaCompleta: Reserva = {
                id: reservaBasica.id,
                codigo_reserva: reservaBasica.codigo_reserva,
                id_inmueble: reservaBasica.id_inmueble,
                nombre_inmueble: reservaBasica.nombre_inmueble,
                huesped_principal: this.getHuespedPrincipal(huespedes),
                fecha_inicio: reservaBasica.fecha_inicio,
                fecha_fin: reservaBasica.fecha_fin,
                numero_huespedes: reservaBasica.numero_huespedes || huespedes.length || 1,
                huespedes: huespedes,
                precio_total: reservaBasica.precio_total,
                total_reserva: reservaBasica.total_reserva,
                total_pagado: reservaBasica.total_pagado,
                total_pendiente: reservaBasica.total_pendiente,
                estado: reservaBasica.estado,
                fecha_creacion: new Date(reservaBasica.fecha_creacion).toISOString().split('T')[0],
                observaciones: reservaBasica.observaciones,
                id_empresa: reservaBasica.id_empresa,
                plataforma_origen: reservaBasica.plataforma_origen
            };

            return reservaCompleta;
        } catch (error) {
            console.error('Error en GetReservaPublicService:', error);
            throw new Error('Error al obtener la información de la reserva');
        }
    }
}
