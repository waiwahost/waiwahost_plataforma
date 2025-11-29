import { describe, it, expect } from 'vitest';
import { GetReservasService } from '../services/reservas/getReservasService';

describe('GetReservasService', () => {
  it('debe crear una instancia del servicio', () => {
    const service = new GetReservasService();
    expect(service).toBeDefined();
  });

  it('debe generar un código de reserva válido como fallback', () => {
    const service = new GetReservasService();
    // Acceder al método privado para testing usando la sintaxis de corchetes
    const generateCodigoReserva = (service as any).generateCodigoReserva;
    const codigo = generateCodigoReserva.call(service, 1, '2024-08-15');
    expect(codigo).toMatch(/^RSV-\d{4}-\d{3}$/);
    expect(codigo).toBe('RSV-2024-001');
  });

  it('debe calcular un precio total mockeado como fallback', () => {
    const service = new GetReservasService();
    // Acceder al método privado para testing
    const calculateMockedPrecioTotal = (service as any).calculateMockedPrecioTotal;
    const precio = calculateMockedPrecioTotal.call(service, '2024-08-15', '2024-08-18');
    expect(precio).toBeGreaterThan(0);
    expect(precio).toBe(450000); // 3 noches * 150000
  });

  it('debe procesar correctamente los datos de huéspedes reales', () => {
    const service = new GetReservasService();
    const processHuespedData = (service as any).processHuespedData;
    
    const mockData = {
      id: 1,
      nombre: 'María',
      apellido: 'García',
      email: 'maria@email.com',
      telefono: '+57 300 123 4567',
      documento_tipo: 'cedula',
      documento_numero: '12345678',
      fecha_nacimiento: '1985-03-15',
      id_reserva: 1
    };

    const result = processHuespedData.call(service, mockData, true);
    
    expect(result.nombre).toBe('María');
    expect(result.apellido).toBe('García');
    expect(result.email).toBe('maria@email.com');
    expect(result.es_principal).toBe(true);
    expect(result.documento_tipo).toBe('cedula');
  });
});
