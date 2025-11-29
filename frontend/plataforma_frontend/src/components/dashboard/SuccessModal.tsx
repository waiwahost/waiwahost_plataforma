import React from 'react';

interface SuccessModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ open, message, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center relative">
        <button className="absolute top-2 right-3 text-gray-500 text-xl" onClick={onClose}>&times;</button>
        <div className="text-green-600 text-3xl mb-2">✔</div>
        <div className="text-lg font-semibold mb-2">{message}</div>
        <button onClick={onClose} className="mt-2 px-4 py-2 bg-tourism-teal text-white rounded hover:bg-tourism-navy">Cerrar</button>
      </div>
    </div>
  );
};

export default SuccessModal;
