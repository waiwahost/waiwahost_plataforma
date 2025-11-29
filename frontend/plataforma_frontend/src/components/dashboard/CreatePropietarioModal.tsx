import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { IPropietarioForm } from '../../interfaces/Propietario';

interface CreatePropietarioModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: IPropietarioForm) => void;
  initialData?: IPropietarioForm;
  isEdit?: boolean;
}

const CreatePropietarioModal: React.FC<CreatePropietarioModalProps> = ({
  open,
  onClose,
  onCreate,
  initialData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<IPropietarioForm>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    cedula: '',
    estado: 'activo',
    id_empresa: 1, // Por ahora hardcodeado
  });

  const [errors, setErrors] = useState<Partial<Record<keyof IPropietarioForm, string>>>({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          direccion: '',
          cedula: '',
          estado: 'activo',
          id_empresa: 1,
        });
      }
      setErrors({});
    }
  }, [open, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof IPropietarioForm, string>> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    // Solo validar cédula si no es modo edición
    if (!isEdit && !formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onCreate(formData);
    }
  };

  const handleInputChange = (field: keyof IPropietarioForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Editar Propietario' : 'Crear Nuevo Propietario'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${
                  errors.nombre ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombre del propietario"
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => handleInputChange('apellido', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${
                  errors.apellido ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Apellido del propietario"
              />
              {errors.apellido && (
                <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula *
              {isEdit && <span className="text-xs text-gray-500 ml-1">(No editable)</span>}
            </label>
            <input
              type="text"
              value={formData.cedula}
              onChange={(e) => handleInputChange('cedula', e.target.value)}
              disabled={isEdit}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${
                errors.cedula ? 'border-red-300' : 'border-gray-300'
              } ${isEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              placeholder="Número de cédula"
            />
            {errors.cedula && (
              <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${
                errors.telefono ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+57 300 123 4567"
            />
            {errors.telefono && (
              <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección *
            </label>
            <textarea
              value={formData.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${
                errors.direccion ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Dirección completa"
              rows={3}
            />
            {errors.direccion && (
              <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              value={formData.estado}
              onChange={(e) => handleInputChange('estado', e.target.value as 'activo' | 'inactivo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-tourism-teal text-white hover:bg-tourism-teal/90"
            >
              {isEdit ? 'Actualizar' : 'Crear'} Propietario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePropietarioModal;
