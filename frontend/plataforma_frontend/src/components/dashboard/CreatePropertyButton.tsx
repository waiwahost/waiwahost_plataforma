import React from 'react';

interface CreatePropertyButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const CreatePropertyButton: React.FC<CreatePropertyButtonProps> = ({ onClick, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    className={`flex items-center gap-2 px-2 py-1 sm:px-4 sm:py-2 lg:px-4 lg:py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-lg lg:text-lg ${
      disabled 
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
        : 'bg-blue-600 text-white hover:bg-blue-700'
    }`}
    title={disabled ? 'No tienes permisos para crear propiedades' : 'Crear nueva propiedad'}
    disabled={disabled}
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-5 md:h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
    Agregar Propiedad
  </button>
);

export default CreatePropertyButton;
