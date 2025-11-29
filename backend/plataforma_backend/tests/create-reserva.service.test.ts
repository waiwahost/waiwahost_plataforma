import { describe, it, expect } from 'vitest';
import { CreateReservaService } from '../services/reservas/createReservaService';
import { HuespedesService } from '../services/reservas/huespedesService';

describe('CreateReservaService', () => {
  it('debe crear una instancia del servicio', () => {
    const service = new CreateReservaService();
    expect(service).toBeDefined();
  });

  it('debe validar fechas correctamente', () => {
    const service = new CreateReservaService();
    const validateDates = (service as any).validateDates;
    
    // Fechas válidas (futuras y entrada < salida)
    expect(() => {
      validateDates.call(service, '2025-12-15', '2025-12-18');
    }).not.toThrow();

    // Fecha de entrada >= fecha de salida
    expect(() => {
      validateDates.call(service, '2025-12-18', '2025-12-15');
    }).toThrow('La fecha de entrada debe ser anterior a la fecha de salida');

    // Fecha de entrada en el pasado
    expect(() => {
      validateDates.call(service, '2023-08-15', '2023-08-18');
    }).toThrow('La fecha de entrada no puede ser anterior a hoy');
  });

  it('debe validar precios correctamente', () => {
    const service = new CreateReservaService();
    const validatePrecio = (service as any).validatePrecio;
    
    // Precio válido
    expect(() => {
      validatePrecio.call(service, 450000);
    }).not.toThrow();

    // Precio inválido
    expect(() => {
      validatePrecio.call(service, 0);
    }).toThrow('El precio total debe ser mayor a 0');

    expect(() => {
      validatePrecio.call(service, -100);
    }).toThrow('El precio total debe ser mayor a 0');
  });

  it('debe validar número de huéspedes correctamente', () => {
    const service = new CreateReservaService();
    const validateNumeroHuespedes = (service as any).validateNumeroHuespedes;
    
    // Número válido
    expect(() => {
      validateNumeroHuespedes.call(service, 2);
    }).not.toThrow();

    // Número inválido
    expect(() => {
      validateNumeroHuespedes.call(service, 0);
    }).toThrow('El número de huéspedes debe estar entre 1 y 20');

    expect(() => {
      validateNumeroHuespedes.call(service, 25);
    }).toThrow('El número de huéspedes debe estar entre 1 y 20');
  });
});

describe('HuespedesService', () => {
  it('debe crear una instancia del servicio', () => {
    const service = new HuespedesService();
    expect(service).toBeDefined();
  });

  it('debe validar que existe un huésped principal', () => {
    const service = new HuespedesService();
    const validateHuespedPrincipal = (service as any).validateHuespedPrincipal;
    
    // Sin huésped principal
    expect(() => {
      validateHuespedPrincipal.call(service, [
        { es_principal: false },
        { es_principal: false }
      ]);
    }).toThrow('Debe especificar al menos un huésped principal');

    // Múltiples huéspedes principales
    expect(() => {
      validateHuespedPrincipal.call(service, [
        { es_principal: true },
        { es_principal: true }
      ]);
    }).toThrow('Solo puede haber un huésped principal por reserva');

    // Un huésped principal válido
    expect(() => {
      validateHuespedPrincipal.call(service, [
        { es_principal: true },
        { es_principal: false }
      ]);
    }).not.toThrow();
  });

  it('debe validar documentos duplicados', () => {
    const service = new HuespedesService();
    const validateDocumentosDuplicados = (service as any).validateDocumentosDuplicados;
    
    // Documentos únicos
    expect(() => {
      validateDocumentosDuplicados.call(service, [
        { documento_numero: '12345678' },
        { documento_numero: '87654321' }
      ]);
    }).not.toThrow();

    // Documentos duplicados
    expect(() => {
      validateDocumentosDuplicados.call(service, [
        { documento_numero: '12345678' },
        { documento_numero: '12345678' }
      ]);
    }).toThrow('No pueden existir huéspedes con el mismo número de documento en una reserva');
  });

  it('debe validar fechas de nacimiento', () => {
    const service = new HuespedesService();
    const validateFechaNacimiento = (service as any).validateFechaNacimiento;
    
    // Fecha válida
    expect(() => {
      validateFechaNacimiento.call(service, '1985-03-15');
    }).not.toThrow();

    // Fecha inválida
    expect(() => {
      validateFechaNacimiento.call(service, 'fecha-invalida');
    }).toThrow('Formato de fecha de nacimiento inválido');

    // Fecha futura o muy antigua
    expect(() => {
      validateFechaNacimiento.call(service, '2030-01-01');
    }).toThrow('La fecha de nacimiento no es válida');
  });
});
