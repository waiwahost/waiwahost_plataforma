import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';

interface InmuebleOption {
  id: string;
  nombre: string;
}

interface PropertySelectorProps {
  inmuebles: InmuebleOption[];
  selectedInmueble: InmuebleOption | null;
  onInmuebleChange: (inmueble: InmuebleOption | null) => void;
  loading?: boolean;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  inmuebles,
  selectedInmueble,
  onInmuebleChange,
  loading = false
}) => {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === '') {
      onInmuebleChange(null);
    } else {
      const inmueble = inmuebles.find(inm => inm.id === value);
      if (inmueble) {
        onInmuebleChange(inmueble);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-400" />
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <Building2 className="h-5 w-5 text-tourism-navy" />
        <label htmlFor="inmueble-selector" className="text-sm font-medium text-gray-700">
          Filtrar por Inmueble:
        </label>
        <div className="relative">
          <select
            id="inmueble-selector"
            value={selectedInmueble?.id || ''}
            onChange={handleSelectChange}
            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-tourism-navy focus:border-transparent min-w-64"
          >
            <option value="">Todos los inmuebles</option>
            {inmuebles.map((inmueble) => (
              <option key={inmueble.id} value={inmueble.id}>
                {inmueble.nombre}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      
      {selectedInmueble && (
        <div className="mt-3 p-2 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            Mostrando ingresos para: <span className="font-medium">{selectedInmueble.nombre}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PropertySelector;