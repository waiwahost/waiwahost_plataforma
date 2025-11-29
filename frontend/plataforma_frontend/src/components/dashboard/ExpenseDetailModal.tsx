import React from 'react';
import { X, Calendar, DollarSign, Building2, Receipt, CreditCard, FileText, Hash } from 'lucide-react';
import { IEgreso } from '../../interfaces/Egreso';

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  egreso: IEgreso | null;
}

const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  isOpen,
  onClose,
  egreso
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConceptoText = (concepto: string) => {
    const conceptos = {
      'mantenimiento': 'Mantenimiento',
      'limpieza': 'Limpieza',
      'servicios_publicos': 'Servicios Públicos',
      'suministros': 'Suministros',
      'comision': 'Comisión',
      'devolucion': 'Devolución',
      'impuestos': 'Impuestos',
      'otro': 'Otro'
    };
    return conceptos[concepto as keyof typeof conceptos] || concepto;
  };

  const getMetodoPagoText = (metodo: string) => {
    const metodos = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'tarjeta': 'Tarjeta',
      'otro': 'Otro'
    };
    return metodos[metodo as keyof typeof metodos] || metodo;
  };

  const getConceptoColor = (concepto: string) => {
    const colores = {
      'mantenimiento': 'bg-orange-100 text-orange-800 border-orange-200',
      'limpieza': 'bg-green-100 text-green-800 border-green-200',
      'servicios_publicos': 'bg-blue-100 text-blue-800 border-blue-200',
      'suministros': 'bg-purple-100 text-purple-800 border-purple-200',
      'comision': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'devolucion': 'bg-red-100 text-red-800 border-red-200',
      'impuestos': 'bg-gray-100 text-gray-800 border-gray-200',
      'otro': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colores[concepto as keyof typeof colores] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (!isOpen || !egreso) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Detalle del Egreso
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información Principal */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-700">Monto</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  -{formatCurrency(egreso.monto)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Concepto</span>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getConceptoColor(egreso.concepto)}`}>
                  {getConceptoText(egreso.concepto)}
                </span>
              </div>
            </div>
          </div>

          {/* Detalles del Egreso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Descripción</span>
                </div>
                <p className="text-gray-900">{egreso.descripcion}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Inmueble</span>
                </div>
                <p className="text-gray-900">{egreso.nombre_inmueble}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Método de Pago</span>
                </div>
                <p className="text-gray-900">{getMetodoPagoText(egreso.metodo_pago)}</p>
              </div>
            </div>

            <div className="space-y-4">
              {egreso.comprobante && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Comprobante</span>
                  </div>
                  <p className="text-gray-900 font-mono text-sm bg-gray-100 p-2 rounded">
                    {egreso.comprobante}
                  </p>
                </div>
              )}

              {egreso.codigo_reserva && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Código Reserva</span>
                  </div>
                  <p className="text-gray-900 font-mono text-sm bg-blue-50 p-2 rounded">
                    {egreso.codigo_reserva}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Tipo de Egreso</span>
                </div>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                  Movimiento de Caja
                </span>
              </div>
            </div>
          </div>

          {/* Información de Fechas */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Fecha de Creación</span>
                </div>
                <p className="text-gray-900 text-sm">
                  {formatDateTime(egreso.fecha_creacion)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Última Actualización</span>
                </div>
                <p className="text-gray-900 text-sm">
                  {formatDateTime(egreso.fecha_actualizacion)}
                </p>
              </div>
            </div>
          </div>

          {/* ID del Registro */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-700">ID del Registro</span>
            </div>
            <p className="text-gray-600 text-sm font-mono bg-gray-100 p-2 rounded">
              {egreso.id}
            </p>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailModal;