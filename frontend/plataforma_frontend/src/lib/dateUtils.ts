/**
 * Utilidades para manejo consistente de fechas
 * Evita problemas de zona horaria al trabajar con fechas en formato string
 */

/**
 * Crea un objeto Date a partir de un string de fecha evitando problemas de zona horaria
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Date object con la fecha exacta sin problemas de zona horaria
 */
export const createDateFromString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Formatea una fecha string para display completo
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns String formateado con día completo en español
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = createDateFromString(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formatea una fecha string para display corto
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns String formateado con fecha corta
 */
export const formatDateShort = (dateString: string): string => {
  const date = createDateFromString(dateString);
  return date.toLocaleDateString('es-ES');
};

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD
 * @returns String con la fecha de hoy
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Verifica si una fecha string corresponde al día de hoy
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns true si es hoy, false si no
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

/**
 * Agrega días a una fecha string
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @param days - Número de días a agregar (puede ser negativo)
 * @returns Nueva fecha en formato YYYY-MM-DD
 */
export const addDaysToDateString = (dateString: string, days: number): string => {
  const date = createDateFromString(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Convierte una fecha Date a string YYYY-MM-DD
 * @param date - Objeto Date
 * @returns String en formato YYYY-MM-DD
 */
export const dateToString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};