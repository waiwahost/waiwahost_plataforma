import React from 'react';
import { X, TrendingUp, TrendingDown, Building, Calendar, CreditCard, FileText } from 'lucide-react';
import { IMovimiento } from '../../interfaces/Movimiento';

interface MovimientoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  movimiento: IMovimiento | null;
}

const MovimientoDetailModal: React.FC<MovimientoDetailModalProps> = ({
  isOpen,
  onClose,
  movimiento
}) => {
  if (!isOpen || !movimiento) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConceptoLabel = (concepto: string): string => {
    const conceptos: Record<string, string> = {
      reserva: 'Reserva',
      limpieza: 'Limpieza',
      deposito_garantia: 'Depósito de Garantía',
      servicios_adicionales: 'Servicios Adicionales',
      multa: 'Multa',
      mantenimiento: 'Mantenimiento',
      servicios_publicos: 'Servicios Públicos',
      suministros: 'Suministros',
      comision: 'Comisión',
      devolucion: 'Devolución',
      impuestos: 'Impuestos',
      otro: 'Otro'
    };
    return conceptos[concepto] || concepto;
  };

  const getMetodoPagoLabel = (metodo: string): string => {
    const metodos: Record<string, string> = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      tarjeta: 'Tarjeta',
      otro: 'Otro'
    };
    return metodos[metodo] || metodo;
  };

  const tipoColor = movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600';
  const tipoBgColor = movimiento.tipo === 'ingreso' ? 'bg-green-100' : 'bg-red-100';
  const TipoIcon = movimiento.tipo === 'ingreso' ? TrendingUp : TrendingDown;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-tourism-navy">
            Detalle del Movimiento
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header del movimiento */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className={`p-3 rounded-full ${tipoBgColor}`}>
              <TipoIcon className={`h-6 w-6 ${tipoColor}`} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${tipoColor} capitalize`}>
                {movimiento.tipo}
              </h3>
              <p className="text-gray-600">
                {getConceptoLabel(movimiento.concepto)}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className={`text-2xl font-bold ${tipoColor}`}>
                {movimiento.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(movimiento.monto)}
              </p>
            </div>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Fecha</p>
                  <p className="text-gray-900">{formatDateTime(movimiento.fecha_creacion)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Inmueble</p>
                  <p className="text-gray-900">{movimiento.nombre_inmueble}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Método de Pago</p>
                  <p className="text-gray-900">{getMetodoPagoLabel(movimiento.metodo_pago)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {movimiento.codigo_reserva && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Reserva</p>
                    <p className="text-tourism-teal font-medium">{movimiento.codigo_reserva}</p>
                  </div>
                </div>
              )}

              {movimiento.comprobante && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Comprobante</p>
                    <p className="text-gray-900">{movimiento.comprobante}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Descripción</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-900">{movimiento.descripcion}</p>
            </div>
          </div>

          {/* Información del sistema */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Información del Sistema</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="ml-2 text-gray-900">{movimiento.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Fecha de creación:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(movimiento.fecha_creacion).toLocaleString('es-ES')}
                </span>
              </div>
              {movimiento.fecha_actualizacion !== movimiento.fecha_creacion && (
                <div>
                  <span className="text-gray-500">Última actualización:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(movimiento.fecha_actualizacion).toLocaleString('es-ES')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovimientoDetailModal;