import React from 'react';

interface CreateUserButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const CreateUserButton: React.FC<CreateUserButtonProps> = ({ onClick, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded font-semibold mb-4 transition-colors ${disabled ? 'bg-gray-300 text-gray-500 cursor-default' : 'bg-tourism-teal text-white hover:bg-tourism-navy'}`}
    title="Crear nuevo usuario"
    disabled={disabled}
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
    Crear usuario
  </button>
);

export default CreateUserButton;
