import { ReservasRepository } from '../../repositories/reservas.repository';

const reservasRepository = new ReservasRepository();

export async function deleteReservaService(id: number) {
  if (!id || isNaN(id)) {
    throw new Error('ID de reserva inválido');
  }
  const anulado = await reservasRepository.deleteReserva(id);
  if (!anulado) {
    throw new Error('No se pudo anular la reserva o no existe');
  }
  return { id, estado: 'anulado' };
}
