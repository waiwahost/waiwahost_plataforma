import { ReservasRepository } from '../../repositories/reservas.repository';

export const createOrUpdateReservaPublicService = async (data: any) => {
    const repository = new ReservasRepository();

    // Asegurar valores por defecto para campos financieros si no vienen
    const reservaData = {
        ...data,
        precio_total: data.precio_total || 0,
        total_reserva: data.total_reserva || 0,
        total_pagado: data.total_pagado || 0,
        total_pendiente: data.total_pendiente || 0,
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

            return await repository.updateReserva(reservaData.id_reserva, updateFields);
        }
    }

    // Si no viene id_reserva o no existe, creamos una nueva
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

    return await repository.createReserva(createPayload);
};
