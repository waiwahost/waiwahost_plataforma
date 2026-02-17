import React, { useState, useEffect } from 'react';
import { X, Download, Calendar, Home, Tag } from 'lucide-react';
import { Button } from '../atoms/Button';
import { exportMovimientosToExcel } from '../../auth/movimientosApi';
import { getInmueblesForMovimientos } from '../../auth/inmueblesMovimientosApi';
import { IInmueble } from '../../interfaces/Inmueble';
import SimpleSpinner from './SimpleSpinner';

interface ExportMovimientosModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string;
}

const ExportMovimientosModal: React.FC<ExportMovimientosModalProps> = ({
    isOpen,
    onClose,
    selectedDate
}) => {
    const [filters, setFilters] = useState({
        fecha_inicio: selectedDate,
        fecha_fin: selectedDate,
        id_inmueble: '',
        tipo: 'todos'
    });

    const [inmuebles, setInmuebles] = useState<IInmueble[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingInmuebles, setLoadingInmuebles] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadInmuebles();
            // Ajustar fecha inicio al inicio del mes por defecto
            const date = new Date(selectedDate);
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const formattedFirstDay = firstDay.toISOString().split('T')[0];

            setFilters(prev => ({
                ...prev,
                fecha_inicio: formattedFirstDay,
                fecha_fin: selectedDate
            }));
        }
    }, [isOpen, selectedDate]);

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

    const handleInputChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleExport = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await exportMovimientosToExcel(filters);
            onClose();
        } catch (error) {
            alert('Error al exportar los datos. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-tourism-teal text-white">
                    <div className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        <h2 className="text-lg font-semibold">Exportar a Excel</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleExport} className="p-6 space-y-5">
                    {/* Rango de Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-tourism-teal" />
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={filters.fecha_inicio}
                                onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent outline-none text-sm transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-tourism-teal" />
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={filters.fecha_fin}
                                onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent outline-none text-sm transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Inmueble */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Home className="h-4 w-4 text-tourism-teal" />
                            Inmueble (Opcional)
                        </label>
                        {loadingInmuebles ? (
                            <div className="h-10 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
                                <SimpleSpinner size="sm" />
                            </div>
                        ) : (
                            <select
                                value={filters.id_inmueble}
                                onChange={(e) => handleInputChange('id_inmueble', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent outline-none text-sm transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Todos los inmuebles</option>
                                {inmuebles.map((inmueble) => (
                                    <option key={inmueble.id} value={inmueble.id}>
                                        {inmueble.nombre}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Tipo */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-tourism-teal" />
                            Tipo de Movimiento
                        </label>
                        <select
                            value={filters.tipo}
                            onChange={(e) => handleInputChange('tipo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tourism-teal focus:border-transparent outline-none text-sm transition-all appearance-none cursor-pointer"
                        >
                            <option value="todos">Todos los tipos</option>
                            <option value="ingreso">Ingreso</option>
                            <option value="egreso">Egreso</option>
                            <option value="deducible">Deducible</option>
                        </select>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
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
                            className="flex-1 bg-tourism-teal hover:bg-tourism-teal/90"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <SimpleSpinner size="sm" />
                                    <span>Procesando...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Download className="h-4 w-4" />
                                    <span>Descargar Excel</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExportMovimientosModal;
