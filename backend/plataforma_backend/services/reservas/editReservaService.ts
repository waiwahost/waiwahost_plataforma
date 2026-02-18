import { EditReservaRequest } from '../../interfaces/reserva.interface';
import { ReservasRepository } from '../../repositories/reservas.repository';
import { isPlataformaValida } from '../../constants/plataformas';
import { BloqueosRepository } from '../../repositories/bloqueos.repository';

const reservasRepository = new ReservasRepository();
const bloqueosRepository = new BloqueosRepository();

export async function editReservaService(id: number, data: EditReservaRequest) {
  // Validar que al menos un campo editable esté presente
  const editableFields = [
    'id_inmueble',
    'fecha_inicio',
    'fecha_fin',
    'numero_huespedes',
    'precio_total',
    'total_reserva',
    'total_pagado',
    'total_pendiente',
    'estado',
    'observaciones',
    'plataforma_origen'
  ];

  // Validar plataforma de origen si está presente
  if (data.plataforma_origen && !isPlataformaValida(data.plataforma_origen)) {
    throw new Error('La plataforma de origen especificada no es válida');
  }

  const fieldsToUpdate: any = {};
  for (const key of editableFields) {
    if (data[key as keyof EditReservaRequest] !== undefined) {
      fieldsToUpdate[key] = data[key as keyof EditReservaRequest];
    }
  }
  if (Object.keys(fieldsToUpdate).length === 0) {
    throw new Error('Debe enviar al menos un campo editable para actualizar la reserva.');
  }

  // Validar la reserva
  const reservaOriginal = await reservasRepository.getReservaById(id);
  if (!reservaOriginal) throw new Error('Reserva no encontrada');

  // Si se actualizan fechas o el inmueble, verificar disponibilidad
  const inmuebleCambia = fieldsToUpdate.id_inmueble !== undefined && fieldsToUpdate.id_inmueble !== reservaOriginal.id_inmueble;
  if (fieldsToUpdate.fecha_inicio || fieldsToUpdate.fecha_fin || inmuebleCambia) {
    const nuevaFechaInicio = fieldsToUpdate.fecha_inicio || reservaOriginal.fecha_inicio;
    const nuevaFechaFin = fieldsToUpdate.fecha_fin || reservaOriginal.fecha_fin;
    // Si el inmueble cambia, verificar en el nuevo; si no, en el original
    const idInmuebleAVerificar = inmuebleCambia ? fieldsToUpdate.id_inmueble : reservaOriginal.id_inmueble;
    // Solo excluir la reserva actual si el inmueble NO cambia (si cambia, la reserva no existe en el nuevo inmueble)
    const excludeId = inmuebleCambia ? undefined : id;

    // 1. Verificar traslapes con otras reservas en el inmueble destino
    const countReservas = await reservasRepository.countOverlappingReservations(
      idInmuebleAVerificar,
      nuevaFechaInicio,
      nuevaFechaFin,
      excludeId
    );

    if (countReservas > 0) {
      throw new Error('Las fechas seleccionadas ya están ocupadas por otra reserva en ese inmueble');
    }

    // 2. Verificar traslapes con bloqueos en el inmueble destino
    const countBloqueos = await bloqueosRepository.countOverlappingBlocks(
      idInmuebleAVerificar,
      nuevaFechaInicio,
      nuevaFechaFin
    );

    if (countBloqueos > 0) {
      throw new Error('Las fechas seleccionadas están bloqueadas en el calendario de ese inmueble');
    }
  }

  // Actualizar la reserva principal
  const updated = await reservasRepository.updateReserva(id, fieldsToUpdate);
  if (!updated) {
    throw new Error('No se pudo actualizar la reserva.');
  }

  // Si se envían huéspedes, actualizar sus datos
  if (data.huespedes && data.huespedes.length > 0) {
    const { HuespedesService } = await import('./huespedesService');
    const huespedesService = new HuespedesService();
    await huespedesService.updateHuespedesForReserva(id, data.huespedes);
  }


  // Si el estado de la reserva es "confirmada", crear o sincronizar tarjeta de registro
  try {
    const esConfirmada = updated.estado === 'confirmada';

    if (esConfirmada) {
      console.log(`Verificando/Sincronizando tarjeta para reserva ${id}. Estado: ${updated.estado}`);
      const { TarjetaRegistroService } = await import('./tarjetaRegistroService');
      const tarjetaRegistroService = new TarjetaRegistroService();

      await tarjetaRegistroService.crearDesdeReserva(id);
    }
  } catch (error) {
    console.error('Error al procesar tarjeta de registro:', error);
  }

  return updated;
}
