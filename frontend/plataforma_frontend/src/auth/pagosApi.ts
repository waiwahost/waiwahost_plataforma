import { apiFetch } from './apiFetch';
import { IPago, IPagoApiResponse, IPagoForm } from '../interfaces/Pago';

/**
 * Registra un pago como movimiento de ingreso
 * Función de compatibilidad para el flujo existente
 */
const registerPagoAsMovimiento = async (pago: IPago): Promise<void> => {
  try {
    const movimientoData = {
      id_reserva: pago.id_reserva,
      fecha_pago: pago.fecha_pago,
      codigo_reserva: pago.codigo_reserva,
      monto: pago.monto,
      metodo_pago: pago.metodo_pago,
      concepto: pago.concepto,
      descripcion: pago.descripcion,
      comprobante: pago.comprobante
    };

    await apiFetch('/api/pagos/registerMovimiento', {
      method: 'POST',
      body: JSON.stringify(movimientoData),
    });

  } catch (error) {
    console.error('Error registrando pago como movimiento:', error);
    throw error;
  }
};

/**
 * Obtiene todos los pagos de una reserva específica
 * La API interna decide si usar backend externo o mock
 */
export const getPagosReservaApi = async (idReserva: number): Promise<IPago[]> => {
  try {
    const response: any = await apiFetch(`/api/pagos/${idReserva}`, {
      method: 'GET',
    });

    // apiFetch puede devolver la data directamente si existe la propiedad 'data'
    if (Array.isArray(response)) {
      return response;
    }

    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    }

    if (response && !response.success) {
      throw new Error(response.message || 'Error al obtener pagos');
    }

    return [];

  } catch (error) {
    console.error('❌ Error en getPagosReservaApi:', error);
    throw error instanceof Error ? error : new Error('Error al obtener pagos');
  }
};

/**
 * Obtiene todos los pagos de una reserva específica para el modal de detalle
 * La API interna decide si usar backend externo o mock
 */
export const getPagosReservaDetalleApi = async (idReserva: number): Promise<IPago[]> => {
  try {
    const response: any = await apiFetch(`/api/reservas/pagos-detalle?id_reserva=${idReserva}`, {
      method: 'GET',
    });

    if (Array.isArray(response)) {
      return response;
    }

    if (!response.success) {
      throw new Error(response.message || 'Error al obtener pagos');
    }

    const pagos = Array.isArray(response.data) ? response.data : [];
    return pagos;

  } catch (error) {
    console.error('❌ Error en getPagosReservaDetalleApi:', error);
    throw error instanceof Error ? error : new Error('Error al obtener pagos de la reserva');
  }
};

/**
 * Crea un nuevo pago para una reserva
 * La API interna decide si usar backend externo o mock
 */
export const createPagoApi = async (idReserva: number, pagoData: IPagoForm): Promise<IPago> => {
  try {
    const response: any = await apiFetch(`/api/pagos/${idReserva}`, {
      method: 'POST',
      body: JSON.stringify(pagoData),
    });

    // apiFetch devuelve null si data es null (en caso de error con data: null)
    if (response === null) {
      throw new Error('Error al crear pago (respuesta nula)');
    }

    // Si apiFetch devolvió el objeto pago directamente
    if (response && (response.id || response.monto)) {
      const pago = response;

      // Solo registrar movimiento en modo mock/interno
      const useExternalApi = process.env.NEXT_PUBLIC_API_URL === 'http://localhost:3001';
      if (!useExternalApi) {
        try {
          await registerPagoAsMovimiento(pago);
        } catch (e) { console.error(e); }
      }
      return pago;
    }

    if (!response.success || !response.data) {
      const errorMessage = response.message || (response as any).error?.message || 'Error al crear pago';
      throw new Error(errorMessage);
    }

    const pago = Array.isArray(response.data) ? response.data[0] : response.data;

    // Solo registrar movimiento en modo mock/interno (el backend externo lo hace automáticamente)
    const useExternalApi = process.env.NEXT_PUBLIC_API_URL === 'http://localhost:3001';
    if (!useExternalApi) {
      try {
        await registerPagoAsMovimiento(pago);
      } catch (movimientoError) {
        console.error('⚠️ Error registrando movimiento (pago ya fue creado):', movimientoError);
        // No fallar el proceso completo si el movimiento falla
      }
    }

    return pago;

  } catch (error) {
    console.error('❌ Error en createPagoApi:', error);
    throw error instanceof Error ? error : new Error('Error al crear pago');
  }
};

/**
 * Actualiza un pago existente
 * La API interna decide si usar backend externo o mock
 */
export const updatePagoApi = async (idPago: number, pagoData: Partial<IPagoForm>): Promise<IPago> => {
  try {
    const response: IPagoApiResponse = await apiFetch(`/api/pagos/editPago?id=${idPago}`, {
      method: 'PUT',
      body: JSON.stringify(pagoData),
    });

    if (!response.success) {
      throw new Error(response.message || 'Error al actualizar pago');
    }

    return response.data as IPago;

  } catch (error) {
    console.error('❌ Error en updatePagoApi:', error);
    throw error instanceof Error ? error : new Error('Error al actualizar pago');
  }
};

/**
 * Elimina un pago específico
 * La API interna decide si usar backend externo o mock
 */
export const deletePagoApi = async (idPago: number): Promise<void> => {
  try {
    const response: IPagoApiResponse = await apiFetch(`/api/pagos/deletePago?id=${idPago}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar pago');
    }

  } catch (error) {
    console.error('❌ Error en deletePagoApi:', error);
    throw error instanceof Error ? error : new Error('Error al eliminar pago');
  }
};

/**
 * Calcula el resumen de pagos para una reserva
 * Función de utilidad que se mantiene para compatibilidad
 */
export const calcularResumenPagos = (pagos: IPago[]): { totalPagado: number; cantidadPagos: number } => {
  const totalPagado = pagos.reduce((sum, pago) => {
    const monto = parseFloat(pago.monto as any);
    return sum + (isNaN(monto) ? 0 : monto);
  }, 0);
  const cantidadPagos = pagos.length;

  return {
    totalPagado,
    cantidadPagos
  };
};