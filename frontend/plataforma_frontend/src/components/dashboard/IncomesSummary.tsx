import React from 'react';
import { TrendingUp, DollarSign, Activity, Building2 } from 'lucide-react';
import { IResumenIngresos } from '../../interfaces/Ingreso';

interface IncomesSummaryProps {
  resumen: IResumenIngresos | null;
  loading: boolean;
  inmuebleSeleccionado?: { id: string; nombre: string } | null;
}

const IncomesSummary: React.FC<IncomesSummaryProps> = ({ 
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
    ? `Ingresos - ${inmuebleSeleccionado.nombre}`
    : 'Ingresos - Todos los Inmuebles';

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
        {/* Total Ingresos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(resumen.total_ingresos)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Cantidad de Ingresos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cantidad Ingresos</p>
              <p className="text-2xl font-bold text-tourism-navy">
                {resumen.cantidad_ingresos}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-tourism-navy" />
            </div>
          </div>
        </div>

        {/* Promedio por Ingreso */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Promedio por Ingreso</p>
              <p className="text-2xl font-bold text-indigo-600">
                {resumen.cantidad_ingresos > 0 
                  ? formatCurrency(resumen.total_ingresos / resumen.cantidad_ingresos)
                  : formatCurrency(0)
                }
              </p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Desglose por inmuebles (solo si no hay filtro específico) */}
      {!inmuebleSeleccionado && resumen.ingresos_por_inmueble && resumen.ingresos_por_inmueble.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-md font-semibold text-gray-800 mb-4">Desglose por Inmueble</h3>
          <div className="space-y-3">
            {resumen.ingresos_por_inmueble?.map((inmueble) => (
              <div key={inmueble.id_inmueble} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{inmueble.nombre_inmueble}</p>
                  <p className="text-sm text-gray-600">{inmueble.cantidad_ingresos} ingresos</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(inmueble.total_ingresos)}</p>
                  <p className="text-sm text-gray-500">
                    {inmueble.cantidad_ingresos > 0 
                      ? formatCurrency(inmueble.total_ingresos / inmueble.cantidad_ingresos)
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

export default IncomesSummary;