import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import UserRow from './UserRow';
import ScrollableTable from '../ui/ScrollableTable';

export interface IDataUserIn {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  rol: string;
  empresa: string;
  estado: string;
}

interface UsersTableProps {
  users: IDataUserIn[];
  onEdit: (user: IDataUserIn) => void;
  onDelete: (user: IDataUserIn) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onDelete }) => {
  const { user } = useAuth();
  const canDelete = user?.permisos?.includes('eliminar_usuarios');
  return (
    <ScrollableTable className="shadow">
      <table className="min-w-full bg-white scrollable-table">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(userRow => (
            <UserRow
              key={userRow.id}
              cedula={userRow.cedula}
              nombre={userRow.nombre}
              apellido={userRow.apellido}
              username={userRow.username}
              email={userRow.email}
              rol={userRow.rol}
              empresa={userRow.empresa}
              estado={userRow.estado}
              onEdit={() => onEdit(userRow)}
              onDelete={() => onDelete(userRow)}
              canDelete={!!canDelete}
            />
          ))}
        </tbody>
      </table>
    </ScrollableTable>
  );
};

export default UsersTable;
