/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
//import { companies } from '../../lib/companiesAndRoles';
import { useAuth } from '../../auth/AuthContext';
import { getEmpresasApi } from '../../auth/getEmpresasApi';

const roles = [
  { value: 2, label: 'Empresa' },
  { value: 3, label: 'Administrador' },
  { value: 4, label: 'Propietario' },
];

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (user: { cedula: string; nombre: string; apellido: string; email: string; password: string; id_roles: number; id_empresa: string | number | null; username: string }) => Promise<void>;
  initialData?: Partial<typeof initialForm>;
  isEdit?: boolean;
}

const initialForm = { cedula: '', nombre: '', apellido: '', email: '', password: '', id_roles: '', id_empresa: '', username: '' };

const CreateUserModal: React.FC<CreateUserModalProps> = ({ open, onClose, onCreate, initialData, isEdit }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [empresas, setEmpresas] = useState<{ id_empresa: number; nombre: string }[]>([]);
  const { user } = useAuth();

  React.useEffect(() => {
    if (open && user?.role === 'superadmin') {
      getEmpresasApi().then(res => {
        if (res.success) setEmpresas(res.data);
      });
    }
    if (open && initialData) {
      setForm({ ...initialForm, ...initialData, password: '' });
    } else if (open) {
      setForm(initialForm);
    }
  }, [open, initialData, user]);

  const validate = () => {
    const newErrors: { [k: string]: string } = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.email.trim()) newErrors.email = 'El correo es obligatorio';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'Correo inválido';
    if (!isEdit && !form.password) newErrors.password = 'La contraseña es obligatoria';
    if (!form.username.trim()) newErrors.username = 'El username es obligatorio';
    else if (!/^[\w-]+$/.test(form.username)) newErrors.username = 'Solo letras, números, guiones y guiones bajos';
    if (!form.id_roles) newErrors.id_roles = 'Selecciona un rol';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setSubmitting(true);
    //    const password_hash = CryptoJS.SHA256(form.password).toString();
    await onCreate({
      cedula: form.cedula,
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      password: form.password,
      id_roles: Number(form.id_roles),
      id_empresa: user?.role === 'superadmin'
        ? (form.id_empresa ? Number(form.id_empresa) : null)
        : (user?.empresaId ? Number(user.empresaId) : null),
      username: form.username,
    });
    setSubmitting(false);
    setForm(initialForm);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-3 text-gray-500 text-xl" onClick={onClose}>&times;</button>
        <h3 className="text-lg font-bold mb-4">{isEdit ? 'Editar usuario' : 'Crear nuevo usuario'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
            <input name="cedula" value={form.cedula} onChange={handleChange} placeholder="Ingrese la cédula" className="w-full border rounded px-3 py-2" disabled={isEdit} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ingrese el nombre" className="w-full border rounded px-3 py-2" />
            {errors.nombre && <div className="text-red-500 text-xs mt-1">{errors.nombre}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Ingrese el apellido" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="ejemplo@correo.com" className="w-full border rounded px-3 py-2" type="email" disabled={isEdit} />
            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input name="username" value={form.username} onChange={handleChange} placeholder="Ingrese nombre de usuario" className="w-full border rounded px-3 py-2" disabled={isEdit} />
            {errors.username && <div className="text-red-500 text-xs mt-1">{errors.username}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input name="password" value={form.password} onChange={handleChange} placeholder={isEdit ? "Dejar en blanco para no cambiar" : "Ingrese contraseña"} className="w-full border rounded px-3 py-2" type="password" />
            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select name="id_roles" value={form.id_roles} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={isEdit}>
              <option value="">Selecciona rol</option>
              {user?.role === 'superadmin' && (
                <>
                  <option value="2">Empresa</option>
                </>
              )}
              <option value="3">Administrador</option>
              <option value="4">Propietario</option>
            </select>
            {errors.id_roles && <div className="text-red-500 text-xs mt-1">{errors.id_roles}</div>}
          </div>
          {user?.role === 'superadmin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <select
                name="id_empresa"
                value={form.id_empresa}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                disabled={isEdit}
              >
                <option value="">Selecciona empresa</option>
                {empresas.map(e => (
                  <option key={e.id_empresa} value={e.id_empresa}>{e.nombre}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-tourism-teal text-white rounded hover:bg-tourism-navy" disabled={submitting}>{submitting ? (isEdit ? 'Editando...' : 'Creando...') : (isEdit ? 'Editar' : 'Crear')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
