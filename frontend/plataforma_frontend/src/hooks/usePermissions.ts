import { useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    const userPermissions = user?.permisos || [];
    const isAuthenticated = !!user;
    
    return {
      // Permisos de inmuebles (con fallback temporal a permisos de usuarios)
      inmuebles: {
        view: userPermissions.includes('ver_inmuebles') || userPermissions.includes('ver_usuarios') || isAuthenticated,
        create: userPermissions.includes('crear_inmuebles') || userPermissions.includes('crear_usuarios') || isAuthenticated,
        edit: userPermissions.includes('editar_inmuebles') || userPermissions.includes('editar_usuarios') || isAuthenticated,
        delete: userPermissions.includes('eliminar_inmuebles') || userPermissions.includes('eliminar_usuarios') || isAuthenticated,
      },
      // Permisos de usuarios
      usuarios: {
        view: userPermissions.includes('ver_usuarios') || isAuthenticated,
        create: userPermissions.includes('crear_usuarios'),
        edit: userPermissions.includes('editar_usuarios'),
        delete: userPermissions.includes('eliminar_usuarios'),
      },
      // Información del usuario
      user,
      isAuthenticated,
    };
  }, [user]);

  return permissions;
};
