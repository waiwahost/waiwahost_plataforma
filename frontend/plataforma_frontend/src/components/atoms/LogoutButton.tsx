'use client';

import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/atoms/Button';

export const LogoutButton = () => {
  const { logout } = useAuth();
  return (
    <Button onClick={logout} variant="secondary" className="ml-auto bg-gray-500 hover:bg-gray-700 text-white font-medium cursor-pointer">Cerrar sesión</Button>
  );
};
