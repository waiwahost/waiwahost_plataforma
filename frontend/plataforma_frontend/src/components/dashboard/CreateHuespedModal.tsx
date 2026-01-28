import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getEmpresasApi } from '../../auth/getEmpresasApi';
import PhoneInput from '../atoms/PhoneInput';

interface CreateHuespedModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (huesped: {
    nombre: string;
    apellido: string;
    documento_numero: string;
    email: string;
    telefono: string;
    direccion?: string;
    fecha_nacimiento?: string;
    id_empresa?: number;
  }) => Promise<void>;
  initialData?: Partial<typeof initialForm>;
  isEdit?: boolean;
}

const initialForm = {
  nombre: '',
  apellido: '',
  documento_numero: '',
  email: '',
  telefono: '',
  direccion: '',
  fecha_nacimiento: '',
  id_empresa: ''
};

const CreateHuespedModal: React.FC<CreateHuespedModalProps> = ({
  open,
  onClose,
  onCreate,
  initialData,
  isEdit = false
}) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [empresas, setEmpresas] = useState<{ id_empresa: number; nombre: string }[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user?.role === 'superadmin') {
      getEmpresasApi().then(res => {
        if (res.success) setEmpresas(res.data);
      });
    }
    if (open && initialData) {
      setForm({ ...initialForm, ...initialData });
    } else if (open) {
      setForm(initialForm);
    }
  }, [open, initialData, user]);

  const validate = () => {
    const newErrors: { [k: string]: string } = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!form.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    }

    if (!form.documento_numero.trim()) {
      newErrors.documento_numero = 'El número de documento es obligatorio';
    }

    if (!form.email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      newErrors.email = 'Correo inválido';
    }

    if (!form.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    }

    if (form.fecha_nacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(form.fecha_nacimiento)) {
      newErrors.fecha_nacimiento = 'Formato de fecha inválido (YYYY-MM-DD)';
    }

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

    try {
      await onCreate({
        nombre: form.nombre,
        apellido: form.apellido,
        documento_numero: form.documento_numero,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion || undefined,
        fecha_nacimiento: form.fecha_nacimiento || undefined,
        id_empresa: form.id_empresa ? Number(form.id_empresa) : undefined,
      });
      setForm(initialForm);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-3 text-gray-500 text-xl hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>

        <h3 className="text-lg font-bold mb-4">
          {isEdit ? 'Editar huésped' : 'Crear nuevo huésped'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre *"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tourism-teal"
            />
            {errors.nombre && (
              <div className="text-red-500 text-xs mt-1">{errors.nombre}</div>
            )}
          </div>

          <div>
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Apellido *"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tourism-teal"
            />
            {errors.apellido && (
              <div className="text-red-500 text-xs mt-1">{errors.apellido}</div>
            )}
          </div>

          <div>
            <input
              name="documento_numero"
              value={form.documento_numero}
              onChange={handleChange}
              placeholder="Número de documento *"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tourism-teal"
              disabled={isEdit}
            />
            {errors.documento_numero && (
              <div className="text-red-500 text-xs mt-1">{errors.documento_numero}</div>
            )}
          </div>

          <div>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Correo electrónico *"
              type="email"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tourism-teal"
            />
            {errors.email && (
              <div className="text-red-500 text-xs mt-1">{errors.email}</div>
            )}
          </div>

          <div>
            <PhoneInput
              label="Teléfono *"
              value={form.telefono}
              onChange={(value) => setForm({ ...form, telefono: value })}
              error={errors.telefono}
            />
          </div>

          <div>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Dirección"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tourism-teal"
            />
          </div>

          <div>
            <input
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              placeholder="Fecha de nacimiento"
              type="date"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tourism-teal"
            />
            {errors.fecha_nacimiento && (
              <div className="text-red-500 text-xs mt-1">{errors.fecha_nacimiento}</div>
            )}
          </div>

          {user?.role === 'superadmin' && (
            <div>
              <select
                name="id_empresa"
                value={form.id_empresa}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tourism-teal"
              >
                <option value="">Selecciona empresa</option>
                {empresas.map(e => (
                  <option key={e.id_empresa} value={e.id_empresa}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-tourism-teal text-white rounded hover:bg-tourism-navy transition-colors"
              disabled={submitting}
            >
              {submitting
                ? (isEdit ? 'Editando...' : 'Creando...')
                : (isEdit ? 'Editar' : 'Crear')
              }
            </button>
          </div>
        </form>

        <div className="text-xs text-gray-500 mt-2">
          * Campos obligatorios
        </div>
      </div>
    </div>
  );
};

export default CreateHuespedModal;