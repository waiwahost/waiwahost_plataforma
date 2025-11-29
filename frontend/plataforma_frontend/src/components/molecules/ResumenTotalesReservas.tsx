import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { IReservaTableData } from '../../interfaces/Reserva';
import { formatearMoneda, determinarEstadoPago } from '../../lib/reservasUtils';

interface ResumenTotalesReservasProps {
  reservas: IReservaTableData[];
  titulo?: string;
  className?: string;
}

/**
 * Componente que muestra un resumen de los totales de todas las reservas
 */
const ResumenTotalesReservas: React.FC<ResumenTotalesReservasProps> = ({
  reservas,
  titulo = 'Resumen Financiero de Reservas',
  className = ''
}) => {
  // Calcular métricas
  const metricas = useMemo(() => {
    const totales = reservas.reduce((acc, reserva) => {
      const totalReserva = reserva.total_reserva || reserva.precio_total;
      const totalPagado = reserva.total_pagado || 0;
      const totalPendiente = reserva.total_pendiente || (totalReserva - totalPagado);

      acc.totalReservas += totalReserva;
      acc.totalPagado += totalPagado;
      acc.totalPendiente += totalPendiente;
      acc.cantidadReservas += 1;

      // Contar por estados de pago
      const estadoPago = determinarEstadoPago(totalPagado, totalReserva);
      acc.estadosPago[estadoPago] += 1;

      return acc;
    }, {
      totalReservas: 0,
      totalPagado: 0,
      totalPendiente: 0,
      cantidadReservas: 0,
      estadosPago: {
        sin_abonos: 0,
        abono_parcial: 0,
        pagado_completo: 0,
      }
    });

    // Calcular porcentajes
    const porcentajePagado = totales.totalReservas > 0 
      ? (totales.totalPagado / totales.totalReservas) * 100 
      : 0;

    const promedioReserva = totales.cantidadReservas > 0 
      ? totales.totalReservas / totales.cantidadReservas 
      : 0;

    return {
      ...totales,
      porcentajePagado,
      promedioReserva,
    };
  }, [reservas]);

  // Configuración de tarjetas
  const tarjetas = [
    {
      titulo: 'Total Reservas',
      valor: formatearMoneda(metricas.totalReservas),
      subtitulo: `${metricas.cantidadReservas} reservas`,
      icon: DollarSign,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700',
    },
    {
      titulo: 'Total Pagado',
      valor: formatearMoneda(metricas.totalPagado),
      subtitulo: `${metricas.porcentajePagado.toFixed(1)}% del total`,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-700',
    },
    {
      titulo: 'Total Pendiente',
      valor: formatearMoneda(metricas.totalPendiente),
      subtitulo: `${(100 - metricas.porcentajePagado).toFixed(1)}% pendiente`,
      icon: TrendingDown,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-700',
    },
    {
      titulo: 'Promedio por Reserva',
      valor: formatearMoneda(metricas.promedioReserva),
      subtitulo: `${metricas.estadosPago.pagado_completo} pagadas completas`,
      icon: CheckCircle,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-700',
    },
  ];

  if (reservas.length === 0) {
    return (
      <div className={`bg-gray-50 p-6 rounded-lg ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{titulo}</h3>
        <p className="text-gray-600">No hay reservas para mostrar resumen</p>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Resumen financiero de {metricas.cantidadReservas} reservas
        </p>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {tarjetas.map((tarjeta, index) => {
          const IconComponent = tarjeta.icon;
          
          return (
            <div key={index} className={`${tarjeta.bgColor} p-4 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${tarjeta.textColor}`}>
                    {tarjeta.titulo}
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {tarjeta.valor}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {tarjeta.subtitulo}
                  </p>
                </div>
                <div className={`${tarjeta.iconColor}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de progreso general */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progreso de cobro general</span>
          <span>{metricas.porcentajePagado.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              metricas.porcentajePagado >= 80 
                ? 'bg-green-500' 
                : metricas.porcentajePagado >= 50 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, metricas.porcentajePagado)}%` }}
          />
        </div>
      </div>

      {/* Distribución por estado de pago */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Distribución por Estado de Pago
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {metricas.estadosPago.sin_abonos}
            </p>
            <p className="text-xs text-red-700">Sin abonos</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {metricas.estadosPago.abono_parcial}
            </p>
            <p className="text-xs text-orange-700">Abono parcial</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {metricas.estadosPago.pagado_completo}
            </p>
            <p className="text-xs text-green-700">Pagado completo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenTotalesReservas;