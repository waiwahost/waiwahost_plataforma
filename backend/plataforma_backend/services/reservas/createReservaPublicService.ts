import { CreateReservaService } from './createReservaService';

// Servicio para crear reserva desde formulario público (sin autenticación)
export const createReservaPublicService = async (reservaData: any) => {
  // Instanciar el servicio de reservas
  const reservaService = new CreateReservaService();
  // Ejecutar la lógica de creación de reserva
  return await reservaService.execute(reservaData);
};
