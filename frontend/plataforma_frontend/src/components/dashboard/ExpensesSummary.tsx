import React from 'react';
import { TrendingDown, DollarSign, Activity, Building2 } from 'lucide-react';
import { IResumenEgresos } from '../../interfaces/Egreso';

interface ExpensesSummaryProps {
  resumen: IResumenEgresos | null;
  loading: boolean;
  inmuebleSeleccionado?: { id: string; nombre: string } | null;
}

const ExpensesSummary: React.FC<ExpensesSummaryProps> = ({ 
  resumen, 
  loading, 
  inmuebleSeleccionado 
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!resumen) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <p className="text-gray-500 text-center">No hay datos disponibles para esta fecha</p>
      </div>
    );
  }

  const titulo = inmuebleSeleccionado 
    ? `Egresos - ${inmuebleSeleccionado.nombre}`
    : 'Egresos - Todos los Inmuebles';

  return (
    <div className="space-y-4 mb-6">
      {/* Título dinámico */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-tourism-navy" />
          <h2 className="text-lg font-semibold text-tourism-navy">{titulo}</h2>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Egresos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Egresos</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(resumen.total_egresos)}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Cantidad de Egresos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cantidad Egresos</p>
              <p className="text-2xl font-bold text-tourism-navy">
                {resumen.cantidad_egresos}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-tourism-navy" />
            </div>
          </div>
        </div>

        {/* Promedio por Egreso */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Promedio por Egreso</p>
              <p className="text-2xl font-bold text-orange-600">
                {resumen.cantidad_egresos > 0 
                  ? formatCurrency(resumen.total_egresos / resumen.cantidad_egresos)
                  : formatCurrency(0)
                }
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Desglose por inmuebles (solo si no hay filtro específico) */}
      {!inmuebleSeleccionado && resumen.egresos_por_inmueble && resumen.egresos_por_inmueble.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-md font-semibold text-gray-800 mb-4">Desglose por Inmueble</h3>
          <div className="space-y-3">
            {resumen.egresos_por_inmueble?.map((inmueble) => (
              <div key={inmueble.id_inmueble} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{inmueble.nombre_inmueble}</p>
                  <p className="text-sm text-gray-600">{inmueble.cantidad_egresos} egresos</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{formatCurrency(inmueble.total_egresos)}</p>
                  <p className="text-sm text-gray-500">
                    {inmueble.cantidad_egresos > 0 
                      ? formatCurrency(inmueble.total_egresos / inmueble.cantidad_egresos)
                      : 'N/A'
                    } promedio
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesSummary;