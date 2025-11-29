import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../atoms/Button';
import { IReservaForm, IHuespedForm } from '../../interfaces/Reserva';
import { getInmueblesApi } from '../../auth/getInmueblesApi';
import { IInmueble } from '../../interfaces/Inmueble';
import { PLATAFORMAS_ORIGEN, PlataformaOrigen } from '../../constants/plataformas';

interface CreateReservaModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: IReservaForm) => void;
  initialData?: IReservaForm;
  isEdit?: boolean;
}

const CreateReservaModal: React.FC<CreateReservaModalProps> = ({
  open,
  onClose,
  onCreate,
  initialData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<IReservaForm>({
    id_inmueble: 0,
    fecha_inicio: '',
    fecha_fin: '',
    numero_huespedes: 1,
    huespedes: [
      {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        documento_tipo: 'cedula',
        documento_numero: '',
        fecha_nacimiento: '',
        es_principal: true,
      }
    ],
    precio_total: 0, // Mantener por compatibilidad
    total_reserva: 0, // Monto total de la reserva
    total_pagado: 0, // Monto total pagado/abonado
    estado: 'pendiente',
    observaciones: '',
    id_empresa: 1, // Por ahora hardcodeado
    plataforma_origen: 'directa', // Valor por defecto
  });

  const [errors, setErrors] = useState<Partial<Record<keyof IReservaForm, string>>>({});
  const [inmuebles, setInmuebles] = useState<IInmueble[]>([]);
  const [loadingInmuebles, setLoadingInmuebles] = useState(false);
  const [expandedGuest, setExpandedGuest] = useState<number>(0); // Estado para controlar qué huésped está expandido

  // Helper para verificar si un huésped tiene todos los datos completos
  const isGuestComplete = (huesped: IHuespedForm): boolean => {
    return Boolean(
      huesped.nombre.trim() &&
      huesped.apellido.trim() &&
      huesped.email.trim() &&
      huesped.telefono.trim() &&
      huesped.documento_numero.trim() &&
      huesped.fecha_nacimiento
    );
  };

  const toggleGuest = (index: number) => {
    setExpandedGuest(prev => (prev === index ? -1 : index));
  };

  // Función para cargar inmuebles desde la API
  const loadInmuebles = async () => {
    try {
      setLoadingInmuebles(true);
      console.log('🏠 Cargando inmuebles disponibles...');
      const inmueblesData = await getInmueblesApi();

      // Filtrar solo inmuebles disponibles/activos para reservas
      const inmueblesDisponibles = inmueblesData.filter(
        inmueble => inmueble.estado === 'disponible'
      );

      setInmuebles(inmueblesDisponibles);
      console.log('✅ Inmuebles cargados:', inmueblesDisponibles.length);
    } catch (error) {
      console.error('❌ Error cargando inmuebles:', error);
      setInmuebles([]);
    } finally {
      setLoadingInmuebles(false);
    }
  };

  useEffect(() => {
    if (open) {
      // Cargar inmuebles cuando se abre el modal
      loadInmuebles();

      if (initialData) {
        // Helper para transformar fecha ISO a YYYY-MM-DD
        const toDateInput = (iso: string) => {
          if (!iso) return '';
          const d = new Date(iso);
          // Ajuste de zona horaria para evitar desfase
          const off = d.getTimezoneOffset();
          d.setMinutes(d.getMinutes() - off);
          return d.toISOString().slice(0, 10);
        };

        setFormData({
          ...initialData,
          estado: initialData.estado, // Asegura que el estado sea exactamente el recibido
          fecha_inicio: toDateInput(initialData.fecha_inicio),
          fecha_fin: toDateInput(initialData.fecha_fin),
          huespedes: initialData.huespedes.map(h => ({
            ...h,
            fecha_nacimiento: toDateInput(h.fecha_nacimiento)
          }))
        });
      } else {
        setFormData({
          id_inmueble: 0,
          fecha_inicio: '',
          fecha_fin: '',
          numero_huespedes: 1,
          huespedes: [
            {
              nombre: '',
              apellido: '',
              email: '',
              telefono: '',
              documento_tipo: 'cedula',
              documento_numero: '',
              fecha_nacimiento: '',
              es_principal: true,
            }
          ],
          precio_total: 0, // Mantener por compatibilidad
          total_reserva: 0, // Monto total de la reserva
          total_pagado: 0, // Monto total pagado/abonado
          estado: 'pendiente',
          observaciones: '',
          id_empresa: 1,
          plataforma_origen: 'directa', // Valor por defecto
        });
      }
      setErrors({});
    }
  }, [open, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof IReservaForm, string>> = {};

    if (!formData.id_inmueble) {
      newErrors.id_inmueble = 'Debes seleccionar un inmueble';
    }

    // Validar huéspedes
    if (formData.huespedes.length === 0) {
      newErrors.huespedes = 'Debe haber al menos un huésped';
    } else {
      // Validar que cada huésped tenga los datos completos
      for (let i = 0; i < formData.huespedes.length; i++) {
        const huesped = formData.huespedes[i];

        if (!huesped.nombre.trim()) {
          newErrors.huespedes = `El nombre del huésped ${i + 1} es requerido`;
          break;
        }

        if (!huesped.apellido.trim()) {
          newErrors.huespedes = `El apellido del huésped ${i + 1} es requerido`;
          break;
        }

        if (!huesped.email.trim()) {
          newErrors.huespedes = `El email del huésped ${i + 1} es requerido`;
          break;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(huesped.email)) {
          newErrors.huespedes = `El email del huésped ${i + 1} no es válido`;
          break;
        }

        if (!huesped.telefono.trim()) {
          newErrors.huespedes = `El teléfono del huésped ${i + 1} es requerido`;
          break;
        }

        if (!huesped.documento_numero.trim()) {
          newErrors.huespedes = `El documento del huésped ${i + 1} es requerido`;
          break;
        }

        if (!huesped.fecha_nacimiento) {
          newErrors.huespedes = `La fecha de nacimiento del huésped ${i + 1} es requerida`;
          break;
        }
      }
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (!formData.fecha_fin) {
      newErrors.fecha_fin = 'La fecha de fin es requerida';
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      if (new Date(formData.fecha_inicio) >= new Date(formData.fecha_fin)) {
        newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la inicio';
      }
    }

    if (formData.numero_huespedes < 1) {
      newErrors.numero_huespedes = 'Debe haber al menos 1 huésped';
    }

    if (formData.numero_huespedes !== formData.huespedes.length) {
      newErrors.numero_huespedes = 'El número de huéspedes no coincide con los datos ingresados';
    }

    if (formData.precio_total <= 0) {
      newErrors.precio_total = 'El precio debe ser mayor a 0';
    }

    // Validaciones para los nuevos campos financieros
    if (formData.total_reserva <= 0) {
      newErrors.total_reserva = 'El total de la reserva debe ser mayor a 0';
    }

    if (formData.total_pagado < 0) {
      newErrors.total_pagado = 'El total pagado no puede ser negativo';
    }

    if (formData.total_pagado > formData.total_reserva) {
      newErrors.total_pagado = 'El total pagado no puede ser mayor al total de la reserva';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onCreate(formData);
    }
  };

  const handleInputChange = (field: keyof IReservaForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Función específica para manejar cambios en los campos financieros
   * Garantiza consistencia entre total_reserva, total_pagado y total_pendiente
   */
  const handleFinancialChange = (field: 'total_reserva' | 'total_pagado', value: number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Mantener precio_total igual a total_reserva para compatibilidad
      if (field === 'total_reserva') {
        newData.precio_total = value;
      }

      // Calcular total_pendiente automáticamente
      const totalReserva = field === 'total_reserva' ? value : prev.total_reserva;
      const totalPagado = field === 'total_pagado' ? value : prev.total_pagado;

      // Validar que total_pagado no sea mayor que total_reserva (solo visual, no bloquear entrada)
      // if (totalPagado > totalReserva) {
      //   return prev; // No actualizar si el pago excede el total
      // }

      return {
        ...newData,
        total_reserva: totalReserva,
        total_pagado: totalPagado,
      };
    });

    // Limpiar errores relacionados
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleHuespedChange = (index: number, field: keyof IHuespedForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      huespedes: prev.huespedes.map((huesped, i) =>
        i === index ? { ...huesped, [field]: value } : huesped
      )
    }));

    // Limpiar errores si los hay
    if (errors.huespedes) {
      setErrors(prev => ({ ...prev, huespedes: undefined }));
    }
  };

  const handleNumeroHuespedesChange = (newNumero: number) => {
    const currentHuespedes = [...formData.huespedes];

    if (newNumero > currentHuespedes.length) {
      // Agregar más huéspedes
      const nuevosHuespedes = [];
      for (let i = currentHuespedes.length; i < newNumero; i++) {
        nuevosHuespedes.push({
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          documento_tipo: 'cedula' as const,
          documento_numero: '',
          fecha_nacimiento: '',
          es_principal: i === 0, // Solo el primero es principal
        });
      }
      currentHuespedes.push(...nuevosHuespedes);
    } else if (newNumero < currentHuespedes.length) {
      // Remover huéspedes (mantener siempre el principal)
      currentHuespedes.splice(newNumero);
    }

    setFormData(prev => ({
      ...prev,
      numero_huespedes: newNumero,
      huespedes: currentHuespedes
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Editar Reserva' : 'Crear Nueva Reserva'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inmueble *
              </label>
              <select
                value={formData.id_inmueble}
                onChange={(e) => handleInputChange('id_inmueble', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${errors.id_inmueble ? 'border-red-300' : 'border-gray-300'
                  }`}
                disabled={loadingInmuebles}
              >
                <option value={0}>
                  {loadingInmuebles ? 'Cargando inmuebles...' : 'Selecciona un inmueble'}
                </option>
                {inmuebles.map((inmueble) => (
                  <option key={inmueble.id_inmueble} value={parseInt(inmueble.id_inmueble)}>
                    {inmueble.nombre} - {inmueble.direccion}
                  </option>
                ))}
              </select>
              {errors.id_inmueble && (
                <p className="text-red-500 text-xs mt-1">{errors.id_inmueble}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plataforma de Origen
              </label>
              <select
                value={formData.plataforma_origen || 'directa'}
                onChange={(e) => handleInputChange('plataforma_origen', e.target.value as PlataformaOrigen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
              >
                {PLATAFORMAS_ORIGEN.map((plataforma) => (
                  <option key={plataforma.value} value={plataforma.value}>
                    {plataforma.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Si no se especifica, se registrará como "Directa"
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Huéspedes *
              </label>
              <select
                value={formData.numero_huespedes}
                onChange={(e) => handleNumeroHuespedesChange(parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${errors.numero_huespedes ? 'border-red-300' : 'border-gray-300'
                  }`}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Huésped' : 'Huéspedes'}
                  </option>
                ))}
              </select>
              {errors.numero_huespedes && (
                <p className="text-red-500 text-xs mt-1">{errors.numero_huespedes}</p>
              )}
            </div>
            {/* Sección de Huéspedes Dinámicos */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información de Huéspedes
              </h3>
              {errors.huespedes && (
                <p className="text-red-500 text-sm mb-4">{errors.huespedes}</p>
              )}

              {formData.huespedes.map((huesped, index) => {
                const isComplete = isGuestComplete(huesped);
                const isExpanded = expandedGuest === index;

                return (
                  <div key={index} className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                    <div
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                        }`}
                      onClick={() => toggleGuest(index)}
                    >
                      <div className="flex items-center space-x-3">
                        {isComplete ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <h4 className="text-md font-medium text-gray-800">
                          {index === 0 ? 'Huésped Principal' : `Huésped Acompañante ${index}`}
                        </h4>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre *
                            </label>
                            <input
                              type="text"
                              value={huesped.nombre}
                              onChange={(e) => handleHuespedChange(index, 'nombre', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                              placeholder="Nombre"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Apellido *
                            </label>
                            <input
                              type="text"
                              value={huesped.apellido}
                              onChange={(e) => handleHuespedChange(index, 'apellido', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                              placeholder="Apellido"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email *
                            </label>
                            <input
                              type="email"
                              value={huesped.email}
                              onChange={(e) => handleHuespedChange(index, 'email', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                              placeholder="correo@ejemplo.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Teléfono *
                            </label>
                            <input
                              type="tel"
                              value={huesped.telefono}
                              onChange={(e) => handleHuespedChange(index, 'telefono', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                              placeholder="+57 300 123 4567"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tipo de Documento *
                            </label>
                            <select
                              value={huesped.documento_tipo}
                              onChange={(e) => handleHuespedChange(index, 'documento_tipo', e.target.value as any)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                            >
                              <option value="cedula">Cédula</option>
                              <option value="pasaporte">Pasaporte</option>
                              <option value="tarjeta_identidad">Tarjeta de Identidad</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Número de Documento *
                            </label>
                            <input
                              type="text"
                              value={huesped.documento_numero}
                              onChange={(e) => handleHuespedChange(index, 'documento_numero', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                              placeholder="Número de documento"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fecha de Nacimiento *
                            </label>
                            <input
                              type="date"
                              value={huesped.fecha_nacimiento}
                              onChange={(e) => handleHuespedChange(index, 'fecha_nacimiento', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Entrada *
              </label>
              <input
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${errors.fecha_inicio ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
              {errors.fecha_inicio && (
                <p className="text-red-500 text-xs mt-1">{errors.fecha_inicio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Salida *
              </label>
              <input
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${errors.fecha_fin ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
              {errors.fecha_fin && (
                <p className="text-red-500 text-xs mt-1">{errors.fecha_fin}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Reserva *
              </label>
              <input
                type="text"
                value={formData.total_reserva > 0 ? new Intl.NumberFormat('es-CO').format(formData.total_reserva) : ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\./g, '').replace(/,/g, '');
                  if (!isNaN(Number(val))) {
                    handleFinancialChange('total_reserva', parseInt(val) || 0);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${errors.total_reserva ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Ej: 150.000"
              />
              {errors.total_reserva && (
                <p className="text-red-500 text-xs mt-1">{errors.total_reserva}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Pagado/Abonado
              </label>
              <input
                type="text"
                value={formData.total_pagado > 0 ? new Intl.NumberFormat('es-CO').format(formData.total_pagado) : ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\./g, '').replace(/,/g, '');
                  if (!isNaN(Number(val))) {
                    handleFinancialChange('total_pagado', parseInt(val) || 0);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${errors.total_pagado ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Ej: 50.000"
              />
              {errors.total_pagado && (
                <p className="text-red-500 text-xs mt-1">{errors.total_pagado}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Monto que el huésped ha pagado como abono
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Pendiente
              </label>
              <div className={`w-full px-3 py-2 border rounded-md bg-gray-50 ${(formData.total_reserva - formData.total_pagado) === 0 ? 'text-green-600' :
                (formData.total_reserva - formData.total_pagado) === formData.total_reserva ? 'text-red-600' : 'text-orange-600'
                }`}>
                ${new Intl.NumberFormat('es-CO').format(formData.total_reserva - formData.total_pagado)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Calculado automáticamente: Total Reserva - Total Pagado
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
              >
                {/* Opciones estándar */}
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
                {/* Si el estado actual no está en las opciones, agregarlo dinámicamente */}
                {[
                  'pendiente',
                  'confirmada',
                  'en_proceso',
                  'completada',
                  'cancelada',
                ].includes(formData.estado) ? null : (
                  <option value={formData.estado}>{formData.estado.charAt(0).toUpperCase() + formData.estado.slice(1)}</option>
                )}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-tourism-teal text-white hover:bg-tourism-teal/90"
            >
              {isEdit ? 'Actualizar' : 'Crear'} Reserva
            </Button>
          </div>
        </form>
      </div >
    </div >
  );
};

export default CreateReservaModal;
