import { ReservasRepository } from '../../repositories/reservas.repository';

const reservasRepository = new ReservasRepository();

export async function deleteReservaService(id: number) {
  if (!id || isNaN(id)) {
    throw new Error('ID de reserva inválido');
  }
  const deleted = await reservasRepository.deleteReserva(id);
  if (!deleted) {
    throw new Error('No se pudo eliminar la reserva o no existe');
  }
  return { id, status: 'deleted' };
}
