import React from 'react';
import { Plus } from 'lucide-react';

interface CreateMovimientoButtonProps {
  onClick: () => void;
}

const CreateMovimientoButton: React.FC<CreateMovimientoButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 bg-tourism-teal text-white rounded-lg hover:bg-tourism-teal/90 transition-colors font-medium shadow-sm"
    >
      <Plus className="h-4 w-4" />
      Nuevo Movimiento
    </button>
  );
};

export default CreateMovimientoButton;