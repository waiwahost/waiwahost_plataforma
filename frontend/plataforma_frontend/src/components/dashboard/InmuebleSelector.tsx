import React from 'react';

import { Inmueble } from '../../interfaces/Inmueble';

interface InmuebleSelectorProps {
  inmuebles: Inmueble[];
  selectedInmueble: number;
  setSelectedInmueble: (id: number) => void;
}

const InmuebleSelector: React.FC<InmuebleSelectorProps> = ({
  inmuebles,
  selectedInmueble,
  setSelectedInmueble,
}) => {

    console.log(inmuebles);
    
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="inmueble-selector" className="text-sm font-medium text-gray-700">
        Inmueble:
      </label>

      <select
        id="inmueble-selector"
        name="inmueble-selector"
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300
                   focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                   sm:text-sm rounded-md"
        value={selectedInmueble}
        onChange={(e) => setSelectedInmueble(Number(e.target.value))}
      >
        <option value={-1}>Todos</option>

        {inmuebles.map((inmueble) => (
          <option key={inmueble.id} value={inmueble.id}>
            {inmueble.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default InmuebleSelector;
