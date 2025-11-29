/**
 * Utilidades para el manejo de reservas y cálculo de totales
 */

import { IReservaTableData } from '../interfaces/Reserva';
import { IPago } from '../interfaces/Pago';

/**
 * Calcula los totales de una reserva basándose en sus pagos
 * @param reserva - Datos de la reserva
 * @param pagos - Lista de pagos de la reserva (opcional)
 * @returns Objeto con los totales calculados
 */
export const calcularTotalesReserva = (
  reserva: IReservaTableData, 
  pagos?: IPago[]
): {
  total_reserva: number;
  total_pagado: number;
  total_pendiente: number;
} => {
  const totalReserva = reserva.total_reserva || reserva.precio_total;
  
  // Si no se proporcionan pagos, usar los valores actuales de la reserva
  const totalPagado = pagos 
    ? pagos.reduce((sum, pago) => sum + pago.monto, 0)
    : (reserva.total_pagado || 0);
  
  const totalPendiente = Math.max(0, totalReserva - totalPagado);
  
  return {
    total_reserva: totalReserva,
    total_pagado: totalPagado,
    total_pendiente: totalPendiente,
  };
};

/**
 * Actualiza una reserva específica en un array de reservas con nuevos totales
 * @param reservas - Array de reservas
 * @param reservaId - ID de la reserva a actualizar
 * @param nuevosTotales - Nuevos totales calculados
 * @returns Array actualizado de reservas
 */
export const actualizarTotalesEnReservas = (
  reservas: IReservaTableData[],
  reservaId: number,
  nuevosTotales: {
    total_reserva: number;
    total_pagado: number;
    total_pendiente: number;
  }
): IReservaTableData[] => {
  return reservas.map(reserva => {
    if (reserva.id === reservaId) {
      return {
        ...reserva,
        ...nuevosTotales,
      };
    }
    return reserva;
  });
};

/**
 * Determina el estado de pago de una reserva basándose en los totales
 * @param totalPagado - Total pagado
 * @param totalReserva - Total de la reserva
 * @returns Estado del pago
 */
export const determinarEstadoPago = (
  totalPagado: number, 
  totalReserva: number
): 'sin_abonos' | 'abono_parcial' | 'pagado_completo' => {
  if (totalPagado === 0) {
    return 'sin_abonos';
  }
  
  if (totalPagado >= totalReserva) {
    return 'pagado_completo';
  }
  
  return 'abono_parcial';
};

/**
 * Calcula el porcentaje de pago de una reserva
 * @param totalPagado - Total pagado
 * @param totalReserva - Total de la reserva
 * @returns Porcentaje (0-100)
 */
export const calcularPorcentajePago = (
  totalPagado: number, 
  totalReserva: number
): number => {
  if (totalReserva === 0) return 0;
  
  const porcentaje = (totalPagado / totalReserva) * 100;
  return Math.min(100, Math.max(0, porcentaje));
};

/**
 * Formatea un valor monetario en formato colombiano
 * @param amount - Valor a formatear
 * @returns String formateado
 */
export const formatearMoneda = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Obtiene el color CSS para mostrar el total pendiente según su estado
 * @param totalPendiente - Monto pendiente
 * @param totalReserva - Total de la reserva
 * @returns Clase CSS de color
 */
export const obtenerColorTotalPendiente = (
  totalPendiente: number, 
  totalReserva: number
): string => {
  if (totalPendiente === 0) {
    return 'text-green-600'; // Totalmente pagado
  }
  
  if (totalPendiente === totalReserva) {
    return 'text-red-600'; // Sin abonos
  }
  
  return 'text-orange-600'; // Abono parcial
};

/**
 * Obtiene el texto descriptivo del estado de pago
 * @param totalPagado - Total pagado
 * @param totalReserva - Total de la reserva
 * @returns Texto descriptivo
 */
export const obtenerTextoEstadoPago = (
  totalPagado: number, 
  totalReserva: number
): string => {
  const estado = determinarEstadoPago(totalPagado, totalReserva);
  
  switch (estado) {
    case 'sin_abonos':
      return 'Sin abonos';
    case 'pagado_completo':
      return 'Pagado completo';
    case 'abono_parcial':
      return 'Abono parcial';
    default:
      return 'Estado desconocido';
  }
};

/**
 * Valida si una reserva tiene datos de totales consistentes
 * @param reserva - Datos de la reserva
 * @returns Objeto con resultado de validación
 */
export const validarConsistenciaTotales = (
  reserva: IReservaTableData
): {
  esConsistente: boolean;
  errores: string[];
  advertencias: string[];
} => {
  const errores: string[] = [];
  const advertencias: string[] = [];
  
  const totalReserva = reserva.total_reserva || reserva.precio_total;
  const totalPagado = reserva.total_pagado || 0;
  const totalPendiente = reserva.total_pendiente || totalReserva;
  
  // Validar que el total de la reserva sea positivo
  if (totalReserva <= 0) {
    errores.push('El total de la reserva debe ser mayor a 0');
  }
  
  // Validar que el total pagado no sea negativo
  if (totalPagado < 0) {
    errores.push('El total pagado no puede ser negativo');
  }
  
  // Validar que el total pendiente coincida con el cálculo
  const pendienteCalculado = Math.max(0, totalReserva - totalPagado);
  if (Math.abs(totalPendiente - pendienteCalculado) > 0.01) { // Tolerancia de 1 centavo
    errores.push(
      `El total pendiente (${formatearMoneda(totalPendiente)}) no coincide con el calculado (${formatearMoneda(pendienteCalculado)})`
    );
  }
  
  // Advertencia si el total pagado excede el total de la reserva
  if (totalPagado > totalReserva) {
    advertencias.push(
      `El total pagado (${formatearMoneda(totalPagado)}) excede el total de la reserva (${formatearMoneda(totalReserva)})`
    );
  }
  
  return {
    esConsistente: errores.length === 0,
    errores,
    advertencias,
  };
};

/**
 * Crea un objeto de reserva con totales inicializados por defecto
 * @param reservaBase - Datos base de la reserva
 * @returns Reserva con totales inicializados
 */
export const inicializarTotalesReserva = (
  reservaBase: Partial<IReservaTableData>
): Partial<IReservaTableData> => {
  const precioTotal = reservaBase.precio_total || 0;
  
  return {
    ...reservaBase,
    total_reserva: reservaBase.total_reserva || precioTotal,
    total_pagado: reservaBase.total_pagado || 0,
    total_pendiente: reservaBase.total_pendiente || precioTotal,
  };
};