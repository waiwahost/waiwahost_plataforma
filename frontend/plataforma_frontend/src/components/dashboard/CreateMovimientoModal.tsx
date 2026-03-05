import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { IMovimiento, IMovimientoForm } from '../../interfaces/Movimiento';
import { createMovimiento, updateMovimiento } from '../../auth/movimientosApi';
import { getInmueblesForMovimientos } from '../../auth/inmueblesMovimientosApi';
import { getConceptos, createConcepto, IConcepto } from '../../auth/conceptosApi';
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

// ── Mini-modal para crear un nuevo concepto ──────────────────────────────────
interface CrearConceptoMiniModalProps {
  isOpen: boolean;
  tipo: 'ingreso' | 'egreso' | 'deducible';
  onClose: () => void;
  onCreated: (concepto: IConcepto) => void;
}

// Colores para distinguir tipos de movimiento (compartido entre componentes)
const tipoColors: Record<string, string> = {
  ingreso: 'bg-green-50 border-green-300 text-green-700',
  egreso: 'bg-red-50 border-red-300 text-red-700',
  deducible: 'bg-blue-50 border-blue-300 text-blue-700',
};

const CrearConceptoMiniModal: React.FC<CrearConceptoMiniModalProps> = ({ isOpen, tipo, onClose, onCreated }) => {
  const [nombre, setNombre] = useState('');
  const [tiposSeleccionados, setTiposSeleccionados] = useState<('ingreso' | 'egreso' | 'deducible')[]>([tipo]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setTiposSeleccionados([tipo]);
      setError('');
    }
  }, [isOpen, tipo]);

  const toggleTipo = (t: 'ingreso' | 'egreso' | 'deducible') => {
    setTiposSeleccionados(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const handleCrear = async () => {
    if (!nombre.trim() || nombre.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }
    if (tiposSeleccionados.length === 0) {
      setError('Selecciona al menos un tipo de movimiento');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await createConcepto({ nombre: nombre.trim(), tipo_movimiento: tiposSeleccionados });
      if (res.success && res.data) {
        onCreated(res.data);
        onClose();
      } else {
        setError(res.message || 'Error al crear el concepto');
      }
    } catch {
      setError('Error inesperado al crear el concepto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tipoLabels: Record<string, string> = { ingreso: 'Ingreso', egreso: 'Egreso', deducible: 'Deducible' };
  const tiposColorsActive: Record<string, string> = {
    ingreso: 'bg-green-500 border-green-500 text-white',
    egreso: 'bg-red-500 border-red-500 text-white',
    deducible: 'bg-blue-500 border-blue-500 text-white',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Nuevo Concepto</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del concepto *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => { setNombre(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleCrear()}
              placeholder="Ej: Nómina, Transporte, Publicidad..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aplica para *
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['ingreso', 'egreso', 'deducible'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTipo(t)}
                  className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-all ${tiposSeleccionados.includes(t) ? tiposColorsActive[t] : tipoColors[t]
                    }`}
                >
                  {tiposSeleccionados.includes(t) && <Check className="inline h-3 w-3 mr-1" />}
                  {tipoLabels[t]}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Elige en qué tipos de movimientos aparecerá este concepto</p>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
            Cancelar
          </Button>
          <Button type="button" onClick={handleCrear} disabled={loading} className="flex-1">
            {loading ? <><SimpleSpinner size="sm" />&nbsp;Creando...</> : 'Crear Concepto'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Buscador de conceptos ─────────────────────────────────────────────────────
interface ConceptoBuscadorProps {
  tipo: 'ingreso' | 'egreso' | 'deducible';
  value: string;
  onChange: (valor: string) => void;
  error?: string;
  onConceptoCreado: (concepto: IConcepto) => void;
}

const ConceptoBuscador: React.FC<ConceptoBuscadorProps> = ({ tipo, value, onChange, error, onConceptoCreado }) => {
  const [busqueda, setBusqueda] = useState('');
  const [conceptos, setConceptos] = useState<IConcepto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Nombre del concepto seleccionado
  const conceptoSeleccionado = conceptos.find(c => c.slug === value);

  const cargarConceptos = async (busq?: string) => {
    setLoading(true);
    try {
      const res = await getConceptos({ tipo, busqueda: busq });
      if (res.success) setConceptos(res.data);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al abrir
  useEffect(() => {
    if (open) cargarConceptos(busqueda || undefined);
  }, [open, tipo]);

  // Debounce búsqueda
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => cargarConceptos(busqueda || undefined), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  // Cierre al click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Resetear búsqueda al cerrar
  useEffect(() => { if (!open) setBusqueda(''); }, [open]);

  const handleSeleccionar = (c: IConcepto) => {
    onChange(c.slug);
    setOpen(false);
  };

  const handleConceptoCreado = (c: IConcepto) => {
    setConceptos(prev => [c, ...prev]);
    onConceptoCreado(c);
    onChange(c.slug);
  };

  const conceptosFiltrados = busqueda
    ? conceptos.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : conceptos;

  return (
    <>
      <div ref={containerRef} className="relative">
        {/* Campo de display / trigger */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm ${error ? 'border-red-500' : 'border-gray-300'
            }`}
        >
          <span className={conceptoSeleccionado ? 'text-gray-900' : 'text-gray-400'}>
            {conceptoSeleccionado ? conceptoSeleccionado.nombre : 'Buscar concepto...'}
          </span>
          <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl">
            {/* Buscador */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-tourism-teal focus:border-tourism-teal"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <SimpleSpinner size="sm" />
                </div>
              ) : conceptosFiltrados.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  {busqueda ? `No se encontró "${busqueda}"` : 'No hay conceptos disponibles'}
                </p>
              ) : (
                conceptosFiltrados.map(c => (
                  <button
                    key={c.id_concepto}
                    type="button"
                    onClick={() => handleSeleccionar(c)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between group ${value === c.slug ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                      }`}
                  >
                    <span>{c.nombre}</span>
                    {c.id_empresa === null && (
                      <span className="text-xs text-gray-400 group-hover:text-gray-500">Sistema</span>
                    )}
                    {value === c.slug && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                ))
              )}
            </div>

            {/* Botón crear nuevo */}
            <div className="p-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { setOpen(false); setShowCrearModal(true); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-tourism-teal hover:bg-teal-50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Crear nuevo concepto
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <CrearConceptoMiniModal
        isOpen={showCrearModal}
        tipo={tipo}
        onClose={() => setShowCrearModal(false)}
        onCreated={handleConceptoCreado}
      />
    </>
  );
};

// ── Modal principal ───────────────────────────────────────────────────────────
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
    if (!formData.concepto) newErrors.concepto = 'El concepto es requerido';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (formData.monto <= 0) newErrors.monto = 'El monto debe ser mayor a 0' as any;
    if (!formData.id_inmueble) newErrors.id_inmueble = 'El inmueble es requerido';
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let dataToSend = { ...formData };
      if (dataToSend.tipo === 'deducible') {
        dataToSend.metodo_pago = null;
        dataToSend.plataforma_origen = null;
      }

      const response = movimiento
        ? await updateMovimiento(movimiento.id, dataToSend)
        : await createMovimiento(dataToSend);

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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (field === 'tipo') {
      // Al cambiar de tipo reset concepto
      setFormData(prev => ({ ...prev, tipo: value as any, concepto: '' }));
    }
  };

  if (!isOpen) return null;

  const tipoActual = formData.tipo as 'ingreso' | 'egreso' | 'deducible';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-tourism-navy">
            {movimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm ${errors.fecha ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value as 'ingreso' | 'egreso' | 'deducible')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm"
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
                <option value="deducible">Deducible</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Concepto — buscador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
              <ConceptoBuscador
                tipo={tipoActual}
                value={formData.concepto}
                onChange={(val) => {
                  setFormData(prev => ({ ...prev, concepto: val }));
                  if (errors.concepto) setErrors(prev => ({ ...prev, concepto: undefined }));
                }}
                error={errors.concepto as string}
                onConceptoCreado={() => { }}
              />
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.monto}
                onChange={(e) => handleInputChange('monto', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm ${errors.monto ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="0"
              />
              {errors.monto && <p className="text-red-500 text-xs mt-1">{errors.monto as string}</p>}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm ${errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
              rows={3}
              placeholder="Describe el movimiento..."
            />
            {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inmueble */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inmueble *</label>
              {loadingInmuebles ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <SimpleSpinner size="sm" />
                </div>
              ) : (
                <select
                  value={formData.id_inmueble}
                  onChange={(e) => handleInputChange('id_inmueble', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm ${errors.id_inmueble ? 'border-red-500' : 'border-gray-300'
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
              {errors.id_inmueble && <p className="text-red-500 text-xs mt-1">{errors.id_inmueble}</p>}
            </div>

            {/* Método de Pago */}
            {formData.tipo !== 'deducible' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago *</label>
                <select
                  value={formData.metodo_pago}
                  onChange={(e) => handleInputChange('metodo_pago', e.target.value as 'efectivo' | 'transferencia' | 'tarjeta' | 'otro')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm"
                >
                  {metodosPago.map((metodo) => (
                    <option key={metodo.value} value={metodo.value}>{metodo.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID Reserva */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Reserva (Opcional)</label>
              <input
                type="text"
                value={formData.id_reserva}
                onChange={(e) => handleInputChange('id_reserva', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm"
                placeholder="ID de la reserva (opcional)"
              />
            </div>

            {/* Plataforma Origen */}
            {formData.tipo === 'ingreso' && formData.concepto === 'reserva' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma de Origen</label>
                <select
                  value={formData.plataforma_origen || 'directa'}
                  onChange={(e) => handleInputChange('plataforma_origen', e.target.value as PlataformaOrigen)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm"
                >
                  {PLATAFORMAS_ORIGEN.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante (Opcional)</label>
                <input
                  type="text"
                  value={formData.comprobante}
                  onChange={(e) => handleInputChange('comprobante', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm"
                  placeholder="Número de comprobante o referencia"
                />
              </div>
            )}
          </div>

          {/* Comprobante (si hay plataforma en la columna anterior) */}
          {formData.tipo === 'ingreso' && formData.concepto === 'reserva' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante (Opcional)</label>
              <input
                type="text"
                value={formData.comprobante}
                onChange={(e) => handleInputChange('comprobante', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm"
                placeholder="Número de comprobante o referencia"
              />
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
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