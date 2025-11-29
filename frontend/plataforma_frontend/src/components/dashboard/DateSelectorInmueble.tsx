import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  className = ''
}) => {
  /**
   * Formatea la fecha para mostrar
   */
  const formatDisplayDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Normalizar fechas para comparación (solo fecha, sin hora)
    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();
    
    if (dateStr === todayStr) {
      return 'Hoy';
    } else if (dateStr === yesterdayStr) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    }
  };

  /**
   * Formatea la fecha completa para el tooltip
   */
  const formatFullDate = (date: Date): string => {
    // Asegurarnos de que usamos la misma fecha sin problemas de zona horaria
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Navegar al día anterior
   */
  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(selectedDate.getDate() - 1);
    onDateChange(previousDay);
  };

  /**
   * Navegar al día siguiente
   */
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    onDateChange(nextDay);
  };

  /**
   * Ir a hoy
   */
  const goToToday = () => {
    onDateChange(new Date());
  };

  /**
   * Verificar si es hoy
   */
  const isToday = (): boolean => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  /**
   * Verificar si es futuro
   */
  const isFutureDate = (): boolean => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fin del día de hoy
    return selectedDate > today;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botón día anterior */}
      <button
        onClick={goToPreviousDay}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        title="Día anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Fecha actual */}
      <div className="flex items-center gap-2 min-w-[120px] justify-center">
        <Calendar className="h-4 w-4 text-tourism-teal" />
        <span 
          className="font-medium text-gray-900 cursor-pointer hover:text-tourism-teal transition-colors"
          title={formatFullDate(selectedDate)}
        >
          {formatDisplayDate(selectedDate)}
        </span>
      </div>

      {/* Botón día siguiente */}
      <button
        onClick={goToNextDay}
        disabled={isFutureDate()}
        className={`p-2 rounded-md transition-colors ${
          isFutureDate()
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
        }`}
        title={isFutureDate() ? 'No se pueden ver fechas futuras' : 'Día siguiente'}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Botón ir a hoy */}
      {!isToday() && (
        <button
          onClick={goToToday}
          className="ml-2 px-3 py-1 text-xs bg-tourism-teal text-white rounded-md hover:bg-tourism-teal/90 transition-colors"
        >
          Hoy
        </button>
      )}
    </div>
  );
};

export default DateSelector;