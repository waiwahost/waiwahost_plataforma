/**
 * Hook personalizado para gestionar reservas con actualización automática de totales
 */

import { useState, useEffect, useCallback } from 'react';
import { IReservaTableData } from '../interfaces/Reserva';
import { IPago } from '../interfaces/Pago';
import { getReservasApi, ReservasFilters } from '../auth/reservasApi';
import { getPagosReservaApi } from '../auth/pagosApi';
import { 
  calcularTotalesReserva, 
  actualizarTotalesEnReservas,
  validarConsistenciaTotales 
} from '../lib/reservasUtils';

interface UseReservasConTotalesReturn {
  reservas: IReservaTableData[];
  loading: boolean;
  error: string | null;
  loadReservas: (filtros?: ReservasFilters) => Promise<void>;
  actualizarTotalesReserva: (reservaId: number, pagos?: IPago[]) => Promise<void>;
  actualizarReservaEnLista: (reservaActualizada: IReservaTableData) => void;
  eliminarReservaDeLista: (reservaId: number) => void;
  agregarReservaALista: (nuevaReserva: IReservaTableData) => void;
  refrescarReservas: () => Promise<void>;
  validarConsistenciaReserva: (reservaId: number) => { esConsistente: boolean; errores: string[]; advertencias: string[] } | null;
}

/**
 * Hook para gestionar reservas con cálculo automático de totales
 */
export const useReservasConTotales = (
  filtrosIniciales?: ReservasFilters
): UseReservasConTotalesReturn => {
  const [reservas, setReservas] = useState<IReservaTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga las reservas desde la API
   */
  const loadReservas = useCallback(async (filtros?: ReservasFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtrosAplicar = filtros || filtrosIniciales;
      const data = await getReservasApi(filtrosAplicar);
      
      // Validar y inicializar totales si es necesario
      const reservasConTotales = data.map(reserva => {
        const validacion = validarConsistenciaTotales(reserva);
        
        // Log warnings for inconsistent data
        if (!validacion.esConsistente || validacion.advertencias.length > 0) {
          console.warn(`⚠️ Inconsistencia en reserva ${reserva.codigo_reserva}:`, {
            errores: validacion.errores,
            advertencias: validacion.advertencias
          });
        }
        
        return reserva;
      });
      
      setReservas(reservasConTotales);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setError('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  }, [filtrosIniciales]);

  /**
   * Actualiza los totales de una reserva específica
   */
  const actualizarTotalesReserva = useCallback(async (reservaId: number, pagos?: IPago[]) => {
    try {
      const reservaActual = reservas.find(r => r.id === reservaId);
      if (!reservaActual) {
        console.warn(`No se encontró reserva con ID ${reservaId} en la lista local`);
        return;
      }

      // Si no se proporcionan pagos, cargarlos desde la API
      let pagosReserva = pagos;
      if (!pagosReserva) {
        try {
          pagosReserva = await getPagosReservaApi(reservaId);
        } catch (error) {
          console.error(`Error cargando pagos para reserva ${reservaId}:`, error);
          // Usar pagos vacíos para no bloquear la actualización
          pagosReserva = [];
        }
      }

      // Calcular nuevos totales
      const nuevosTotales = calcularTotalesReserva(reservaActual, pagosReserva);
      
      // Actualizar la lista de reservas
      setReservas(prevReservas => 
        actualizarTotalesEnReservas(prevReservas, reservaId, nuevosTotales)
      );

      console.log(`✅ Totales actualizados para reserva ${reservaActual.codigo_reserva}:`, nuevosTotales);
      
    } catch (error) {
      console.error(`Error actualizando totales para reserva ${reservaId}:`, error);
    }
  }, [reservas]);

  /**
   * Actualiza una reserva específica en la lista
   */
  const actualizarReservaEnLista = useCallback((reservaActualizada: IReservaTableData) => {
    setReservas(prevReservas => 
      prevReservas.map(reserva => 
        reserva.id === reservaActualizada.id ? reservaActualizada : reserva
      )
    );
  }, []);

  /**
   * Elimina una reserva de la lista
   */
  const eliminarReservaDeLista = useCallback((reservaId: number) => {
    setReservas(prevReservas => 
      prevReservas.filter(reserva => reserva.id !== reservaId)
    );
  }, []);

  /**
   * Agrega una nueva reserva a la lista
   */
  const agregarReservaALista = useCallback((nuevaReserva: IReservaTableData) => {
    setReservas(prevReservas => [...prevReservas, nuevaReserva]);
  }, []);

  /**
   * Refresca la lista completa de reservas
   */
  const refrescarReservas = useCallback(async () => {
    await loadReservas(filtrosIniciales);
  }, [loadReservas, filtrosIniciales]);

  /**
   * Valida la consistencia de una reserva específica
   */
  const validarConsistenciaReserva = useCallback((reservaId: number) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return null;
    
    return validarConsistenciaTotales(reserva);
  }, [reservas]);

  /**
   * Carga inicial de reservas
   */
  useEffect(() => {
    loadReservas();
  }, [loadReservas]);

  return {
    reservas,
    loading,
    error,
    loadReservas,
    actualizarTotalesReserva,
    actualizarReservaEnLista,
    eliminarReservaDeLista,
    agregarReservaALista,
    refrescarReservas,
    validarConsistenciaReserva,
  };
};