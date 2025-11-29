
import React from 'react';

interface MonthSelectorProps {
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, setSelectedMonth }) => {
  const months = [
    { value: -1, label: 'Todo' },
    { value: 0, label: 'Enero' },
    { value: 1, label: 'Febrero' },
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="month-selector" className="text-sm font-medium text-gray-700">
        Mes:
      </label>
      <select
        id="month-selector"
        name="month-selector"
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
      >
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthSelector;
