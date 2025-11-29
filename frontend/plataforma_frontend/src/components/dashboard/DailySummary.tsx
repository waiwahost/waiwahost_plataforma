import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { IResumenDiario } from '../../interfaces/Movimiento';

interface DailySummaryProps {
  resumen: IResumenDiario | null;
  loading: boolean;
}

const DailySummary: React.FC<DailySummaryProps> = ({ resumen, loading }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
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

  const balanceColor = resumen.balance >= 0 ? 'text-green-600' : 'text-red-600';
  const balanceIcon = resumen.balance >= 0 ? TrendingUp : TrendingDown;
  const BalanceIcon = balanceIcon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

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
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Balance</p>
            <p className={`text-2xl font-bold ${balanceColor}`}>
              {formatCurrency(resumen.balance)}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${resumen.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <BalanceIcon className={`h-6 w-6 ${balanceColor}`} />
          </div>
        </div>
      </div>

      {/* Cantidad de Movimientos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Movimientos</p>
            <p className="text-2xl font-bold text-tourism-navy">
              {resumen.cantidad_movimientos}
            </p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="h-6 w-6 text-tourism-navy" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;