import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { 
  getHuespedesApi, 
  createHuespedApi, 
  editHuespedApi, 
  getHuespedDetalleApi 
} from '../../auth/huespedesApi';
import { IHuespedTableData, IHuespedDetailData } from '../../interfaces/Huesped';
import HuespedesTable from './HuespedesTable';
import CreateHuespedButton from './CreateHuespedButton';
import CreateHuespedModal from './CreateHuespedModal';
import HuespedDetailModal from './HuespedDetailModal';
import { Spinner } from '../atoms/Spinner';

const Guests: React.FC = () => {
  const { user } = useAuth();
  const [huespedes, setHuespedes] = useState<IHuespedTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingHuesped, setEditingHuesped] = useState<IHuespedTableData | null>(null);
  const [selectedHuespedDetail, setSelectedHuespedDetail] = useState<IHuespedDetailData | null>(null);

  // Permisos
  const canCreateHuespedes = user?.permisos?.includes('crear_huespedes') || user?.role === 'superadmin';
  const canEditHuespedes = user?.permisos?.includes('editar_huespedes') || user?.role === 'superadmin';

  // Cargar huéspedes
  const loadHuespedes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Temporal: usar empresa 1 como en Propietarios
      const data = await getHuespedesApi(1);
      setHuespedes(data);
    } catch (err) {
      console.error('Error al cargar huéspedes:', err);
      setError('Error al cargar la lista de huéspedes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHuespedes();
  }, [user]);

  // Crear huésped
  const handleCreateHuesped = async (huespedData: any) => {
    try {
      const dataToSend = {
        ...huespedData,
        id_empresa: 1, // Temporal: usar empresa 1
        estado: 'activo' as const
      };

      await createHuespedApi(dataToSend);
      await loadHuespedes();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error al crear huésped:', err);
      throw err;
    }
  };

  // Editar huésped
  const handleEditHuesped = async (huespedData: any) => {
    if (!editingHuesped) return;

    try {
      await editHuespedApi(editingHuesped.id_huesped, huespedData);
      await loadHuespedes();
      setEditingHuesped(null);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error al editar huésped:', err);
      throw err;
    }
  };

  // Abrir modal de edición
  const handleOpenEditModal = (huesped: IHuespedTableData) => {
    setEditingHuesped(huesped);
    setShowCreateModal(true);
  };

  // Ver detalle del huésped
  const handleViewDetail = async (huesped: IHuespedTableData) => {
    try {
      const detailData = await getHuespedDetalleApi(huesped.id_huesped);
      setSelectedHuespedDetail(detailData);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error al obtener detalle del huésped:', err);
      setError('Error al cargar el detalle del huésped');
    }
  };

  // Cerrar modales
  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setEditingHuesped(null);
    setSelectedHuespedDetail(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex-1 sm:flex lg:flex space-y-3 md:space-y-0 justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Huéspedes</h2>
          <p className="text-gray-600 mt-1">Gestión de huéspedes y sus datos</p>
        </div>
        
        <CreateHuespedButton
          onClick={() => setShowCreateModal(true)}
          disabled={!canCreateHuespedes}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <HuespedesTable
        huespedes={huespedes}
        onEdit={handleOpenEditModal}
        onViewDetail={handleViewDetail}
        canEdit={canEditHuespedes}
      />

      <CreateHuespedModal
        open={showCreateModal}
        onClose={handleCloseModals}
        onCreate={editingHuesped ? handleEditHuesped : handleCreateHuesped}
        initialData={editingHuesped || undefined}
        isEdit={!!editingHuesped}
      />

      <HuespedDetailModal
        open={showDetailModal}
        onClose={handleCloseModals}
        huesped={selectedHuespedDetail}
      />
    </div>
  );
};

export default Guests;
