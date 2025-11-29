import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateForDisplay, addDaysToDateString, getTodayString, isToday } from '../../lib/dateUtils';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const changeDate = (days: number) => {
    const newDate = addDaysToDateString(selectedDate, days);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(getTodayString());
  };

  const checkIsToday = () => {
    return isToday(selectedDate);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-tourism-navy" />
          <h3 className="text-lg font-semibold text-tourism-navy">
            Caja del día
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Día anterior"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          
          <div className="flex flex-col items-center min-w-[200px]">
            <span className="text-sm font-medium text-tourism-navy capitalize">
              {formatDateForDisplay(selectedDate)}
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="mt-1 text-xs text-gray-500 border-none bg-transparent cursor-pointer"
            />
          </div>
          
          <button
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Día siguiente"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {!checkIsToday() && (
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-tourism-teal text-white rounded-lg hover:bg-tourism-teal/90 transition-colors"
            >
              Hoy
            </button>
          )}
          {checkIsToday() && (
            <span className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg font-medium">
              Hoy
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateSelector;