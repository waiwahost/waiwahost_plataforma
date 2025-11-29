import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../atoms/Button';

interface CreatePropietarioButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const CreatePropietarioButton: React.FC<CreatePropietarioButtonProps> = ({ 
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
      Nuevo Propietario
    </Button>
  );
};

export default CreatePropietarioButton;
