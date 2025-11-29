import React from 'react';
import { X, User, Mail, Phone, MapPin, Home } from 'lucide-react';
import { IPropietarioTableData } from '../../interfaces/Propietario';

interface PropietarioDetailModalProps {
  open: boolean;
  onClose: () => void;
  propietario: IPropietarioTableData | null;
  inmuebles: Array<{ id: string; nombre: string; direccion: string; tipo: string }>;
  onInmuebleClick: (inmuebleId: string) => void;
}

const PropietarioDetailModal: React.FC<PropietarioDetailModalProps> = ({
  open,
  onClose,
  propietario,
  inmuebles,
  onInmuebleClick
}) => {
  if (!open || !propietario) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Detalle del Propietario</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Información Personal */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <p className="text-sm text-gray-900">
                  {propietario.nombre} {propietario.apellido}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identificación
                </label>
                <p className="text-sm text-gray-900">{propietario.cedula}</p>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Información de Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Correo Electrónico
                </label>
                <p className="text-sm text-gray-900">{propietario.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Teléfono
                </label>
                <p className="text-sm text-gray-900">{propietario.telefono}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Dirección
                </label>
                <p className="text-sm text-gray-900">{propietario.direccion}</p>
              </div>
            </div>
          </div>

          {/* Inmuebles */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Inmuebles ({inmuebles.length})
            </h3>
            {inmuebles.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No tiene inmuebles registrados
              </p>
            ) : (
              <div className="space-y-3">
                {inmuebles.map((inmueble) => (
                  <div
                    key={inmueble.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-white transition-colors cursor-pointer"
                    onClick={() => onInmuebleClick(inmueble.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 hover:text-blue-600">
                          {inmueble.nombre}
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {inmueble.direccion}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {inmueble.tipo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropietarioDetailModal;
