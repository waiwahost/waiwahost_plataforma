import React from 'react';
import { Eye, CreditCard, Receipt, Banknote, Building2 } from 'lucide-react';
import { IEgreso } from '../../interfaces/Egreso';

interface ExpensesTableProps {
  egresos: IEgreso[];
  loading: boolean;
  onView: (egreso: IEgreso) => void;
}

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  egresos,
  loading,
  onView
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case 'efectivo':
        return <Banknote className="h-4 w-4 text-green-600" />;
      case 'transferencia':
        return <Receipt className="h-4 w-4 text-blue-600" />;
      case 'tarjeta':
        return <CreditCard className="h-4 w-4 text-purple-600" />;
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />;
    }
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

  const getConceptoColor = (concepto: string) => {
    const colores = {
      'mantenimiento': 'bg-orange-100 text-orange-800',
      'limpieza': 'bg-green-100 text-green-800',
      'servicios_publicos': 'bg-blue-100 text-blue-800',
      'suministros': 'bg-purple-100 text-purple-800',
      'comision': 'bg-yellow-100 text-yellow-800',
      'devolucion': 'bg-red-100 text-red-800',
      'impuestos': 'bg-gray-100 text-gray-800',
      'otro': 'bg-gray-100 text-gray-800'
    };
    return colores[concepto as keyof typeof colores] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Lista de Egresos</h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (egresos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Lista de Egresos</h2>
        </div>
        <div className="p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No hay egresos registrados para esta fecha</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Lista de Egresos</h2>
          <span className="text-sm text-gray-600">
            {egresos.length} egreso{egresos.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Concepto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inmueble
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reserva
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {egresos.map((egreso) => (
              <tr key={egreso.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTime(egreso.fecha_creacion)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConceptoColor(egreso.concepto)}`}>
                    {getConceptoText(egreso.concepto)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={egreso.descripcion}>
                    {egreso.descripcion}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {egreso.nombre_inmueble}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                  -{formatCurrency(egreso.monto)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getMetodoPagoIcon(egreso.metodo_pago)}
                    <span className="text-sm text-gray-900">
                      {getMetodoPagoText(egreso.metodo_pago)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {egreso.codigo_reserva || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onView(egreso)}
                    className="text-tourism-navy hover:text-tourism-navy-dark inline-flex items-center gap-1"
                    title="Ver detalle"
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpensesTable;