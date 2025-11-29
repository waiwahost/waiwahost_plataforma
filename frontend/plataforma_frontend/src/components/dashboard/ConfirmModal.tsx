import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, message, onConfirm, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center relative">
        <button className="absolute top-2 right-3 text-gray-500 text-xl" onClick={onClose}>&times;</button>
        <div className="text-yellow-500 text-3xl mb-2">&#9888;</div>
        <div className="text-lg font-semibold mb-4">{message}</div>
        <div className="flex justify-center gap-4">
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Aceptar</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
