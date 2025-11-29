// Constantes para las plataformas de origen de reservas
export type PlataformaOrigen = 'airbnb' | 'booking' | 'pagina_web' | 'directa';

export const PLATAFORMAS_ORIGEN: { value: PlataformaOrigen; label: string; color: string }[] = [
  { value: 'directa', label: 'Directa', color: 'bg-green-100 text-green-800' },
  { value: 'airbnb', label: 'Airbnb', color: 'bg-red-100 text-red-800' },
  { value: 'booking', label: 'Booking', color: 'bg-blue-100 text-blue-800' },
  { value: 'pagina_web', label: 'Página Web', color: 'bg-purple-100 text-purple-800' }
];

export const getPlataformaLabel = (plataforma: PlataformaOrigen | undefined): string => {
  if (!plataforma) return 'No especificada';
  const found = PLATAFORMAS_ORIGEN.find(p => p.value === plataforma);
  return found ? found.label : plataforma;
};

export const getPlataformaColor = (plataforma: PlataformaOrigen | undefined): string => {
  if (!plataforma) return 'bg-gray-100 text-gray-800';
  const found = PLATAFORMAS_ORIGEN.find(p => p.value === plataforma);
  return found ? found.color : 'bg-gray-100 text-gray-800';
};