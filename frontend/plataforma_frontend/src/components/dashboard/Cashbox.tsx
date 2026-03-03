import React, { useState, useEffect } from 'react';
import DateSelector from './DateSelector';
import DailySummary from './DailySummary';
import MovimientosTable from './MovimientosTable';
import CreateMovimientoButton from './CreateMovimientoButton';
import ExportExcelButton from './ExportExcelButton';
import CreateMovimientoModal from './CreateMovimientoModal';
import ExportMovimientosModal from './ExportMovimientosModal';
import MovimientoDetailModal from './MovimientoDetailModal';
import ConfirmModal from './ConfirmModal';
import SuccessModal from './SuccessModal';
import { IMovimiento, IResumenDiario } from '../../interfaces/Movimiento';
import {
  getMovimientosByFecha,
  getResumenDiario,
  deleteMovimiento
} from '../../auth/movimientosApi';
import { getInmueblesApi } from '../../auth/getInmueblesApi';
import { IInmueble } from '../../interfaces/Inmueble';
import { PLATAFORMAS_ORIGEN, PlataformaOrigen } from '../../constants/plataformas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const Cashbox: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });
  const [movimientos, setMovimientos] = useState<IMovimiento[]>([]);
  const [selectedPlataforma, setSelectedPlataforma] = useState<PlataformaOrigen | 'todas'>('todas');
  const [selectedInmueble, setSelectedInmueble] = useState<string>('todos');
  const [inmuebles, setInmuebles] = useState<IInmueble[]>([]);
  const [resumen, setResumen] = useState<IResumenDiario | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Selected items
  const [selectedMovimiento, setSelectedMovimiento] = useState<IMovimiento | null>(null);
  const [movimientoToDelete, setMovimientoToDelete] = useState<IMovimiento | null>(null);

  // Success message
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedPlataforma, selectedInmueble]);

  useEffect(() => {
    const fetchInmuebles = async () => {
      try {
        const data = await getInmueblesApi();
        setInmuebles(data);
      } catch (error) {
        console.error('Error fetching inmuebles:', error);
      }
    };
    fetchInmuebles();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Determinar si hay un filtro de plataforma aplicado
      const plataformaFiltro = selectedPlataforma !== 'todas' ? selectedPlataforma : undefined;
      const inmuebleFiltro = selectedInmueble !== 'todos' ? selectedInmueble : undefined;

      const [movimientosResponse, resumenResponse] = await Promise.all([
        getMovimientosByFecha(selectedDate, plataformaFiltro, inmuebleFiltro),
        getResumenDiario(selectedDate)
      ]);

      if (movimientosResponse.success && Array.isArray(movimientosResponse.data)) {
        setMovimientos(movimientosResponse.data);
      }

      if (resumenResponse.success && resumenResponse.data) {
        setResumen(resumenResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handlePlataformaChange = (plataforma: PlataformaOrigen | 'todas') => {
    setSelectedPlataforma(plataforma);
  };

  const handleCreateMovimiento = () => {
    setSelectedMovimiento(null);
    setShowCreateModal(true);
  };

  const handleEditMovimiento = (movimiento: IMovimiento) => {
    setSelectedMovimiento(movimiento);
    setShowCreateModal(true);
  };

  const handleViewMovimiento = (movimiento: IMovimiento) => {
    setSelectedMovimiento(movimiento);
    setShowDetailModal(true);
  };

  const handleDeleteMovimiento = (movimiento: IMovimiento) => {
    setMovimientoToDelete(movimiento);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!movimientoToDelete) return;

    try {
      const response = await deleteMovimiento(movimientoToDelete.id);
      if (response.success) {
        setSuccessMessage('Movimiento eliminado exitosamente');
        setShowSuccessModal(true);
        await loadData(); // Reload data
      } else {
        alert(response.message || 'Error al eliminar movimiento');
      }
    } catch (error) {
      console.error('Error deleting movimiento:', error);
      alert('Error al eliminar movimiento');
    } finally {
      setShowConfirmModal(false);
      setMovimientoToDelete(null);
    }
  };

  const handleModalSuccess = async () => {
    setSuccessMessage(selectedMovimiento ? 'Movimiento actualizado exitosamente' : 'Movimiento creado exitosamente');
    setShowSuccessModal(true);
    await loadData(); // Reload data
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex-1 sm:flex lg:flex space-y-3 md:space-y-0 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tourism-navy dark:text-white">Caja Diaria</h1>
          <p className="text-gray-600 dark:text-white">Gestión de movimientos de ingresos y egresos</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportExcelButton onClick={() => setShowExportModal(true)} />
          <CreateMovimientoButton onClick={handleCreateMovimiento} />
        </div>
      </div>

      {/* Date Selector */}
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* Filtros */}
      <div className="bg-white dark:bg-card p-4 rounded-[1rem] shadow-sm border border-gray-100 dark:border-border mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-sm font-medium text-tourism-navy dark:text-foreground">
            Filtrar por plataforma:
          </label>
          <Select
            value={selectedPlataforma}
            onValueChange={(value) => handlePlataformaChange(value as PlataformaOrigen | 'todas')}
          >
            <SelectTrigger className="w-full sm:w-[260px] border-gray-200 dark:border-border bg-white dark:bg-muted/40 text-gray-700 dark:text-gray-200 focus:ring-tourism-teal focus:border-tourism-teal">
              <SelectValue placeholder="Todas las plataformas" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-card border-gray-100 dark:border-border shadow-md">
              <SelectItem value="todas" className="focus:bg-gray-50 dark:focus:bg-muted/50 focus:text-tourism-teal dark:focus:text-tourism-teal cursor-pointer">Todas las plataformas</SelectItem>
              {PLATAFORMAS_ORIGEN.map((plataforma) => (
                <SelectItem key={plataforma.value} value={plataforma.value} className="focus:bg-gray-50 dark:focus:bg-muted/50 focus:text-tourism-teal dark:focus:text-tourism-teal cursor-pointer">
                  {plataforma.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPlataforma !== 'todas' && (
            <span className="text-sm text-gray-500 dark:text-muted-foreground mt-2 sm:mt-0">
              Mostrando solo movimientos de {PLATAFORMAS_ORIGEN.find(p => p.value === selectedPlataforma)?.label}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 pt-4 border-t border-gray-50 dark:border-border/50">
          <label className="text-sm font-medium text-tourism-navy dark:text-foreground">
            Filtrar por inmueble:
          </label>
          <Select
            value={selectedInmueble}
            onValueChange={(value) => setSelectedInmueble(value)}
          >
            <SelectTrigger className="w-full sm:w-[260px] border-gray-200 dark:border-border bg-white dark:bg-muted/40 text-gray-700 dark:text-gray-200 focus:ring-tourism-teal focus:border-tourism-teal">
              <SelectValue placeholder="Todos los inmuebles" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-card border-gray-100 dark:border-border shadow-md">
              <SelectItem value="todos" className="focus:bg-gray-50 dark:focus:bg-muted/50 focus:text-tourism-teal dark:focus:text-tourism-teal cursor-pointer">Todos los inmuebles</SelectItem>
              {inmuebles.map((inmueble) => (
                <SelectItem key={inmueble.id_inmueble || (inmueble as any).id} value={(inmueble.id_inmueble || (inmueble as any).id).toString()} className="focus:bg-gray-50 dark:focus:bg-muted/50 focus:text-tourism-teal dark:focus:text-tourism-teal cursor-pointer">
                  {inmueble.nombre} {inmueble.tipo_registro === 'edificio' ? '(Proyecto)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Daily Summary */}
      <DailySummary
        resumen={resumen}
        loading={loading}
      />

      {/* Movements Table */}
      <MovimientosTable
        movimientos={movimientos}
        loading={loading}
        onView={handleViewMovimiento}
        onEdit={handleEditMovimiento}
        onDelete={handleDeleteMovimiento}
      />

      {/* Modals */}
      <CreateMovimientoModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedMovimiento(null);
        }}
        onSuccess={handleModalSuccess}
        movimiento={selectedMovimiento}
        selectedDate={selectedDate}
      />

      <ExportMovimientosModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedDate={selectedDate}
      />

      <MovimientoDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMovimiento(null);
        }}
        movimiento={selectedMovimiento}
      />

      <ConfirmModal
        open={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setMovimientoToDelete(null);
        }}
        onConfirm={confirmDelete}
        message={`¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer.`}
      />

      <SuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </div>
  );
};

export default Cashbox;
