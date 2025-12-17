import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { IInmuebleForm } from '../../interfaces/Inmueble';
import { useAuth } from '../../auth/AuthContext';
import { getPropietariosApi } from '../../auth/propietariosApi';
import { IPropietarioTableData } from '../../interfaces/Propietario';
import { getEmpresasApi } from '../../auth/getEmpresasApi';
import { CIUDADES_COLOMBIA } from '../../constants/ciudades';

interface CreateInmuebleModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (inmueble: IInmuebleForm) => void;
  initialData?: Partial<IInmuebleForm>;
  isEdit?: boolean;
}

const CreateInmuebleModal: React.FC<CreateInmuebleModalProps> = ({
  open,
  onClose,
  onCreate,
  initialData,
  isEdit = false
}) => {
  const { user } = useAuth();
  const [propietarios, setPropietarios] = useState<IPropietarioTableData[]>([]);
  const [loadingPropietarios, setLoadingPropietarios] = useState(false);
  const [empresas, setEmpresas] = useState<{ id_empresa: number; nombre: string }[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);

  const {
    register,
    handleSubmit,

    reset,
    watch,
    setValue, // Added setValue
    formState: { errors, isSubmitting }
  } = useForm<IInmuebleForm>({
    defaultValues: initialData || {
      nombre: '',
      direccion: '',
      ciudad: '',
      edificio: '',
      apartamento: '',
      id_producto_sigo: '',
      descripcion: '',
      capacidad_maxima: 1,
      habitaciones: 1,
      banos: 1,
      comision: 0,
      precio_limpieza: 0,
      tiene_cocina: false,
      id_propietario: '',
      id_empresa: '1'
    }
  });

  useEffect(() => {
    const fetchPropietarios = async () => {
      try {
        setLoadingPropietarios(true);
        const data = await getPropietariosApi();
        setPropietarios(data);
      } catch (error) {
        console.error('Error fetching propietarios:', error);
      } finally {
        setLoadingPropietarios(false);
      }
    };

    const fetchEmpresas = async () => {
      try {
        setLoadingEmpresas(true);
        const response = await getEmpresasApi();
        if (response.success) {
          setEmpresas(response.data);
          // Si solo hay una empresa, seleccionarla automáticamente
          if (response.data.length === 1) {
            // Usamos setValue de react-hook-form si estuviéramos fuera del reset, 
            // pero como esto corre al inicio, el reset inicial o el useEffect de abajo lo manejará.
            // Sin embargo, para asegurar que se seleccione visualmente si ya se renderizó:
            // setValue('id_empresa', response.data[0].id_empresa.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching empresas:', error);
      } finally {
        setLoadingEmpresas(false);
      }
    };

    if (open) {
      fetchPropietarios();
      fetchEmpresas();
    }
  }, [open]);



  // Efecto para pre-seleccionar empresa si solo hay una
  useEffect(() => {
    if (empresas.length === 1) {
      reset(currentValues => ({
        ...currentValues,
        id_empresa: empresas[0].id_empresa.toString()
      }));
    }
  }, [empresas, reset]);

  useEffect(() => {
    if (open && initialData) {
      reset(initialData);
    } else if (open && !isEdit) {
      reset({
        nombre: '',
        direccion: '',
        ciudad: '',
        edificio: '',
        apartamento: '',
        id_producto_sigo: '',
        descripcion: '',
        capacidad_maxima: 1,
        habitaciones: 1,
        banos: 1,
        comision: 0,
        precio_limpieza: 0,
        tiene_cocina: false,
        id_propietario: '',
        id_empresa: '1'
      });
    }
  }, [open, initialData, isEdit, reset]);

  const onSubmit = async (data: IInmuebleForm) => {
    try {
      // Convertir comision a número, reemplazando coma por punto si es necesario
      const formattedData = {
        ...data,
        comision: typeof data.comision === 'string'
          ? parseFloat((data.comision as string).replace(',', '.'))
          : data.comision,
        precio_limpieza: typeof data.precio_limpieza === 'string'
          ? (data.precio_limpieza === '' ? 0 : parseInt(data.precio_limpieza as string, 10))
          : data.precio_limpieza
      };
      await onCreate(formattedData);
      if (!isEdit) {
        reset();
      }
    } catch (error) {
      console.error('Error al procesar inmueble:', error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Editar Inmueble' : 'Crear Nuevo Inmueble'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del Inmueble *
                </label>
                <input
                  type="text"
                  {...register('nombre', { required: 'El nombre es requerido' })}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Apartamento Centro"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ID Producto Sigo *
                  {isEdit && <span className="text-xs text-gray-500 ml-1">(No editable)</span>}
                </label>
                <input
                  type="text"
                  {...register('id_producto_sigo', { required: 'El ID del producto Sigo es requerido' })}
                  disabled={isEdit}
                  className={`w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white ${isEdit ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75' : ''
                    }`}
                  placeholder="Ej: SIGO123"
                />
                {errors.id_producto_sigo && (
                  <p className="text-red-500 text-xs mt-1">{errors.id_producto_sigo.message}</p>
                )}
              </div>
            </div>

            {/* Dirección y ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  {...register('direccion', { required: 'La dirección es requerida' })}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Calle 10 #5-20, Centro"
                />
                {errors.direccion && (
                  <p className="text-red-500 text-xs mt-1">{errors.direccion.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ciudad *
                </label>
                <select
                  {...register('ciudad', { required: 'La ciudad es requerida' })}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seleccione una ciudad</option>
                  {CIUDADES_COLOMBIA.map((ciudad) => (
                    <option key={ciudad} value={ciudad}>
                      {ciudad}
                    </option>
                  ))}
                </select>
                {errors.ciudad && (
                  <p className="text-red-500 text-xs mt-1">{errors.ciudad.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Edificio *
                </label>
                <input
                  type="text"
                  {...register('edificio', { required: 'El edificio es requerido' })}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Torre Central"
                />
                {errors.edificio && (
                  <p className="text-red-500 text-xs mt-1">{errors.edificio.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Apartamento *
                </label>
                <input
                  type="text"
                  {...register('apartamento', { required: 'El apartamento es requerido' })}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: 501"
                />
                {errors.apartamento && (
                  <p className="text-red-500 text-xs mt-1">{errors.apartamento.message}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                {...register('descripcion')}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Descripción del inmueble"
              />
              {errors.descripcion && (
                <p className="text-red-500 text-xs mt-1">{errors.descripcion.message}</p>
              )}
            </div>

            {/* Capacidad y características */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Capacidad Máxima *
                </label>
                <input
                  type="number"
                  {...register('capacidad_maxima', {
                    required: 'La capacidad máxima es requerida',
                    min: { value: 1, message: 'Debe ser mayor a 0' }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="4"
                />
                {errors.capacidad_maxima && (
                  <p className="text-red-500 text-xs mt-1">{errors.capacidad_maxima.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Habitaciones *
                </label>
                <input
                  type="number"
                  {...register('habitaciones', {
                    required: 'Las habitaciones son requeridas',
                    min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="2"
                />
                {errors.habitaciones && (
                  <p className="text-red-500 text-xs mt-1">{errors.habitaciones.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Baños *
                </label>
                <input
                  type="number"
                  {...register('banos', {
                    required: 'Los baños son requeridos',
                    min: { value: 1, message: 'Debe tener al menos 1 baño' }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="1"
                />
                {errors.banos && (
                  <p className="text-red-500 text-xs mt-1">{errors.banos.message}</p>
                )}
              </div>
            </div>

            {/* Precios y comisión */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Porcentaje de Comisión *
                </label>
                <input
                  type="text"
                  {...register('comision', {
                    required: 'La comisión es requerida',
                    validate: (value) => {
                      if (!/^[0-9]*[.,]?[0-9]*$/.test(value.toString())) {
                        return 'Solo se permiten números y decimales (punto o coma)';
                      }
                      return true;
                    }
                  })}
                  onKeyPress={(e) => {
                    if (!/[0-9.,]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="10.5"
                />
                {errors.comision && (
                  <p className="text-red-500 text-xs mt-1">{errors.comision.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Precio Limpieza
                </label>
                <input
                  type="text"
                  {...register('precio_limpieza', {
                    validate: (value) => {
                      if (value && !/^[0-9]*$/.test(value.toString())) {
                        return 'Solo se permiten números enteros';
                      }
                      return true;
                    }
                  })}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="50000"
                />
                {errors.precio_limpieza && (
                  <p className="text-red-500 text-xs mt-1">{errors.precio_limpieza.message}</p>
                )}
              </div>
            </div>

            {/* IDs requeridos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Propietario *
                  {isEdit && <span className="text-xs text-gray-500 ml-1">(No editable)</span>}
                </label>
                {isEdit ? (
                  <input
                    type="text"
                    disabled

                    value={(() => {
                      const currentId = watch('id_propietario');
                      const selectedProp = propietarios.find(p => p.id.toString() == currentId?.toString());
                      if (selectedProp) return `${selectedProp.nombre} ${selectedProp.apellido}`;
                      return (initialData as any)?.propietario_nombre || 'Desconocido';
                    })()}
                    className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75"
                  />
                ) : (
                  <>
                    <select
                      {...register('id_propietario', {
                        required: 'El propietario es requerido',
                      })}
                      disabled={isEdit || loadingPropietarios}
                      className={`w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white ${(isEdit || loadingPropietarios) ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75' : ''
                        }`}
                    >
                      <option value="">Seleccione un propietario</option>
                      {propietarios.map((prop) => (
                        <option key={prop.id} value={prop.id}>
                          {prop.nombre} {prop.apellido}
                        </option>
                      ))}
                    </select>
                    {loadingPropietarios && <p className="text-xs text-gray-500 mt-1">Cargando propietarios...</p>}
                  </>
                )}
                {errors.id_propietario && (
                  <p className="text-red-500 text-xs mt-1">{errors.id_propietario.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Empresa *
                  {(isEdit || empresas.length === 1) && <span className="text-xs text-gray-500 ml-1">(No editable)</span>}
                </label>
                {isEdit ? (
                  <input
                    type="text"
                    disabled
                    value={(() => {
                      const currentId = watch('id_empresa');
                      const selectedEmp = empresas.find(e => e.id_empresa.toString() == currentId?.toString());
                      if (selectedEmp) return selectedEmp.nombre;
                      return (initialData as any)?.empresa_nombre || 'Desconocido';
                    })()}
                    className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75"
                  />
                ) : (
                  <>
                    <select
                      {...register('id_empresa', {
                        required: 'La empresa es requerida',
                      })}
                      disabled={isEdit || loadingEmpresas || empresas.length === 1}
                      className={`w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white ${(isEdit || loadingEmpresas || empresas.length === 1) ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75' : ''
                        }`}
                    >
                      <option value="">Seleccione una empresa</option>
                      {empresas.map((emp) => (
                        <option key={emp.id_empresa} value={emp.id_empresa}>
                          {emp.nombre}
                        </option>
                      ))}
                    </select>
                    {loadingEmpresas && <p className="text-xs text-gray-500 mt-1">Cargando empresas...</p>}
                  </>
                )}
                {errors.id_empresa && (
                  <p className="text-red-500 text-xs mt-1">{errors.id_empresa.message}</p>
                )}
              </div>
            </div>

            {/* Cocina */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('tiene_cocina')}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tiene cocina
                </span>
              </label>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? 'Procesando...' : (isEdit ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateInmuebleModal;
