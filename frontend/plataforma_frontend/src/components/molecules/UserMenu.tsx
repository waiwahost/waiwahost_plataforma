import React from 'react';
import { LogoutButton } from '../atoms/LogoutButton';
import { useAuth } from '../../auth/AuthContext'; // Asegúrate de que la ruta sea correcta
import { Home } from 'lucide-react';

const UserMenu: React.FC = () => {
  // Obtiene el usuario del contexto de autenticación
  const { user } = useAuth();
  const userName = user?.name || 'Usuario';

  const isPropietario = user && (
    String(user.role) === 'PROPIETARIO' ||
    String(user.role) === '4' ||
    (user as any).id_roles === 4
  );

  return (
    <div className="flex items-center gap-2">
      {isPropietario && (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <Home className="h-3 w-3" />
          Propietario
        </span>
      )}
      <span className="text-sm font-medium">{userName}</span>
      <LogoutButton />
    </div>
  );
};

export default UserMenu;
