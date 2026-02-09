'use client';

import { Building2, MapPin, Users, TrendingUp } from "lucide-react";
import { useAuth } from '../../auth/AuthContext';
import { useState } from 'react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Label } from '../../components/atoms/Label';
import { Spinner } from '../../components/atoms/Spinner';
import { PasswordInput } from "../../components/atoms/PasswordInput";
import { ResetPasswordModal } from '../../components/organisms/ResetPasswordModal';
import { loginUser } from '../../auth/loginApi';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await loginUser(email, password);
      login(token, user);
      // No llamar setLoading(false) aquí, el spinner se mantiene hasta que AuthProvider navegue
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-tourism-navy via-tourism-teal to-tourism-sage">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-tourism-gold p-3 rounded-xl">
                <Building2 className="h-8 w-8 text-tourism-navy" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Waiwahost</h1>
                <p className="text-tourism-sage/80">Gestión Inmobiliaria</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Gestiona tus propiedades turísticas con
              <span className="text-tourism-gold"> confianza</span>
            </h2>
            <p className="text-lg text-tourism-sage/90 mb-8">
              Plataforma integral para la administración de inmuebles turísticos, reservas y huéspedes con herramientas profesionales.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-tourism-gold/20 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-tourism-gold" />
                </div>
                <span>Gestión multi-propiedad</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-tourism-gold/20 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-tourism-gold" />
                </div>
                <span>Control de huéspedes y reservas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-tourism-gold/20 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-tourism-gold" />
                </div>
                <span>Análisis y reportes avanzados</span>
              </div>
            </div>
          </div>
        </div>
        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
                  <div className="bg-tourism-gold p-2 rounded-lg">
                    <Building2 className="h-6 w-6 text-tourism-navy" />
                  </div>
                  <span className="text-xl font-bold text-tourism-navy">Waiwahost</span>
                </div>
                <h3 className="text-2xl font-bold text-tourism-navy mb-2">Iniciar Sesión</h3>
                <p className="text-gray-600">Accede a tu panel de gestión inmobiliaria</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-tourism-navy font-medium">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4zm0 0l8 8 8-8" /></svg>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@empresa.com"
                      className="pl-10 h-12 border-gray-200 focus:border-tourism-teal focus:ring-tourism-teal"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-tourism-navy font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <PasswordInput
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="focus:border-tourism-teal focus:ring-tourism-teal"
                      leftIcon={
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      }
                    />

                  </div>
                </div>
                {error && <div className="text-red-500 text-center text-sm">{error}</div>}
                <Button type="submit" className="w-full h-12 bg-tourism-navy hover:bg-tourism-navy/90 text-white font-medium">Entrar</Button>
              </form>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-tourism-teal hover:underline text-sm"
                  onClick={() => setShowReset(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              {resetSuccess && (
                <div className="text-green-600 text-center text-sm mt-2">
                  Contraseña restablecida correctamente. Ahora puedes iniciar sesión.
                </div>
              )}
              <ResetPasswordModal
                open={showReset}
                onClose={() => setShowReset(false)}
                onSuccess={() => {
                  setShowReset(false);
                  setResetSuccess(true);
                  setTimeout(() => setResetSuccess(false), 5000);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
