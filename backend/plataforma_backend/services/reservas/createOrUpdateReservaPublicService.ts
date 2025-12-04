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

    let resultReserva;

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

        resultReserva = await repository.createReserva(createPayload);
    }

    // Procesar Huéspedes
    if (resultReserva && resultReserva.id && Array.isArray(data.huespedes) && data.huespedes.length > 0) {
        const idReserva = resultReserva.id;

        for (const huespedData of data.huespedes) {
            // Validar datos mínimos del huésped
            if (!huespedData.documento_numero || !huespedData.nombre) continue;

            let idHuesped;

            // 1. Buscar si el huésped ya existe
            const existingHuesped = await repository.findHuespedByDocumento(huespedData.documento_numero);

            if (existingHuesped) {
                idHuesped = existingHuesped.id;
                // Opcional: Podríamos actualizar datos del huésped aquí si fuera necesario
            } else {
                // 2. Crear nuevo huésped
                const newHuesped = await repository.createHuespedCompleto({
                    nombre: huespedData.nombre,
                    apellido: huespedData.apellido || '',
                    email: huespedData.email || '',
                    telefono: huespedData.telefono || '',
                    documento_tipo: huespedData.documento_tipo || 'cedula',
                    documento_numero: huespedData.documento_numero,
                    fecha_nacimiento: huespedData.fecha_nacimiento || null
                });
                idHuesped = newHuesped.id;
            }

            // 3. Vincular huésped a la reserva
            // Verificamos si ya existe la relación para no duplicar (aunque la PK compuesta lo evitaría, mejor prevenir errores)
            try {
                await repository.linkHuespedToReserva(idReserva, idHuesped, !!huespedData.es_principal);
            } catch (error) {
                // Si falla por duplicado (PK violation), lo ignoramos silenciosamente
                console.warn(`Relación huesped-reserva ya existe o falló: ${error}`);
            }
        }
    }

    return resultReserva;
};
