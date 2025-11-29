import React from 'react';
import { LogoutButton } from '../atoms/LogoutButton';
import { useAuth } from '../../auth/AuthContext'; // Asegúrate de que la ruta sea correcta

const UserMenu: React.FC = () => {
  // Obtiene el usuario del contexto de autenticación
  const { user } = useAuth();
  const userName = user?.name || 'Usuario';
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{userName}</span>
      <LogoutButton />
    </div>
  );
};

export default UserMenu;
