'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
// Define User type here if not available elsewhere
export interface User {
  id: string;
  name: string;
  email: string;
  permisos?: string[];
  role?: string;
  empresaId?: number | null;
  propietarioId?: number | null;
  inmuebles?: number[];
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('token');
      const u = localStorage.getItem('user');
      if (t && u) {
        setToken(t);
        try {
          const parsedUser = JSON.parse(u);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setIsReady(true);
    }
  }, []);

  // Removemos el segundo useEffect que puede estar causando el problema

  const login = (t: string, u: User) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.replace('/login');
  };

  if (!isReady) return null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
