import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../atoms/Button';
import { getInmueblesApi } from '../../auth/getInmueblesApi';
import { IInmueble } from '../../interfaces/Inmueble';
import { createBloqueoApi, updateBloqueoApi } from '../../auth/bloqueosApi';
import { CreateBloqueoRequest, IBloqueo } from '../../interfaces/Bloqueo';

interface CreateBloqueoModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onDeleteRequest?: () => void;  // El padre muestra el modal de confirmación
    initialData?: IBloqueo;
    isEdit?: boolean;
}

const CreateBloqueoModal: React.FC<CreateBloqueoModalProps> = ({ open, onClose, onSuccess, onDeleteRequest, initialData, isEdit }) => {
    const [inmuebles, setInmuebles] = useState<IInmueble[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateBloqueoRequest>({
        id_inmueble: 0,
        fecha_inicio: '',
        fecha_fin: '',
        tipo_bloqueo: 'mantenimiento',
        descripcion: '',
    });

    useEffect(() => {
        if (open) {
            loadInmuebles();
            if (isEdit && initialData) {
                // Populate form for edit
                setFormData({
                    id: initialData.id,
                    id_inmueble: initialData.id_inmueble,
                    fecha_inicio: initialData.fecha_inicio.split('T')[0],
                    fecha_fin: initialData.fecha_fin.split('T')[0],
                    tipo_bloqueo: initialData.tipo_bloqueo as any,
                    descripcion: initialData.descripcion || '',
                } as any);
            } else {
                setFormData({
                    id_inmueble: 0,
                    fecha_inicio: '',
                    fecha_fin: '',
                    tipo_bloqueo: 'mantenimiento',
                    descripcion: '',
                });
            }
            setError(null);
        }
    }, [open, isEdit, initialData]);

    const loadInmuebles = async () => {
        try {
            const data = await getInmueblesApi();
            // En modo edición cargar todos los inmuebles (el bloqueado puede no estar 'disponible')
            setInmuebles(isEdit ? data : data.filter(i => i.estado === 'disponible'));
        } catch (err) {
            console.error('Error cargando inmuebles', err);
        }
    };

    const handleChange = (field: keyof CreateBloqueoRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validaciones básicas (antes de setLoading para no quedar atascado)
        if (!formData.id_inmueble) { setError('Seleccione un inmueble'); return; }
        if (!formData.fecha_inicio) { setError('Seleccione fecha de inicio'); return; }
        if (!formData.fecha_fin) { setError('Seleccione fecha de fin'); return; }
        if (new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
            setError('La fecha de fin debe ser posterior a la de inicio');
            return;
        }

        setLoading(true);

        try {
            if (isEdit && initialData?.id) {
                await updateBloqueoApi(initialData.id, formData);
            } else {
                await createBloqueoApi(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            // Intentar extraer mensaje de error del backend
            let msg = err.message || 'Error al guardar bloqueo';
            try {
                const parsed = JSON.parse(msg);
                if (parsed.message) msg = parsed.message;
            } catch (e) { } // No es JSON
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!initialData?.id) return;
        // Delegar la confirmación y el borrado al padre (Availability)
        // IMPORTANTE: llamar onDeleteRequest primero; el padre cierra este modal
        // sin limpiar selectedBloqueo, para que handleConfirmDelete tenga el ID.
        onDeleteRequest?.();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{isEdit ? 'Editar Bloqueo' : 'Crear Bloqueo de Calendario'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start gap-2 text-sm">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Inmueble</label>
                        <select
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-tourism-teal"
                            value={formData.id_inmueble}
                            onChange={e => handleChange('id_inmueble', Number(e.target.value))}
                        >
                            <option value={0}>Seleccione un inmueble</option>
                            {inmuebles.map(i => (
                                <option key={i.id_inmueble} value={i.id_inmueble}>{i.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                            <input
                                type="date"
                                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-tourism-teal"
                                value={formData.fecha_inicio}
                                onChange={e => handleChange('fecha_inicio', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                            <input
                                type="date"
                                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-tourism-teal"
                                value={formData.fecha_fin}
                                onChange={e => handleChange('fecha_fin', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Bloqueo</label>
                        <select
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-tourism-teal"
                            value={formData.tipo_bloqueo}
                            onChange={e => handleChange('tipo_bloqueo', e.target.value)}
                        >
                            <option value="mantenimiento">Mantenimiento</option>
                            <option value="uso_propietario">Uso del Propietario</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-tourism-teal"
                            rows={3}
                            value={formData.descripcion || ''}
                            onChange={e => handleChange('descripcion', e.target.value)}
                            placeholder="Detalles adicionales..."
                        />
                    </div>

                    <div className="flex justify-between pt-2">
                        {isEdit && (
                            <Button type="button" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDelete}>
                                Eliminar
                            </Button>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" disabled={loading} className="bg-tourism-teal hover:bg-tourism-teal/80 text-white">
                                {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Bloqueo')}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBloqueoModal;
