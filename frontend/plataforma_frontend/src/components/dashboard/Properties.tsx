/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import InmueblesTable, { IDataInmuebleIn as TableInmueble } from './InmueblesTable';
import InmuebleDetailModal from './InmuebleDetailModal';
import CreateInmuebleModal from './CreateInmuebleModal';
import CreatePropertyButton from './CreatePropertyButton';
import SuccessModal from './SuccessModal';
import ConfirmModal from './ConfirmModal';
import { getInmueblesApi } from '../../auth/getInmueblesApi';
import { getInmuebleDetalleApi } from '../../auth/getInmuebleDetalleApi';
import { createInmuebleApi } from '../../auth/createInmuebleApi';
import { editInmuebleApi } from '../../auth/editInmuebleApi';
import { deleteInmuebleApi } from '../../auth/deleteInmuebleApi';
import { useAuth } from '../../auth/AuthContext';
import { IInmuebleForm, IInmueble } from '../../interfaces/Inmueble';

const Properties: React.FC = () => {
  const [inmuebles, setInmuebles] = useState<TableInmueble[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [inmuebleToEdit, setInmuebleToEdit] = useState<TableInmueble | null>(null);
  const [inmuebleToDelete, setInmuebleToDelete] = useState<TableInmueble | null>(null);
  const [inmuebleToView, setInmuebleToView] = useState<IInmueble | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const canCreate = user?.permisos?.includes('crear_inmuebles') || true; // TEMPORAL: siempre true para debugging
  const canEdit = user?.permisos?.includes('editar_inmuebles') || true; // TEMPORAL: siempre true para debugging
  const canDelete = user?.permisos?.includes('eliminar_inmuebles') || true; // TEMPORAL: siempre true para debugging

  console.log('=== PROPERTIES DEBUG ===');
  console.log('user:', user);
  console.log('user permisos:', user?.permisos);
  console.log('canCreate:', canCreate);
  console.log('canEdit:', canEdit);
  console.log('canDelete:', canDelete);
  console.log('========================');

  useEffect(() => {
    getInmueblesApi()
      .then(setInmuebles)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (inmuebleData: IInmuebleForm) => {
    try {
      await createInmuebleApi(inmuebleData);
      setSuccessMsg('Inmueble creado exitosamente');
      setSuccessOpen(true);
      setModalOpen(false);
      // Refrescar la lista de inmuebles
      const updatedInmuebles = await getInmueblesApi();
      setInmuebles(updatedInmuebles);
    } catch (e) {
      alert(e || 'Error al crear inmueble');
    }
  };

  const handleEdit = (inmueble: TableInmueble) => {
    if (!canEdit) return;
    setInmuebleToEdit(inmueble);
    setEditModalOpen(true);
  };

  const handleViewDetail = (inmueble: TableInmueble) => {
    handleViewDetailWithApi(inmueble.id);
  };

  const handleViewDetailWithApi = async (inmuebleId: string) => {
    try {
      console.log('🔍 Fetching inmueble detail for ID:', inmuebleId);

      // Obtener detalle del inmueble desde la API externa directamente
      const inmuebleDetalle = await getInmuebleDetalleApi(inmuebleId);
      setInmuebleToView(inmuebleDetalle);
      setDetailModalOpen(true);

      console.log('✅ Inmueble detail loaded successfully');
    } catch (error) {
      console.error('❌ Error getting inmueble detail:', error);
      alert(error instanceof Error ? error.message : 'Error al obtener detalle del inmueble');
    }
  };

  const handleEditSubmit = async (inmuebleData: IInmuebleForm) => {
    if (!inmuebleToEdit) return;

    try {
      const response = await editInmuebleApi({
        id: inmuebleToEdit.id,
        ...inmuebleData
      });

      if (response.success) {
        setSuccessMsg('Inmueble actualizado exitosamente');
        setSuccessOpen(true);
        setEditModalOpen(false);
        setInmuebleToEdit(null);

        // Actualizar la lista local de inmuebles
        setInmuebles(prev => prev.map(inmueble =>
          inmueble.id === inmuebleToEdit.id
            ? { ...inmueble, ...inmuebleData }
            : inmueble
        ));
      } else {
        alert(response.message || 'Error al actualizar inmueble');
      }
    } catch (e) {
      alert(e || 'Error al actualizar inmueble');
    }
  };

  const handleDelete = (inmueble: TableInmueble) => {
    if (!canDelete) return;
    setInmuebleToDelete(inmueble);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!inmuebleToDelete) return;
    setConfirmDeleteOpen(false);

    try {
      const response = await deleteInmuebleApi(inmuebleToDelete.id);

      if (response.success) {
        setSuccessMsg('Inmueble eliminado exitosamente');
        setSuccessOpen(true);

        // Remover el inmueble de la lista local
        setInmuebles(prev => prev.filter(inmueble => inmueble.id !== inmuebleToDelete.id));
      } else {
        setSuccessMsg(response.message || 'Error eliminando inmueble');
        setSuccessOpen(true);
      }
    } catch (e) {
      setSuccessMsg('Error eliminando inmueble');
      setSuccessOpen(true);
    }

    setInmuebleToDelete(null);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Propiedades</h2>
        <CreatePropertyButton
          onClick={() => canCreate && setModalOpen(true)}
          disabled={!canCreate}
        />
      </div>
      {loading ? (
        <div className="text-center py-8">Cargando inmuebles...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <InmueblesTable
          inmuebles={inmuebles}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
        />
      )}
      <CreateInmuebleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
      <CreateInmuebleModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setInmuebleToEdit(null);
        }}
        onCreate={handleEditSubmit}
        initialData={inmuebleToEdit ? {
          nombre: inmuebleToEdit.nombre,
          direccion: inmuebleToEdit.direccion,
          ciudad: inmuebleToEdit.ciudad,
          edificio: inmuebleToEdit.edificio,
          apartamento: inmuebleToEdit.apartamento,
          comision: inmuebleToEdit.comision,
          id_propietario: inmuebleToEdit.id_propietario,
          // precio: inmuebleToEdit.precio, // Removed because 'precio' is not in IInmuebleForm
          precio_limpieza: inmuebleToEdit.precio_limpieza,
          id_producto_sigo: inmuebleToEdit.id_producto_sigo,
          descripcion: inmuebleToEdit.descripcion,
          capacidad_maxima: inmuebleToEdit.capacidad_maxima,
          habitaciones: inmuebleToEdit.habitaciones,
          banos: inmuebleToEdit.banos,
          tiene_cocina: inmuebleToEdit.tiene_cocina,
          id_empresa: inmuebleToEdit.id_empresa
        } : undefined}
        isEdit={true}
      />
      <ConfirmModal
        open={confirmDeleteOpen}
        message={`¿Estás seguro de que deseas eliminar el inmueble "${inmuebleToDelete?.nombre || ''}"?`}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setInmuebleToDelete(null);
        }}
      />
      <SuccessModal open={successOpen} message={successMsg} onClose={() => setSuccessOpen(false)} />
      <InmuebleDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setInmuebleToView(null);
        }}
        inmueble={inmuebleToView}
      />
    </div>
  );
};

export default Properties;
