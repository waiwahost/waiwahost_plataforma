// Mock de datos de disponibilidad de inmuebles
// Cada inmueble tiene un id, nombre y un array de reservas (rango de fechas ocupadas)

export interface AvailabilityReserva {
  id: string;
  inmuebleId: string;
  start: string; // formato YYYY-MM-DD
  end: string;   // formato YYYY-MM-DD
}

export interface AvailabilityInmueble {
  id: string;
  nombre: string;
}

export interface AvailabilityData {
  inmuebles: AvailabilityInmueble[];
  reservas: AvailabilityReserva[];
}

// Datos simulados
export const availabilityData: AvailabilityData = {
  inmuebles: [
    { id: '1', nombre: 'Casa Playa Azul' },
    { id: '2', nombre: 'Cabaña Montaña Verde' },
    { id: '3', nombre: 'Apartamento Urbano' },
  ],
  reservas: [
    { id: 'r1', inmuebleId: '1', start: '2025-09-10', end: '2025-09-15' },
    { id: 'r2', inmuebleId: '1', start: '2025-09-20', end: '2025-09-22' },
    { id: 'r3', inmuebleId: '2', start: '2025-09-12', end: '2025-09-18' },
    { id: 'r4', inmuebleId: '3', start: '2025-09-14', end: '2025-09-16' },
    { id: 'r5', inmuebleId: '3', start: '2025-09-18', end: '2025-09-20' },
  ],
};
