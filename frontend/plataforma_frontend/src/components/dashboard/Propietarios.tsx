/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropietariosTable from './PropietariosTable';
import CreatePropietarioModal from './CreatePropietarioModal';
import CreatePropietarioButton from './CreatePropietarioButton';
import PropietarioDetailModal from './PropietarioDetailModal';
import InmuebleDetailModal from './InmuebleDetailModal';
import SuccessModal from './SuccessModal';
import ConfirmModal from './ConfirmModal';
import { useAuth } from '../../auth/AuthContext';
import { IPropietarioForm, IPropietarioTableData } from '../../interfaces/Propietario';
import { 
  getPropietariosApi, 
  createPropietarioApi, 
  editPropietarioApi, 
  deletePropietarioApi,
  getInmueblesPropietarioApi,
  getInmuebleDetalleApi
} from '../../auth/propietariosApi';

const Propietarios: React.FC = () => {
  const [propietarios, setPropietarios] = useState<IPropietarioTableData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [propietarioDetailOpen, setPropietarioDetailOpen] = useState(false);
  const [inmuebleDetailOpen, setInmuebleDetailOpen] = useState(false);
  const [propietarioToEdit, setPropietarioToEdit] = useState<IPropietarioTableData | null>(null);
  const [propietarioToDelete, setPropietarioToDelete] = useState<IPropietarioTableData | null>(null);
  const [propietarioToView, setPropietarioToView] = useState<IPropietarioTableData | null>(null);
  const [propietarioInmuebles, setPropietarioInmuebles] = useState<Array<{ id: string; nombre: string; direccion: string; tipo: string }>>([]);
  const [inmuebleToView, setInmuebleToView] = useState<any>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const canCreate = user?.permisos?.includes('crear_propietarios') || true; // TEMPORAL: siempre true para debugging
  const canEdit = user?.permisos?.includes('editar_propietarios') || true; // TEMPORAL: siempre true para debugging
  const canDelete = user?.permisos?.includes('eliminar_propietarios') || true; // TEMPORAL: siempre true para debugging

  console.log('=== PROPIETARIOS DEBUG ===');
  console.log('user:', user);
  console.log('user permisos:', user?.permisos);
  console.log('canCreate:', canCreate);
  console.log('canEdit:', canEdit);
  console.log('canDelete:', canDelete);
  console.log('============================');

  useEffect(() => {
    const loadPropietarios = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener propietarios de la API
        const data = await getPropietariosApi(1); // Temporal: usar empresa 1
        setPropietarios(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar propietarios');
        console.error('Error loading propietarios:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPropietarios();
  }, [user]);

  const handleCreate = async (propietarioData: IPropietarioForm) => {
    try {
      // Crear propietario usando API
      const newPropietario = await createPropietarioApi(propietarioData);
      
      setPropietarios(prev => [...prev, newPropietario]);
      setSuccessMsg('Propietario creado exitosamente');
      setSuccessOpen(true);
      setModalOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear propietario';
      setError(errorMessage);
      console.error('Error creating propietario:', error);
    }
  };

  const handleEdit = (propietario: IPropietarioTableData) => {
    if (!canEdit) return;
    setPropietarioToEdit(propietario);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (propietarioData: IPropietarioForm) => {
    if (!propietarioToEdit) return;
    
    try {
      // Actualizar propietario usando API
      const updatedPropietario = await editPropietarioApi(propietarioToEdit.id, propietarioData);
      
      setPropietarios(prev => prev.map(propietario => 
        propietario.id === propietarioToEdit.id 
          ? updatedPropietario
          : propietario
      ));
      
      setSuccessMsg('Propietario actualizado exitosamente');
      setSuccessOpen(true);
      setEditModalOpen(false);
      setPropietarioToEdit(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar propietario';
      setError(errorMessage);
      console.error('Error updating propietario:', error);
    }
  };

  const handleDelete = (propietario: IPropietarioTableData) => {
    if (!canDelete) return;
    setPropietarioToDelete(propietario);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!propietarioToDelete) return;
    setConfirmDeleteOpen(false);
    
    try {
      // Eliminar propietario usando API
      await deletePropietarioApi(propietarioToDelete.id);
      
      setPropietarios(prev => prev.filter(propietario => propietario.id !== propietarioToDelete.id));
      setSuccessMsg('Propietario eliminado exitosamente');
      setSuccessOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar propietario';
      setSuccessMsg(errorMessage);
      setSuccessOpen(true);
      console.error('Error deleting propietario:', error);
    }
    
    setPropietarioToDelete(null);
  };

  const handleViewDetail = async (propietario: IPropietarioTableData) => {
    setPropietarioToView(propietario);
    
    // Cargar inmuebles del propietario
    try {
      const inmuebles = await getInmueblesForPropietario(propietario);
      setPropietarioInmuebles(inmuebles);
    } catch (error) {
      console.error('Error loading inmuebles for propietario:', error);
      setPropietarioInmuebles([]);
    }
    
    setPropietarioDetailOpen(true);
  };

  const handleInmuebleClick = async (inmuebleId: string) => {
    try {
      // Obtener detalle del inmueble desde la API
      const inmueble = await getInmuebleDetalleApi(inmuebleId);
      setInmuebleToView(inmueble);
      setInmuebleDetailOpen(true);
    } catch (error) {
      console.error('Error getting inmueble detail:', error);
      setError(error instanceof Error ? error.message : 'Error al obtener detalle del inmueble');
    }
  };

  const getInmueblesForPropietario = async (propietario: IPropietarioTableData) => {
    try {
      // Obtener inmuebles del propietario desde la API
      const inmuebles = await getInmueblesPropietarioApi(propietario.id);
      return inmuebles.map((inmueble: any) => ({
        id: inmueble.id,
        nombre: inmueble.nombre,
        direccion: inmueble.direccion,
        tipo: inmueble.tipo
      }));
    } catch (error) {
      console.error('Error getting inmuebles for propietario:', error);
      return [];
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Propietarios</h2>
        <CreatePropietarioButton
          onClick={() => canCreate && setModalOpen(true)}
          disabled={!canCreate}
        />
      </div>
      {loading ? (
        <div className="text-center py-8">Cargando propietarios...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <PropietariosTable 
          propietarios={propietarios} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
          onInmuebleClick={handleInmuebleClick}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}
      
      <CreatePropietarioModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onCreate={handleCreate} 
      />
      
      <CreatePropietarioModal 
        open={editModalOpen} 
        onClose={() => {
          setEditModalOpen(false);
          setPropietarioToEdit(null);
        }} 
        onCreate={handleEditSubmit}
        initialData={propietarioToEdit ? {
          nombre: propietarioToEdit.nombre,
          apellido: propietarioToEdit.apellido,
          email: propietarioToEdit.email,
          telefono: propietarioToEdit.telefono,
          direccion: propietarioToEdit.direccion,
          cedula: propietarioToEdit.cedula,
          estado: propietarioToEdit.estado,
          id_empresa: propietarioToEdit.id_empresa
        } : undefined}
        isEdit={true}
      />
      
      <ConfirmModal
        open={confirmDeleteOpen}
        message={`¿Estás seguro de que deseas eliminar al propietario "${propietarioToDelete?.nombre || ''} ${propietarioToDelete?.apellido || ''}"?`}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setPropietarioToDelete(null);
        }}
      />
      
      <SuccessModal 
        open={successOpen} 
        message={successMsg} 
        onClose={() => setSuccessOpen(false)} 
      />

      <PropietarioDetailModal
        open={propietarioDetailOpen}
        onClose={() => {
          setPropietarioDetailOpen(false);
          setPropietarioToView(null);
          setPropietarioInmuebles([]);
        }}
        propietario={propietarioToView}
        inmuebles={propietarioInmuebles}
        onInmuebleClick={handleInmuebleClick}
      />

      <InmuebleDetailModal
        open={inmuebleDetailOpen}
        onClose={() => {
          setInmuebleDetailOpen(false);
          setInmuebleToView(null);
        }}
        inmueble={inmuebleToView}
      />
    </div>
  );
};

export default Propietarios;
