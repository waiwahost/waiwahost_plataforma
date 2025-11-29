import React from 'react';
import { Plus } from 'lucide-react';

interface CreateHuespedButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const CreateHuespedButton: React.FC<CreateHuespedButtonProps> = ({ 
  onClick, 
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-tourism-teal text-white hover:bg-tourism-navy'
      }`}
      title={disabled ? 'No tienes permisos para crear huéspedes' : 'Crear nuevo huésped'}
    >
      <Plus className="h-4 w-4 mr-2" />
      Crear Huésped
    </button>
  );
};

export default CreateHuespedButton;