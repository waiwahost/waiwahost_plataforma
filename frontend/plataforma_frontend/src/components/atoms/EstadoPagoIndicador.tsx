import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { 
  determinarEstadoPago, 
  calcularPorcentajePago,
  formatearMoneda 
} from '../../lib/reservasUtils';

interface EstadoPagoIndicadorProps {
  totalPagado: number;
  totalReserva: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showProgress?: boolean;
}

/**
 * Componente que muestra un indicador visual del estado de pagos de una reserva
 */
const EstadoPagoIndicador: React.FC<EstadoPagoIndicadorProps> = ({
  totalPagado,
  totalReserva,
  size = 'md',
  showText = true,
  showProgress = false
}) => {
  const estadoPago = determinarEstadoPago(totalPagado, totalReserva);
  const porcentajePago = calcularPorcentajePago(totalPagado, totalReserva);

  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      icon: 'h-3 w-3',
      text: 'text-xs',
      badge: 'px-1.5 py-0.5 text-xs',
    },
    md: {
      icon: 'h-4 w-4',
      text: 'text-sm',
      badge: 'px-2 py-1 text-xs',
    },
    lg: {
      icon: 'h-5 w-5',
      text: 'text-base',
      badge: 'px-3 py-1.5 text-sm',
    },
  };

  // Configuración por estado
  const estadoConfig = {
    sin_abonos: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      text: 'Sin abonos',
      description: 'No se han registrado pagos',
    },
    abono_parcial: {
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      text: 'Abono parcial',
      description: `${porcentajePago.toFixed(1)}% pagado`,
    },
    pagado_completo: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      text: 'Pagado completo',
      description: 'Pago completado',
    },
  };

  const config = estadoConfig[estadoPago];
  const IconComponent = config.icon;
  const sizes = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      {/* Ícono del estado */}
      <div className={`flex items-center justify-center ${config.color}`}>
        <IconComponent className={sizes.icon} />
      </div>

      {/* Información del estado */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-medium ${config.color} ${sizes.text}`}>
            {config.text}
          </span>
          <span className={`text-gray-500 ${sizes.text === 'text-xs' ? 'text-xs' : 'text-xs'}`}>
            {config.description}
          </span>
        </div>
      )}

      {/* Barra de progreso */}
      {showProgress && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>{formatearMoneda(totalPagado)}</span>
            <span>{formatearMoneda(totalReserva)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                estadoPago === 'pagado_completo' 
                  ? 'bg-green-500' 
                  : estadoPago === 'abono_parcial' 
                    ? 'bg-orange-500' 
                    : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, porcentajePago)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EstadoPagoIndicador;