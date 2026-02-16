import React, { useState, useEffect } from 'react';
import { X, Home, MapPin, DollarSign, Bed, Bath, Square, Users, Utensils, TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { IInmueble } from '../../interfaces/Inmueble';
import { IMovimiento } from '../../interfaces/Movimiento';
import { getMovimientosInmuebleApi, formatDateForApi, calcularBalance } from '../../auth/movimientosInmuebleApi';
import DateSelectorInmueble from './DateSelectorInmueble';

interface InmuebleDetailModalProps {
  open: boolean;
  onClose: () => void;
  inmueble: IInmueble | null;
}

const InmuebleDetailModal: React.FC<InmuebleDetailModalProps> = ({
  open,
  onClose,
  inmueble
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [movimientos, setMovimientos] = useState<IMovimiento[]>([]);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [errorMovimientos, setErrorMovimientos] = useState<string | null>(null);

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
      setTotalIngresos(ingresos);
      setTotalEgresos(egresos);

    } catch (error) {
      console.error('Error cargando movimientos:', error);
      setErrorMovimientos('Error al cargar los movimientos del inmueble');
    } finally {
      setLoadingMovimientos(false);
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
  const formatMovimientoValue = (monto: number, tipo: 'ingreso' | 'egreso') => {
    const colorClass = tipo === 'ingreso' ? 'text-green-600' : 'text-red-600';
    const prefix = tipo === 'ingreso' ? '+' : '-';

    return (
      <span className={`font-semibold ${colorClass}`}>
        {prefix}{formatPrice(monto)}
      </span>
    );
  };

  /**
   * Formatea fecha y hora para mostrar
   */
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!open || !inmueble) return null;

  const getEstadoBadge = (estado: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (estado) {
      case 'disponible':
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
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Detalle del Inmueble</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Información Principal */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Home className="h-5 w-5 mr-2" />
                {inmueble.nombre}
              </h3>
              <div className="flex space-x-2">
                <span className={getTipoBadge(inmueble.tipo_acomodacion)}>
                  {inmueble.tipo_acomodacion}
                </span>
                <span className={getEstadoBadge(inmueble.estado)}>
                  {inmueble.estado}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{inmueble.direccion}</span>
              </div>

              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1 opacity-0" />
                <span className="text-sm">{inmueble.ciudad || 'Sin ciudad'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="text-sm">
                  <span className="text-gray-600">ID Inmueble:</span>
                  <span className="font-medium ml-2">{inmueble.id_inmueble || inmueble.id}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">ID Propietario:</span>
                  <span className="font-medium ml-2">{inmueble.id_propietario}</span>
                </div>
                  {inmueble.edificio || inmueble.apartamento ? (
                    <>
                      <div className="text-sm">
                        <span className="text-gray-600">Edificio:</span>
                        <span className="font-medium ml-2">{inmueble.edificio}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Apartamento:</span>
                        <span className="font-medium ml-2">{inmueble.apartamento}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm">
                        <span className="text-gray-600">Tipo Acomodación:</span>
                        <span className="font-medium ml-2">{inmueble.tipo_acomodacion}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Especificación:</span>
                        <span className="font-medium ml-2">{inmueble.especificacion_acomodacion}</span>
                      </div>
                    </>
                  )}
                  <div className="text-sm">
                  <span className="text-gray-600">RNT:</span>
                  <span className="font-medium ml-2">{inmueble.rnt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Financiera</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Precio</p>
                  <p className="text-lg font-semibold text-green-600">{formatPrice(inmueble.precio)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Precio Limpieza</p>
                <p className="text-lg font-semibold text-gray-900">{formatPrice(inmueble.precio_limpieza)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Comisión</p>
                <p className="text-lg font-semibold text-blue-600">{formatPrice(inmueble.comision)}</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-sm">
                <span className="text-gray-600">ID Producto Sigo:</span>
                <span className="font-medium ml-2">{inmueble.id_producto_sigo}</span>
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Características</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">{inmueble.capacidad_maxima}</p>
                <p className="text-xs text-gray-500">Capacidad</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Bed className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">{inmueble.habitaciones}</p>
                <p className="text-xs text-gray-500">Habitaciones</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Bath className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">{inmueble.banos}</p>
                <p className="text-xs text-gray-500">Baños</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Square className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">{inmueble.area}</p>
                <p className="text-xs text-gray-500">m²</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Utensils className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">{inmueble.tiene_cocina ? 'Sí' : 'No'}</p>
                <p className="text-xs text-gray-500">Cocina</p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {inmueble.descripcion || 'Sin descripción disponible'}
            </p>
          </div>

          {/* Información del Sistema */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Empresa:</span>
                <span className="font-medium ml-2">{inmueble.nombre_empresa}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">ID Empresa:</span>
                <span className="font-medium ml-2">{inmueble.id_empresa}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Fecha Creación:</span>
                <span className="font-medium ml-2">{new Date(inmueble.fecha_creacion).toLocaleDateString('es-CO')}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Última Actualización:</span>
                <span className="font-medium ml-2">{new Date(inmueble.fecha_actualizacion).toLocaleDateString('es-CO')}</span>
              </div>
            </div>
          </div>

          {/* Movimientos del Inmueble */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-tourism-teal" />
                Movimientos del Inmueble
              </h3>
              <DateSelectorInmueble
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>

            {/* Resumen del día */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatPrice(totalIngresos)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Egresos</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatPrice(totalEgresos)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Balance</p>
                    <p className={`text-xl font-bold ${calcularBalance(totalIngresos, totalEgresos) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                      }`}>
                      {formatPrice(calcularBalance(totalIngresos, totalEgresos))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de movimientos */}
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">
                  Detalle de Movimientos ({movimientos.length})
                </h4>
              </div>

              {loadingMovimientos ? (
                <div className="p-8 text-center">
                  <div className="text-gray-500">Cargando movimientos...</div>
                </div>
              ) : errorMovimientos ? (
                <div className="p-4">
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span>{errorMovimientos}</span>
                    <button
                      onClick={loadMovimientos}
                      className="ml-auto text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              ) : movimientos.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-500 mb-2">No hay movimientos para esta fecha</div>
                  <div className="text-sm text-gray-400">
                    Los movimientos aparecerán aquí una vez que se registren
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {movimientos.map((movimiento) => (
                    <div key={movimiento.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${movimiento.tipo === 'ingreso'
                              ? 'bg-green-100'
                              : 'bg-red-100'
                            }`}>
                            {movimiento.tipo === 'ingreso' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {movimiento.concepto}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(movimiento.fecha_creacion)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {formatMovimientoValue(movimiento.monto, movimiento.tipo)}
                          <p className="text-xs text-gray-500 capitalize">
                            {movimiento.metodo_pago}
                          </p>
                        </div>
                      </div>

                      <div className="ml-11 space-y-1">
                        {movimiento.descripcion && (
                          <p className="text-sm text-gray-600">
                            {movimiento.descripcion}
                          </p>
                        )}

                        <div className="flex gap-4 text-xs text-gray-500">
                          {movimiento.codigo_reserva && (
                            <span>Reserva: {movimiento.codigo_reserva}</span>
                          )}
                          {movimiento.comprobante && (
                            <span>Comprobante: {movimiento.comprobante}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InmuebleDetailModal;
