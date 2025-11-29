import React from 'react';
import { X } from 'lucide-react';
import { IHuespedDetailData } from '../../interfaces/Huesped';

interface HuespedDetailModalProps {
  open: boolean;
  onClose: () => void;
  huesped: IHuespedDetailData | null;
}

const HuespedDetailModal: React.FC<HuespedDetailModalProps> = ({
  open,
  onClose,
  huesped
}) => {
  if (!open || !huesped) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Detalle del Huésped
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID del Huésped
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {huesped.id_huesped}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {huesped.nombre} {huesped.apellido}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Documento
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {huesped.documento_numero}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {huesped.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {huesped.telefono}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {huesped.direccion || 'No especificada'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {formatDate(huesped.fecha_nacimiento)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  huesped.estado === 'activo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {huesped.estado}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Registro
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {formatDateTime(huesped.created_at)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Última Actualización
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {formatDateTime(huesped.updated_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HuespedDetailModal;