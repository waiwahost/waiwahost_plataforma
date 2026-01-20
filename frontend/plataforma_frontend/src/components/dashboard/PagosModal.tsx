import React, { useState, useEffect } from 'react';
import { X, CreditCard, Trash2, Plus } from 'lucide-react';
import { Button } from '../atoms/Button';
import { IPago, IPagoForm } from '../../interfaces/Pago';
import { IReservaTableData } from '../../interfaces/Reserva';
import { getPagosReservaApi, createPagoApi, deletePagoApi } from '../../auth/pagosApi';

interface PagosModalProps {
  open: boolean;
  onClose: () => void;
  reserva: IReservaTableData | null;
  onPagoCreated?: (pago: IPago) => void;
  onPagoDeleted?: (pagoId: number) => void;
}

const PagosModal: React.FC<PagosModalProps> = ({
  open,
  onClose,
  reserva,
  onPagoCreated,
  onPagoDeleted
}) => {
  const [pagos, setPagos] = useState<IPago[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingPago, setCreatingPago] = useState(false);
  const [formData, setFormData] = useState<IPagoForm>({
    monto: 0,
    metodo_pago: 'efectivo',
    concepto: 'Pago de reserva',
    descripcion: '',
    comprobante: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Cargar pagos cuando se abre el modal
  useEffect(() => {
    if (open && reserva) {
      loadPagos();
    }
  }, [open, reserva]);

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setFormData({
        monto: 0,
        metodo_pago: 'efectivo',
        concepto: 'Pago de reserva',
        descripcion: '',
        comprobante: ''
      });
      setErrors({});
    }
  }, [open]);

  /**
   * Carga los pagos de la reserva
   */
  const loadPagos = async () => {
    if (!reserva) return;
    
    try {
      setLoading(true);
      const pagosData = await getPagosReservaApi(reserva.id);
      setPagos(pagosData);
    } catch (error) {
      console.error('Error cargando pagos:', error);
      alert('Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Valida el formulario de pago
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.monto || formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    }

    if (!formData.metodo_pago) {
      newErrors.metodo_pago = 'Selecciona un método de pago';
    }

    if (formData.concepto && formData.concepto.length < 3) {
      newErrors.concepto = 'El concepto debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el cambio en los inputs del formulario
   */
  const handleInputChange = (field: keyof IPagoForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo al empezar a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Crea un nuevo pago
   */
  const handleCreatePago = async () => {
    if (!reserva || !validateForm()) return;

    try {
      setCreatingPago(true);
      const nuevoPago = await createPagoApi(reserva.id, formData);
      
      // Actualizar lista local
      setPagos(prev => [...prev, nuevoPago]);
      
      // Notificar al componente padre
      if (onPagoCreated) {
        onPagoCreated(nuevoPago);
      }
      
      // Resetear formulario
      setFormData({
        monto: 0,
        metodo_pago: 'efectivo',
        concepto: 'Pago de reserva',
        descripcion: '',
        comprobante: ''
      });
      
      alert('Pago registrado exitosamente');
      
    } catch (error) {
      console.error('Error creando pago:', error);
      alert(error instanceof Error ? error.message : 'Error al registrar el pago');
    } finally {
      setCreatingPago(false);
    }
  };

  /**
   * Elimina un pago
   */
  const handleDeletePago = async (pago: IPago) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar este pago de ${formatCurrency(pago.monto)}?`)) {
      return;
    }

    try {
      await deletePagoApi(pago.id);
      
      // Actualizar lista local
      setPagos(prev => prev.filter(p => p.id !== pago.id));
      
      // Notificar al componente padre
      if (onPagoDeleted) {
        onPagoDeleted(pago.id);
      }
      
      alert('Pago eliminado exitosamente');
      
    } catch (error) {
      console.error('Error eliminando pago:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar el pago');
    }
  };

  /**
   * Formatea valores monetarios
   */
  const formatCurrency = (amount: number | null | undefined) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  /**
   * Formatea fechas
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Obtiene el ícono del método de pago
   */
  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case 'tarjeta':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <span className="text-xs font-semibold">{metodo.toUpperCase()}</span>;
    }
  };

  if (!open || !reserva) return null;

  const totalReserva = reserva.total_reserva || reserva.precio_total;
  
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Pagos de Reserva
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {reserva.codigo_reserva} - {reserva.huesped_principal.nombre} {reserva.huesped_principal.apellido}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Resumen financiero */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Resumen Financiero</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Reserva:</span>
                <p className="font-semibold text-gray-900">{formatCurrency(totalReserva)}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Pagado:</span>
                <p className="font-semibold text-green-600">{formatCurrency(reserva.total_pagado)}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Pendiente:</span>
                <p className={`font-semibold ${(reserva.total_pendiente ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(reserva.total_pendiente)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Cantidad Pagos:</span>
                <p className="font-semibold text-gray-900">{pagos.length}</p>
              </div>
            </div>
          </div>

          {/* Formulario para nuevo pago */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Registrar Nuevo Pago
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={formData.monto || ''}
                  onChange={(e) => handleInputChange('monto', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${
                    errors.monto ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.monto && <p className="text-red-500 text-xs mt-1">{errors.monto}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={formData.metodo_pago}
                  onChange={(e) => handleInputChange('metodo_pago', e.target.value as any)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${
                    errors.metodo_pago ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="otro">Otro</option>
                </select>
                {errors.metodo_pago && <p className="text-red-500 text-xs mt-1">{errors.metodo_pago}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concepto
                </label>
                <input
                  type="text"
                  value={formData.concepto || ''}
                  onChange={(e) => handleInputChange('concepto', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${
                    errors.concepto ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Pago de reserva"
                />
                {errors.concepto && <p className="text-red-500 text-xs mt-1">{errors.concepto}</p>}
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleCreatePago}
                  disabled={creatingPago}
                  className="w-full bg-tourism-teal text-white hover:bg-tourism-teal/90"
                >
                  {creatingPago ? 'Registrando...' : 'Registrar Pago'}
                </Button>
              </div>
            </div>

            {/* Campos adicionales opcionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.descripcion || ''}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                  placeholder="Descripción adicional..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comprobante
                </label>
                <input
                  type="text"
                  value={formData.comprobante || ''}
                  onChange={(e) => handleInputChange('comprobante', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                  placeholder="Número de comprobante..."
                />
              </div>
            </div>
          </div>

          {/* Lista de pagos realizados */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Historial de Pagos ({pagos.length})
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Cargando pagos...</div>
              </div>
            ) : pagos.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No hay pagos registrados para esta reserva</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de Creacion
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Concepto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comprobante
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pagos.map((pago) => (
                      <tr key={pago.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(pago.fecha_creacion)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(pago.fecha_pago)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(pago.monto)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            {getMetodoPagoIcon(pago.metodo_pago)}
                            <span className="capitalize">{pago.metodo_pago}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div>{pago.concepto}</div>
                          {pago.descripcion && (
                            <div className="text-xs text-gray-500 mt-1">{pago.descripcion}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pago.comprobante || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeletePago(pago)}
                            className="inline-flex items-center p-1.5 rounded-md text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors"
                            title="Eliminar pago"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <Button
              onClick={onClose}
              variant="default"
              className="bg-tourism-teal text-white hover:bg-tourism-teal/90"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagosModal;