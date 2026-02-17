import { ReservasRepository } from '../../repositories/reservas.repository';
import { BloqueosRepository } from '../../repositories/bloqueos.repository';

export const createOrUpdateReservaPublicService = async (data: any) => {
    const repository = new ReservasRepository();
    const blockingRepository = new BloqueosRepository();

    // Asegurar valores por defecto para campos financieros si no vienen
    const reservaData = {
        ...data,
        precio_total: data.precio_total || 0,
        total_reserva: data.total_reserva || 0,
        total_pagado: data.total_pagado || 0,
        total_pendiente: data.total_pendiente || 0,
    };

    let resultReserva;

    // Validar disponibilidad antes de continuar (para creación o actualización de fechas)
    const checkAvailability = async (idInmueble: number, inicio: string, fin: string, excludeReservaId?: number) => {
        const overlappingReservations = await repository.countOverlappingReservations(idInmueble, inicio, fin, excludeReservaId);
        if (overlappingReservations > 0) throw new Error('Las fechas seleccionadas ya están ocupadas por otra reserva');

        const overlappingBlocks = await blockingRepository.countOverlappingBlocks(idInmueble, inicio, fin);
        if (overlappingBlocks > 0) throw new Error('Las fechas seleccionadas están bloqueadas en el calendario');
    };

    // Si viene id_reserva, intentamos actualizar
    if (reservaData.id_reserva) {
        const existingReserva = await repository.getReservaById(reservaData.id_reserva);

        if (existingReserva) {
            // Actualizar
            // Mapeamos los campos que se pueden actualizar
            const updateFields = {
                fecha_inicio: reservaData.fecha_inicio,
                fecha_fin: reservaData.fecha_fin,
                numero_huespedes: reservaData.numero_huespedes,
                precio_total: reservaData.precio_total,
                estado: reservaData.estado,
                observaciones: reservaData.observaciones,
                plataforma_origen: reservaData.plataforma_origen,
            };

            // Validar disponibilidad si las fechas cambiaron
            if (reservaData.fecha_inicio !== existingReserva.fecha_inicio || reservaData.fecha_fin !== existingReserva.fecha_fin) {
                await checkAvailability(
                    reservaData.id_inmueble || existingReserva.id_inmueble,
                    reservaData.fecha_inicio,
                    reservaData.fecha_fin,
                    reservaData.id_reserva
                );
            }

            resultReserva = await repository.updateReserva(reservaData.id_reserva, updateFields);
        }
    }

    // Si no se actualizó (porque no venía ID o no existía), creamos una nueva
    if (!resultReserva) {
        // Aseguramos que no se envíe id_reserva si es creación para evitar errores de PK
        // El repositorio espera un objeto con campos específicos, nos aseguramos de pasarlos
        const createPayload = {
            id_inmueble: reservaData.id_inmueble,
            fecha_inicio: reservaData.fecha_inicio,
            fecha_fin: reservaData.fecha_fin,
            estado: reservaData.estado || 'pendiente',
            codigo_reserva: await repository.generateNextCodigoReserva(), // Generamos código si es nueva
            precio_total: reservaData.precio_total,
            total_reserva: reservaData.total_reserva,
            total_pagado: reservaData.total_pagado,
            total_pendiente: reservaData.total_pendiente,
            observaciones: reservaData.observaciones,
            numero_huespedes: reservaData.numero_huespedes,
            plataforma_origen: reservaData.plataforma_origen || 'directa'
        };

        // Validar disponibilidad para creación
        await checkAvailability(reservaData.id_inmueble, reservaData.fecha_inicio, reservaData.fecha_fin);

        resultReserva = await repository.createReserva(createPayload);
    }

    // Procesar Huéspedes usando el HuespedesService para consistencia
    const reservaId = resultReserva?.id || resultReserva?.id_reserva;

    if (reservaId && Array.isArray(data.huespedes) && data.huespedes.length > 0) {
        const { HuespedesService } = await import('./huespedesService');
        const huespedesService = new HuespedesService();

        // Mapear y limpiar los datos
        const huespedesSanitized = data.huespedes.map((h: any) => ({
            ...h,
            nombre: h.nombre ? String(h.nombre).trim() : undefined,
            apellido: h.apellido ? String(h.apellido).trim() : undefined,
            email: h.email ? String(h.email).trim() : undefined,
            telefono: h.telefono ? String(h.telefono).trim() : undefined,
            documento_numero: h.documento_numero ? String(h.documento_numero).trim() : undefined,
            documento_tipo: h.documento_tipo ? String(h.documento_tipo).trim() : undefined,
            fecha_nacimiento: h.fecha_nacimiento ? String(h.fecha_nacimiento).trim() : undefined,
        }));

        await huespedesService.updateHuespedesForReserva(reservaId, huespedesSanitized);
    } else {
        console.warn(`[PublicService] Skipping guest processing. HasID=${!!reservaId}, HasGuests=${Array.isArray(data.huespedes)}`);
    }

    return resultReserva;
};
