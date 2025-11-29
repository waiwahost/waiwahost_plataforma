import React, { useState } from 'react';
import { InputField } from '../molecules/InputField';
import { Button } from '../atoms/Button';
import { resetPassword } from '../../auth/passwordApi';
import { PasswordCriteria } from './PasswordCriteria';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const passwordCriteria = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: 'Al menos 1 número', test: (v: string) => /\d/.test(v) },
  { label: 'Al menos 1 minúscula', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Al menos 1 mayúscula', test: (v: string) => /[A-Z]/.test(v) },
];

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ open, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const isValid = passwordCriteria.every(c => c.test(newPassword));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValid) {
      setError('La contraseña no cumple los requisitos.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, newPassword);
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96 relative">
        <button className="absolute top-2 right-3 text-gray-500" onClick={onClose}>&times;</button>
        <h3 className="text-lg font-bold mb-4 text-center">Restablecer contraseña</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <InputField label="Nueva contraseña" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          <PasswordCriteria password={newPassword} criteria={passwordCriteria} />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="flex gap-2 mt-2">
            <Button type="button" variant="secondary" className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-medium" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 bg-tourism-navy hover:bg-tourism-navy/90 text-white font-medium" disabled={loading || !isValid}>{loading ? 'Enviando...' : 'Aceptar'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
