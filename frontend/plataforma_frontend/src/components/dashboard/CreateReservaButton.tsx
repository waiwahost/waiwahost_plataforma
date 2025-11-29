import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../atoms/Button';

interface CreateReservaButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const CreateReservaButton: React.FC<CreateReservaButtonProps> = ({ 
  onClick, 
  disabled = false 
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="default"
      className={`flex items-center gap-2 bg-tourism-teal text-white ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-tourism-teal/90'
      }`}
    >
      <Plus className="h-4 w-4" />
      Nueva Reserva
    </Button>
  );
};

export default CreateReservaButton;
