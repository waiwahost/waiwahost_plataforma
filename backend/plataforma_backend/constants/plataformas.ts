/**
 * Constantes para Plataformas de Origen
 * Centraliza la definición de plataformas válidas y sus propiedades
 */

// Enum de plataformas válidas
export const PLATAFORMAS_ORIGEN = [
  'airbnb',
  'booking', 
  'pagina_web',
  'directa'
] as const;

// Tipo TypeScript para plataforma de origen
export type PlataformaOrigen = typeof PLATAFORMAS_ORIGEN[number];

// Etiquetas para mostrar en la UI
export const PLATAFORMA_LABELS = {
  airbnb: 'Airbnb',
  booking: 'Booking.com',
  pagina_web: 'Página Web',
  directa: 'Directa'
} as const;

// Colores para badges en la UI (opcional para el backend)
export const PLATAFORMA_COLORS = {
  airbnb: '#FF5A5F',      // Rojo característico de Airbnb
  booking: '#003580',      // Azul característico de Booking
  pagina_web: '#28A745',   // Verde para página web propia
  directa: '#6C757D'       // Gris para reservas directas
} as const;

// Plataforma por defecto
export const PLATAFORMA_DEFAULT: PlataformaOrigen = 'directa';

/**
 * Valida si una plataforma es válida
 * @param plataforma - Plataforma a validar
 * @returns true si es válida, false en caso contrario
 */
export function isPlataformaValida(plataforma: string): plataforma is PlataformaOrigen {
  return PLATAFORMAS_ORIGEN.includes(plataforma as PlataformaOrigen);
}

/**
 * Obtiene la etiqueta de una plataforma
 * @param plataforma - Plataforma origen
 * @returns Etiqueta para mostrar en UI
 */
export function getPlataformaLabel(plataforma: PlataformaOrigen): string {
  return PLATAFORMA_LABELS[plataforma] || plataforma;
}

/**
 * Obtiene el color de una plataforma
 * @param plataforma - Plataforma origen
 * @returns Color hexadecimal
 */
export function getPlataformaColor(plataforma: PlataformaOrigen): string {
  return PLATAFORMA_COLORS[plataforma] || PLATAFORMA_COLORS.directa;
}