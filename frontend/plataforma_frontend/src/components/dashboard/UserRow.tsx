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
    <tr className="hover:bg-gray-50/80 dark:hover:bg-muted/20 transition-colors group">
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="text-[13px] text-gray-700 dark:text-gray-300">{cedula}</div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="font-semibold text-gray-900 dark:text-foreground">{nombre}</div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="font-semibold text-gray-900 dark:text-foreground">{apellido}</div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="text-[13px] text-gray-700 dark:text-gray-300">{username}</div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="text-[13px] text-gray-700 dark:text-gray-300">{email}</div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="text-[13px] capitalize text-gray-700 dark:text-gray-300">{(rol || '').replace('_', ' ')}</div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="text-[13px] text-gray-700 dark:text-gray-300">{empresa}</div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-center">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap inline-flex items-center justify-center capitalize ${estado === 'activo'
          ? 'bg-[#dcfce7] text-[#15803d] dark:bg-[#dcfce7]/10 dark:text-[#dcfce7]'
          : 'bg-[#fee2e2] text-[#b91c1c] dark:bg-[#fee2e2]/10 dark:text-[#fee2e2]'
          }`}>
          {estado}
        </span>
      </td>
      <td className="flex w-full h-full items-center justify-center text-center text-gray-500 dark:text-gray-400 gap-2 sticky right-0 bg-white dark:bg-card border-l border-gray-100 dark:border-border transition-colors z-10 h-[72px]">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-md hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900/40 dark:hover:text-blue-400 border border-transparent transition-colors items-center justify-center"
          title="Editar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 12.362-12.303Z" />
          </svg>
        </button>
        <button
          onClick={canDelete ? onDelete : undefined}
          className={`p-1.5 rounded-md border border-transparent transition-colors items-center justify-center ${canDelete
            ? 'hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900/40 dark:hover:text-red-400'
            : 'text-gray-400 cursor-not-allowed opacity-50'
            }`}
          title={canDelete ? 'Eliminar' : 'No tienes permisos para eliminar'}
          disabled={!canDelete}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </td>
    </tr>
  );
};

export default UserRow;
