import React, { useState, useEffect } from 'react';
import DateSelector from './DateSelector';
import DailySummary from './DailySummary';
import MovimientosTable from './MovimientosTable';
import CreateMovimientoButton from './CreateMovimientoButton';
import CreateMovimientoModal from './CreateMovimientoModal';
import MovimientoDetailModal from './MovimientoDetailModal';
import ConfirmModal from './ConfirmModal';
import SuccessModal from './SuccessModal';
import { IMovimiento, IResumenDiario } from '../../interfaces/Movimiento';
import {
  getMovimientosByFecha,
  getResumenDiario,
  deleteMovimiento
} from '../../auth/movimientosApi';
import { PLATAFORMAS_ORIGEN, PlataformaOrigen } from '../../constants/plataformas';

const Cashbox: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });
  const [movimientos, setMovimientos] = useState<IMovimiento[]>([]);
  const [selectedPlataforma, setSelectedPlataforma] = useState<PlataformaOrigen | 'todas'>('todas');
  const [resumen, setResumen] = useState<IResumenDiario | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Selected items
  const [selectedMovimiento, setSelectedMovimiento] = useState<IMovimiento | null>(null);
  const [movimientoToDelete, setMovimientoToDelete] = useState<IMovimiento | null>(null);

  // Success message
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedPlataforma]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Determinar si hay un filtro de plataforma aplicado
      const plataformaFiltro = selectedPlataforma !== 'todas' ? selectedPlataforma : undefined;

      const [movimientosResponse, resumenResponse] = await Promise.all([
        getMovimientosByFecha(selectedDate, plataformaFiltro),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tourism-navy">Caja Diaria</h1>
          <p className="text-gray-600">Gestión de movimientos de ingresos y egresos</p>
        </div>
        <CreateMovimientoButton onClick={handleCreateMovimiento} />
      </div>

      {/* Date Selector */}
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Filtrar por plataforma:
          </label>
          <select
            value={selectedPlataforma}
            onChange={(e) => handlePlataformaChange(e.target.value as PlataformaOrigen | 'todas')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal focus:border-transparent text-sm"
          >
            <option value="todas">Todas las plataformas</option>
            {PLATAFORMAS_ORIGEN.map((plataforma) => (
              <option key={plataforma.value} value={plataforma.value}>
                {plataforma.label}
              </option>
            ))}
          </select>
          {selectedPlataforma !== 'todas' && (
            <span className="text-sm text-gray-500">
              Mostrando solo movimientos de {PLATAFORMAS_ORIGEN.find(p => p.value === selectedPlataforma)?.label}
            </span>
          )}
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
