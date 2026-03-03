import React, { useState, useEffect } from 'react';
import { X, Home, MapPin, DollarSign, Bed, Bath, Square, Users, Utensils, TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { IInmueble } from '../../interfaces/Inmueble';
import { IMovimiento } from '../../interfaces/Movimiento';
import { getMovimientosInmuebleApi, formatDateForApi, calcularBalance } from '../../auth/movimientosInmuebleApi';
import { getKpis } from '../../services/kpi.service';
import { KpiResponse, BuildingKpis, UnitKpis } from '../../interfaces/Kpi';
import DateSelectorInmueble from './DateSelectorInmueble';

interface InmuebleDetailModalProps {
  open: boolean;
  onClose: () => void;
  inmueble: IInmueble | null;
  totalArea?: number;
}

const InmuebleDetailModal: React.FC<InmuebleDetailModalProps> = ({
  open,
  onClose,
  inmueble,
  totalArea
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [movimientos, setMovimientos] = useState<IMovimiento[]>([]);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [errorMovimientos, setErrorMovimientos] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KpiResponse | null>(null);
  const [loadingKpis, setLoadingKpis] = useState(false);

  // Cargar movimientos cuando se abre el modal o cambia la fecha
  useEffect(() => {
    if (open && inmueble) {
      loadMovimientos();
    }
  }, [open, inmueble, selectedDate]);

  // Resetear estado cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setSelectedDate(new Date());
      setMovimientos([]);
      setTotalIngresos(0);
      setTotalEgresos(0);
      setErrorMovimientos(null);
    }
  }, [open]);

  /**
   * Carga los movimientos del inmueble para la fecha seleccionada
   */
  const loadMovimientos = async () => {
    if (!inmueble) return;

    try {
      setLoadingMovimientos(true);
      setErrorMovimientos(null);

      const fechaFormatted = formatDateForApi(selectedDate);
      const { ingresos, egresos, movimientos: movimientosData } = await getMovimientosInmuebleApi(
        inmueble.id.toString(),
        fechaFormatted
      );

      setMovimientos(movimientosData);
      setTotalIngresos(Number(ingresos));
      setTotalEgresos(Number(egresos));

    } catch (error) {
      console.error('Error cargando movimientos:', error);
      setErrorMovimientos('Error al cargar los movimientos del inmueble');
    } finally {
      setLoadingMovimientos(false);
    }

    // Load KPIs in parallel
    loadKpis();
  };

  const loadKpis = async () => {
    if (!inmueble) return;
    try {
      setLoadingKpis(true);
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const res = await getKpis({
        id_inmueble: inmueble.id,
        fecha_inicio: thirtyDaysAgo.toISOString().split('T')[0],
        fecha_fin: now.toISOString().split('T')[0]
      });
      setKpis(res);
    } catch (err) {
      console.error('Error fetching KPIs for modal:', err);
    } finally {
      setLoadingKpis(false);
    }
  };

  /**
   * Maneja el cambio de fecha
   */
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  /**
   * Formatea el valor de movimiento con color según el tipo
   */
  const formatMovimientoValue = (monto: any, tipo: string) => {
    const isIngreso = tipo === 'ingreso';
    const numMonto = Number(monto);
    const colorClass = isIngreso ? 'text-green-600' : 'text-red-600';
    const prefix = isIngreso ? '+' : '-';

    return (
      <span className={`font-semibold ${colorClass}`}>
        {prefix}{formatPrice(numMonto)}
      </span>
    );
  };

  /**
   * Formatea fecha y hora para mostrar
   */
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--:--';
    }
  };

  const getEstadoBadge = (estado: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (estado?.toLowerCase()) {
      case 'disponible':
      case 'activo':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'ocupado':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'mantenimiento':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'inactivo':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getTipoBadge = (tipo: string) => {
    return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  if (!open || !inmueble) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b dark:border-border">
          <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">Detalle del Inmueble</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-muted transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Información Principal */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
                  <Home className="h-6 w-6 text-blue-500" />
                  {inmueble.nombre}
                </h3>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {inmueble.direccion}, {inmueble.ciudad}
                </div>
              </div>
              <div className="flex gap-2">
                <span className={getTipoBadge(inmueble.tipo_acomodacion || '')}>
                  {inmueble.tipo_acomodacion}
                </span>
                <span className={getEstadoBadge(inmueble.estado || '')}>
                  {inmueble.estado}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-gray-50 dark:bg-muted/30 p-4 rounded-xl">
              <div>
                <p className="text-gray-500">ID Propiedad</p>
                <p className="font-bold">{inmueble.id_inmueble || inmueble.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Propietario</p>
                <p className="font-bold capitalize">{inmueble.id_propietario}</p>
              </div>
              <div>
                <p className="text-gray-500">RNT</p>
                <p className="font-bold">{inmueble.rnt || 'N/A'}</p>
              </div>
              {inmueble.edificio && (
                <div>
                  <p className="text-gray-500">Edificio</p>
                  <p className="font-bold">{inmueble.edificio}</p>
                </div>
              )}
              {inmueble.apartamento && (
                <div>
                  <p className="text-gray-500">Apto/Nro</p>
                  <p className="font-bold">{inmueble.apartamento}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Especif. Acomodación</p>
                <p className="font-bold">{inmueble.especificacion_acomodacion || 'Estándar'}</p>
              </div>
            </div>
          </section>

          {/* Características */}
          <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-gray-50 dark:bg-muted/20 p-3 rounded-xl text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-gray-500">Capacidad</p>
              <p className="font-bold">{inmueble.capacidad_maxima}</p>
            </div>
            <div className="bg-gray-50 dark:bg-muted/20 p-3 rounded-xl text-center">
              <Bed className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-gray-500">Hab.</p>
              <p className="font-bold">{inmueble.habitaciones}</p>
            </div>
            <div className="bg-gray-50 dark:bg-muted/20 p-3 rounded-xl text-center">
              <Bath className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-gray-500">Baños</p>
              <p className="font-bold">{inmueble.banos}</p>
            </div>
            <div className="bg-gray-50 dark:bg-muted/20 p-3 rounded-xl text-center">
              <Square className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-gray-500">Área</p>
              <p className="font-bold">
                {inmueble.tipo_registro === 'edificio' ? totalArea || 0 : inmueble.area_m2 || 0} m²
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-muted/20 p-3 rounded-xl text-center">
              <Utensils className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-gray-500">Cocina</p>
              <p className="font-bold">{inmueble.tiene_cocina ? 'Sí' : 'No'}</p>
            </div>
          </section>

          {/* Rendimiento (KPIs) */}
          <section className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" /> Rendimiento (Últimos 30 días)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20 text-center">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Ocupación</p>
                <p className="text-lg font-bold">
                  {loadingKpis ? '...' : kpis ? `${(kpis.type === 'unit' ? (kpis.data as UnitKpis).ocupacion : (kpis.data as BuildingKpis).ocupacion_global).toFixed(1)}%` : '-- %'}
                </p>
              </div>
              <div className="bg-purple-50/50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-900/20 text-center">
                <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">RevPAR</p>
                <p className="text-lg font-bold">
                  {loadingKpis ? '...' : kpis ? formatPrice(kpis.type === 'unit' ? (kpis.data as UnitKpis).revpar : (kpis.data as BuildingKpis).revpar_edificio) : '--'}
                </p>
              </div>
              <div className="bg-green-50/50 dark:bg-green-950/20 p-3 rounded-xl border border-green-100 dark:border-green-900/20 text-center">
                <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Ingreso Neto</p>
                <p className="text-lg font-bold">
                  {loadingKpis ? '...' : kpis ? formatPrice(kpis.type === 'unit' ? (kpis.data as UnitKpis).ingreso_neto : (kpis.data as BuildingKpis).ingresos_totales) : '--'}
                </p>
              </div>
              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/20 text-center">
                <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">Utilidad</p>
                <p className="text-lg font-bold">
                  {loadingKpis ? '...' : kpis ? formatPrice(kpis.type === 'unit' ? (kpis.data as UnitKpis).utilidad : (kpis.data as BuildingKpis).utilidad_total) : '--'}
                </p>
              </div>
            </div>
            {kpis?.type === 'unit' && (kpis.data as UnitKpis).costo_limpieza > 0 && (
              <p className="text-[11px] text-gray-500 text-center italic">
                Costo de limpieza acumulado (30d): {formatPrice((kpis.data as UnitKpis).costo_limpieza)}
              </p>
            )}
          </section>

          {/* Finanzas */}
          <section className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <h4 className="text-blue-900 dark:text-blue-400 font-bold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Información Financiera
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-500 font-bold uppercase tracking-wider">Tarifa base</p>
                <p className="text-2xl font-black text-gray-900 dark:text-foreground">{formatPrice(inmueble.precio)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-500 font-bold uppercase tracking-wider">Limpieza</p>
                <p className="text-xl font-bold text-gray-700 dark:text-gray-300">{formatPrice(inmueble.precio_limpieza)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-500 font-bold uppercase tracking-wider">Comisión</p>
                <p className="text-xl font-bold text-gray-700 dark:text-gray-300">{(inmueble.comision || 0)}%</p>
              </div>
            </div>
          </section>

          {/* Movimientos */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-tourism-teal" /> Historial de Movimientos
              </h4>
              <DateSelectorInmueble selectedDate={selectedDate} onDateChange={handleDateChange} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900/30 text-center">
                <p className="text-xs text-green-700 font-bold">INGRESOS</p>
                <p className="text-lg font-bold text-green-700">{formatPrice(totalIngresos)}</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 text-center">
                <p className="text-xs text-red-700 font-bold">EGRESOS</p>
                <p className="text-lg font-bold text-red-700">{formatPrice(totalEgresos)}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-xl text-center">
                <p className="text-xs text-gray-500 font-bold">BALANCE</p>
                <p className={`text-lg font-bold ${calcularBalance(totalIngresos, totalEgresos) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatPrice(calcularBalance(totalIngresos, totalEgresos))}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-muted/10 border dark:border-border rounded-2xl overflow-hidden divide-y dark:divide-border">
              {loadingMovimientos ? (
                <div className="p-12 text-center text-gray-400">Cargando movimientos...</div>
              ) : movimientos.length === 0 ? (
                <div className="p-12 text-center text-gray-400">No hay movimientos registrados para este periodo.</div>
              ) : (
                movimientos.map((mov) => (
                  <div key={mov.id} className="p-4 hover:bg-gray-50 dark:hover:bg-muted/20 transition-colors flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${mov.tipo === 'ingreso' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-bold text-gray-900 dark:text-foreground text-sm">{mov.concepto}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-4">
                        {mov.descripcion || 'Sin descripción'}
                      </p>
                      <div className="flex gap-3 text-[10px] text-gray-400 ml-4 font-medium uppercase tracking-tight">
                        <span>{formatDateTime(mov.fecha_creacion)}</span>
                        {mov.metodo_pago && <span>• {mov.metodo_pago}</span>}
                        {mov.codigo_reserva && <span className="text-blue-500">• Res: {mov.codigo_reserva}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      {formatMovimientoValue(mov.monto, mov.tipo)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-border bg-gray-50/50 dark:bg-muted/20">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 dark:bg-foreground text-white dark:text-background font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default InmuebleDetailModal;
