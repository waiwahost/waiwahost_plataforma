import React from 'react';

interface UserRowProps {
  cedula: string;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  rol: string;
  empresa: string;
  estado: string;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

const UserRow: React.FC<UserRowProps> = ({ cedula, nombre, apellido, username, email, rol, empresa, estado, onEdit, onDelete, canDelete }) => {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3 whitespace-nowrap">{cedula}</td>
      <td className="px-4 py-3 whitespace-nowrap">{nombre}</td>
      <td className="px-4 py-3 whitespace-nowrap">{apellido}</td>
      <td className="px-4 py-3 whitespace-nowrap">{username}</td>
      <td className="px-4 py-3 whitespace-nowrap">{email}</td>
      <td className="px-4 py-3 whitespace-nowrap">{rol}</td>
      <td className="px-4 py-3 whitespace-nowrap">{empresa}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          estado === 'activo' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {estado}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex justify-center gap-2">
          <button 
            onClick={onEdit} 
            className="inline-flex items-center p-2 rounded-md text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition-colors" 
            title="Editar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 12.362-12.303Z" />
            </svg>
          </button>
          <button
            onClick={canDelete ? onDelete : undefined}
            className={`inline-flex items-center p-2 rounded-md transition-colors ${
              canDelete 
                ? 'text-red-600 hover:bg-red-50 hover:text-red-800' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={canDelete ? 'Eliminar' : 'No tienes permisos para eliminar'}
            disabled={!canDelete}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
