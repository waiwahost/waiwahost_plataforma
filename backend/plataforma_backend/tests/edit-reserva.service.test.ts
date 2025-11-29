import { editReservaService } from '../services/reservas/editReservaService';
import { ReservasRepository } from '../repositories/reservas.repository';

describe('editReservaService', () => {
  it('debe lanzar error si no se envía ningún campo editable', async () => {
    await expect(editReservaService(1, {} as any)).rejects.toThrow('Debe enviar al menos un campo editable');
  });

  it('debe actualizar correctamente los campos permitidos', async () => {
    const mockUpdate = jest.spyOn(ReservasRepository.prototype, 'updateReserva').mockResolvedValue({ id_reserva: 1, estado: 'confirmada' } as any);
    const result = await editReservaService(1, { estado: 'confirmada' });
    expect(result).toHaveProperty('estado', 'confirmada');
    expect(mockUpdate).toHaveBeenCalledWith(1, { estado: 'confirmada' });
    mockUpdate.mockRestore();
  });

  it('debe lanzar error si updateReserva retorna null', async () => {
    jest.spyOn(ReservasRepository.prototype, 'updateReserva').mockResolvedValue(null);
    await expect(editReservaService(1, { estado: 'cancelada' })).rejects.toThrow('No se pudo actualizar la reserva');
  });
});
