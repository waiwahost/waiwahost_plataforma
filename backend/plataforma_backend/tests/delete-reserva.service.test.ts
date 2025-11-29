import { deleteReservaService } from '../services/reservas/deleteReservaService';
import { ReservasRepository } from '../repositories/reservas.repository';

describe('deleteReservaService', () => {
  it('debe lanzar error si el id es inválido', async () => {
    await expect(deleteReservaService(NaN)).rejects.toThrow('ID de reserva inválido');
  });

  it('debe anular correctamente la reserva', async () => {
    const mockDelete = jest.spyOn(ReservasRepository.prototype, 'deleteReserva').mockResolvedValue(true);
    const result = await deleteReservaService(1);
    expect(result).toEqual({ id: 1, estado: 'anulado' });
    expect(mockDelete).toHaveBeenCalledWith(1);
    mockDelete.mockRestore();
  });

  it('debe lanzar error si no se pudo anular', async () => {
    jest.spyOn(ReservasRepository.prototype, 'deleteReserva').mockResolvedValue(false);
    await expect(deleteReservaService(2)).rejects.toThrow('No se pudo anular la reserva');
  });
});
