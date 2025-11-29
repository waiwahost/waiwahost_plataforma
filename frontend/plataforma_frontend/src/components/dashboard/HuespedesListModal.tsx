import React from 'react';
import { X, User, Mail, Phone, CreditCard, Calendar } from 'lucide-react';
import { Button } from '../atoms/Button';
import { IHuesped } from '../../interfaces/Reserva';

interface HuespedesListModalProps {
  open: boolean;
  onClose: () => void;
  huespedes: IHuesped[];
  codigoReserva: string;
}

const HuespedesListModal: React.FC<HuespedesListModalProps> = ({
  open,
  onClose,
  huespedes,
  codigoReserva
}) => {
  if (!open) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const getDocumentTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'cedula':
        return 'Cédula';
      case 'pasaporte':
        return 'Pasaporte';
      case 'tarjeta_identidad':
        return 'Tarjeta de Identidad';
      default:
        return tipo;
    }
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();
    
    if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  };

  const huespedesPrincipales = huespedes.filter(h => h.es_principal);
  const huespedesSecundarios = huespedes.filter(h => !h.es_principal);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b bg-tourism-teal text-white">
          <h2 className="text-xl font-semibold">
            Huéspedes - Reserva {codigoReserva}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Huésped Principal */}
          {huespedesPrincipales.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-tourism-teal" />
                Huésped Principal
              </h3>
              <div className="grid gap-4">
                {huespedesPrincipales.map((huesped) => (
                  <div key={huesped.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                        <p className="text-gray-900 font-medium">
                          {huesped.nombre} {huesped.apellido}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-gray-900 flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {huesped.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Teléfono</label>
                        <p className="text-gray-900 flex items-center gap-1">
                          <Phone className="h-4 w-4 text-gray-500" />
                          {huesped.telefono}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Documento</label>
                        <p className="text-gray-900 flex items-center gap-1">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          {getDocumentTypeLabel(huesped.documento_tipo)}: {huesped.documento_numero}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
                        <p className="text-gray-900 flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {formatDate(huesped.fecha_nacimiento)} ({calcularEdad(huesped.fecha_nacimiento)} años)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Huéspedes Acompañantes */}
          {huespedesSecundarios.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-tourism-teal" />
                Huéspedes Acompañantes ({huespedesSecundarios.length})
              </h3>
              <div className="grid gap-4">
                {huespedesSecundarios.map((huesped, index) => (
                  <div key={huesped.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">Acompañante #{index + 1}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                        <p className="text-gray-900 font-medium">
                          {huesped.nombre} {huesped.apellido}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-gray-900 flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {huesped.email || 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Teléfono</label>
                        <p className="text-gray-900 flex items-center gap-1">
                          <Phone className="h-4 w-4 text-gray-500" />
                          {huesped.telefono || 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Documento</label>
                        <p className="text-gray-900 flex items-center gap-1">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          {getDocumentTypeLabel(huesped.documento_tipo)}: {huesped.documento_numero}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
                        <p className="text-gray-900 flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {formatDate(huesped.fecha_nacimiento)} ({calcularEdad(huesped.fecha_nacimiento)} años)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Si no hay huéspedes */}
          {huespedes.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay información de huéspedes registrada para esta reserva.</p>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t mt-6">
            <Button
              onClick={onClose}
              variant="default"
              className="bg-tourism-teal text-white hover:bg-tourism-teal/90"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HuespedesListModal;
