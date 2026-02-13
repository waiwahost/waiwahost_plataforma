import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { IMovimiento, IMovimientoForm, ConceptoIngreso, ConceptoEgreso, ConceptoDeducible } from '../../interfaces/Movimiento';
import { createMovimiento, updateMovimiento } from '../../auth/movimientosApi';
import { getInmueblesForMovimientos } from '../../auth/inmueblesMovimientosApi';
import { IInmueble } from '../../interfaces/Inmueble';
import { Button } from '../atoms/Button';
import SimpleSpinner from './SimpleSpinner';
import { PLATAFORMAS_ORIGEN, PlataformaOrigen } from '../../constants/plataformas';

interface CreateMovimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  movimiento?: IMovimiento | null;
  selectedDate: string;
}

const CreateMovimientoModal: React.FC<CreateMovimientoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  movimiento,
  selectedDate
}) => {
  const [formData, setFormData] = useState<IMovimientoForm>({
    tipo: 'ingreso',
    concepto: '',
    descripcion: '',
    monto: 0,
    id_inmueble: '',
    id_reserva: '',
    plataforma_origen: undefined,
    metodo_pago: 'efectivo',
    comprobante: '',
    fecha: selectedDate
  });

  const [inmuebles, setInmuebles] = useState<IInmueble[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInmuebles, setLoadingInmuebles] = useState(true);
  const [errors, setErrors] = useState<Partial<IMovimientoForm>>({});

  const conceptosIngreso: { value: ConceptoIngreso; label: string }[] = [
    { value: 'reserva', label: 'Reserva' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'deposito_garantia', label: 'Depósito de Garantía' },
    { value: 'servicios_adicionales', label: 'Servicios Adicionales' },
    { value: 'multa', label: 'Multa' },
    { value: 'otro', label: 'Otro' }
  ];

  const conceptosEgreso: { value: ConceptoEgreso; label: string }[] = [
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'servicios_publicos', label: 'Servicios Públicos' },
    { value: 'suministros', label: 'Suministros' },
    { value: 'comision', label: 'Comisión' },
    { value: 'devolucion', label: 'Devolución' },
    { value: 'impuestos', label: 'Impuestos' },
    { value: 'otro', label: 'Otro' }
  ];

  const conceptosDeducibles: { value: ConceptoDeducible; label: string }[] = [
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'servicios_publicos', label: 'Servicios Públicos' },
    { value: 'suministros', label: 'Suministros' },
    { value: 'comision', label: 'Comisión' },
    { value: 'impuestos', label: 'Impuestos' },
    { value: 'multa', label: 'Multa' },
    { value: 'otro', label: 'Otro' }
  ];

  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'otro', label: 'Otro' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadInmuebles();
      if (movimiento) {
        setFormData({
          tipo: movimiento.tipo,
          concepto: movimiento.concepto,
          descripcion: movimiento.descripcion,
          monto: movimiento.monto,
          id_inmueble: movimiento.id_inmueble,
          id_reserva: movimiento.id_reserva || '',
          plataforma_origen: movimiento.plataforma_origen,
          metodo_pago: movimiento.metodo_pago,
          comprobante: movimiento.comprobante || '',
          fecha: movimiento.fecha
        });
      } else {
        setFormData({
          tipo: 'ingreso',
          concepto: '',
          descripcion: '',
          monto: 0,
          id_inmueble: '',
          id_reserva: '',
          plataforma_origen: undefined,
          metodo_pago: 'efectivo',
          comprobante: '',
          fecha: selectedDate
        });
      }
      setErrors({});
    }
  }, [isOpen, movimiento, selectedDate]);

  const loadInmuebles = async () => {
    setLoadingInmuebles(true);
    try {
      const response = await getInmueblesForMovimientos();
      if (response.success && Array.isArray(response.data)) {
        setInmuebles(response.data);
      }
    } catch (error) {
      console.error('Error loading inmuebles:', error);
    } finally {
      setLoadingInmuebles(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<IMovimientoForm> = {};

    if (!formData.concepto) {
      newErrors.concepto = 'El concepto es requerido';
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    if (formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0' as any;
    }
    if (!formData.id_inmueble) {
      newErrors.id_inmueble = 'El inmueble es requerido';
    }
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {

      let dataToSend = { ...formData };

      if (dataToSend.tipo === 'deducible') {
        dataToSend.metodo_pago = null;
        dataToSend.plataforma_origen = null;
      }

      let response;
      if (movimiento) {
        response = await updateMovimiento(movimiento.id, dataToSend);
      } else {
        response = await createMovimiento(dataToSend);
      }

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        alert(response.message || 'Error al guardar el movimiento');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof IMovimientoForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Reset concepto when tipo changes
    if (field === 'tipo') {
      setFormData(prev => ({ ...prev, concepto: '' }));
    }
  };

  if (!isOpen) return null;

  const conceptosDisponibles = formData.tipo === 'ingreso' ? conceptosIngreso : formData.tipo === 'egreso' ? conceptosEgreso : conceptosDeducibles;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-tourism-navy">
            {movimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent ${
                  errors.fecha ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fecha && (
                <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value as 'ingreso' | 'egreso' | 'deducible')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent"
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
                <option value="deducible">Deducible</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Concepto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Concepto *
              </label>
              <select
                value={formData.concepto}
                onChange={(e) => handleInputChange('concepto', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent ${
                  errors.concepto ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar concepto</option>
                {conceptosDisponibles.map((concepto) => (
                  <option key={concepto.value} value={concepto.value}>
                    {concepto.label}
                  </option>
                ))}
              </select>
              {errors.concepto && (
                <p className="text-red-500 text-sm mt-1">{errors.concepto}</p>
              )}
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.monto}
                onChange={(e) => handleInputChange('monto', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent ${
                  errors.monto ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.monto && (
                <p className="text-red-500 text-sm mt-1">{errors.monto}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent ${
                errors.descripcion ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Describe el movimiento..."
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inmueble */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inmueble *
              </label>
              {loadingInmuebles ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <SimpleSpinner size="sm" />
                </div>
              ) : (
                <select
                  value={formData.id_inmueble}
                  onChange={(e) => handleInputChange('id_inmueble', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent ${
                    errors.id_inmueble ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar inmueble</option>
                  {inmuebles.map((inmueble) => (
                    <option key={inmueble.id} value={inmueble.id}>
                      {inmueble.nombre}
                    </option>
                  ))}
                </select>
              )}
              {errors.id_inmueble && (
                <p className="text-red-500 text-sm mt-1">{errors.id_inmueble}</p>
              )}
            </div>

            {/* Método de Pago (No para deducibles) */}
            {formData.tipo !== 'deducible' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={formData.metodo_pago}
                  onChange={(e) =>
                    handleInputChange(
                      'metodo_pago',
                      e.target.value as 'efectivo' | 'transferencia' | 'tarjeta' | 'otro'
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent"
                >
                  {metodosPago.map((metodo) => (
                    <option key={metodo.value} value={metodo.value}>
                      {metodo.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID Reserva */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Reserva (Opcional)
              </label>
              <input
                type="text"
                value={formData.id_reserva}
                onChange={(e) => handleInputChange('id_reserva', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent"
                placeholder="ID de la reserva (opcional)"
              />
            </div>

            {/* Plataforma Origen - Solo visible si es ingreso y concepto es reserva */}
            {formData.tipo === 'ingreso' && formData.concepto === 'reserva' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plataforma de Origen
                </label>
                <select
                  value={formData.plataforma_origen || 'directa'}
                  onChange={(e) => handleInputChange('plataforma_origen', e.target.value as PlataformaOrigen)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent"
                >
                  {PLATAFORMAS_ORIGEN.map((plataforma) => (
                    <option key={plataforma.value} value={plataforma.value}>
                      {plataforma.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Selecciona la plataforma desde donde se originó esta reserva
                </p>
              </div>
            )}

            {/* Comprobante - Solo si no es el selector de plataforma */}
            {!(formData.tipo === 'ingreso' && formData.concepto === 'reserva') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comprobante (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.comprobante}
                  onChange={(e) => handleInputChange('comprobante', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent"
                  placeholder="Número de comprobante o referencia"
                />
              </div>
            )}
          </div>

          {/* Comprobante - Fila completa si hay selector de plataforma */}
          {formData.tipo === 'ingreso' && formData.concepto === 'reserva' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comprobante (Opcional)
              </label>
              <input
                type="text"
                value={formData.comprobante}
                onChange={(e) => handleInputChange('comprobante', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent"
                placeholder="Número de comprobante o referencia"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <SimpleSpinner size="sm" />
                  Guardando...
                </div>
              ) : (
                movimiento ? 'Actualizar' : 'Crear Movimiento'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMovimientoModal;