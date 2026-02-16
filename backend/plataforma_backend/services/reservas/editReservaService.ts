import { EditReservaRequest } from '../../interfaces/reserva.interface';
import { ReservasRepository } from '../../repositories/reservas.repository';
import { isPlataformaValida } from '../../constants/plataformas';

const reservasRepository = new ReservasRepository();

export async function editReservaService(id: number, data: EditReservaRequest) {
  // Validar que al menos un campo editable esté presente
  const editableFields = [
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


  // Si el estado de la reserva es "confirmada", crear tarjeta de registro
  try {
  const pasoAConfirmado = 
    reservaOriginal.estado !== 'confirmada' && 
    fieldsToUpdate.estado === 'confirmada';

  if (pasoAConfirmado) {
    console.log("El estado cambió a confirmada. Se creará la tarjeta de registro.");
    const { TarjetaRegistroService } = await import('./tarjetaRegistroService');
    const tarjetaRegistroService = new TarjetaRegistroService();
    
    await tarjetaRegistroService.crearDesdeReserva(id);
  }
} catch (error) {
  console.error('Error al crear tarjeta de registro:', error);
}

  return updated;
}
