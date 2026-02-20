/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useMemo, useEffect } from 'react';
import ReservasTable from './ReservasTable';
import CreateReservaModal from './CreateReservaModal';
import CreateReservaButton from './CreateReservaButton';
import ReservaDetailModal from './ReservaDetailModal';
import HuespedesListModal from './HuespedesListModal';
import PagosModal from './PagosModal';
import TarjetaModal from './TarjetaModal';
import SuccessModal from './SuccessModal';
import ConfirmModal from './ConfirmModal';
import MonthSelector from './MonthSelector'
import InmuebleSelector from './InmuebleSelector';

import { useInmuebleSelector } from '../../hooks/useInmuebleSelector';
import { useAuth } from '../../auth/AuthContext';
import { IReservaForm, IReservaTableData, IHuesped } from '../../interfaces/Reserva';
import { Inmueble } from '../../interfaces/Inmueble';
import { IPago } from '../../interfaces/Pago';
import {
  createReservaApi,
  editReservaApi,
  deleteReservaApi
} from '../../auth/reservasApi';
import { getEstadoTarjetaApi, sendTarjetaApi } from '../../auth/tarjetaRegistroApi';
import { useReservasConTotales } from '../../hooks/useReservasConTotales';
import { IEstadoTarjetaResponse, IPayloadTarjeta } from '@libs/interfaces/Tarjeta';



const Bookings: React.FC = () => {
  // Hook personalizado para manejar reservas con totales automáticos
  const {
    reservas,
    loading,
    error,
    actualizarTotalesReserva,
    actualizarReservaEnLista,
    eliminarReservaDeLista,
    agregarReservaALista,
    refrescarReservas,
    loadReservas
  } = useReservasConTotales();

  // Estados locales para modales
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [huespedesModalOpen, setHuespedesModalOpen] = useState(false);
  const [pagosModalOpen, setPagosModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [reservaToEdit, setReservaToEdit] = useState<IReservaTableData | null>(null);
  const [reservaToDelete, setReservaToDelete] = useState<IReservaTableData | null>(null);
  const [reservaToView, setReservaToView] = useState<IReservaTableData | null>(null);
  const [reservaToViewHuespedes, setReservaToViewHuespedes] = useState<IReservaTableData | null>(null);
  const [reservaToViewPagos, setReservaToViewPagos] = useState<IReservaTableData | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(-1);
  const [tarjetas, setTarjetas] = useState<IEstadoTarjetaResponse[]>([]);
  const [reservaToViewTarjeta, setReservaToViewTarjeta] = useState<IReservaTableData | null>(null);
  const [tarjetaModalOpen, setTarjetaModalOpen] = useState(false);
  const [reservaError, setReservaError] = useState<string | null>(null);

  // Inmuebles
  const { inmuebles } = useInmuebleSelector();
  const [selectedInmueble, setSelectedInmueble] = useState<number>(-1);



  const { user } = useAuth();
  const canCreate = user?.permisos?.includes('crear_reservas') || true; // TEMPORAL: siempre true para debugging
  const canEdit = user?.permisos?.includes('editar_reservas') || true; // TEMPORAL: siempre true para debugging
  const canDelete = user?.permisos?.includes('eliminar_reservas') || true; // TEMPORAL: siempre true para debugging

  const filteredReservas = useMemo(() => {
    return reservas.filter(reserva => {
      // Filtro por mes
      if (selectedMonth !== -1) {
        const fechaInicio = new Date(reserva.fecha_inicio);
        const fechaFin = new Date(reserva.fecha_fin);
        const pasaFiltroMes = fechaInicio.getMonth() === selectedMonth || fechaFin.getMonth() === selectedMonth;
        if (!pasaFiltroMes) return false;
      }
      // Filtro por inmueble
      if (selectedInmueble !== -1) {
        if (Number(reserva.id_inmueble) !== selectedInmueble) return false;
      }
      return true;
    });
  }, [reservas, selectedMonth, selectedInmueble]);

  const handleCreate = async (reservaData: IReservaForm) => {
    try {
      setReservaError(null);
      const newReserva = await createReservaApi(reservaData);
      agregarReservaALista(newReserva);
      setSuccessMsg('Reserva creada exitosamente');
      setSuccessOpen(true);
      setModalOpen(false);
    } catch (error) {
      console.error('Error creando reserva:', error);
      let msg = error instanceof Error ? error.message : 'Error al crear reserva';

      // Intentar farmatear si es JSON
      try {
        const parsed = JSON.parse(msg);
        if (parsed.message) msg = parsed.message;
      } catch (e) {
        // No es JSON, usar mensaje original
      }

      if (msg.includes('ocupadas') || msg.includes('traslap') || msg.includes('disponibilidad')) {
        setReservaError(msg);
      } else {
        alert(msg);
      }
    }
  };

  const handleEdit = (reserva: IReservaTableData) => {
    if (!canEdit) return;
    setReservaToEdit(reserva);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (reservaData: IReservaForm) => {
    if (!reservaToEdit) return;

    // Helper para formatear fechas a YYYY-MM-DD
    // Helper para formatear fechas a YYYY-MM-DD
    const toDateApi = (date?: string) => {
      if (!date) return '';
      // Si ya está en formato YYYY-MM-DD, devolver igual
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
      return new Date(date).toISOString().slice(0, 10);
    };

    // Preparar huéspedes con fecha_nacimiento en formato correcto
    // Solo si vienen huéspedes (el modal los omite cuando están todos vacíos)
    const huespedes = reservaData.huespedes
      ? reservaData.huespedes.map(h => ({
        ...h,
        id: h.id, // Asegurar que el ID se envíe
        fecha_nacimiento: toDateApi(h.fecha_nacimiento)
      }))
      : undefined;

    try {
      setReservaError(null);
      // Usar los campos correctos para el backend
      // Si no hay huéspedes con datos, omitir el campo para evitar error de validación
      const body: any = {
        ...reservaData,
        fecha_inicio: reservaData.fecha_inicio,
        fecha_fin: reservaData.fecha_fin,
        id: reservaToEdit.id,
        codigo_reserva: reservaToEdit.codigo_reserva,
        fecha_creacion: reservaToEdit.fecha_creacion,
        estado: reservaData.estado,
        ...(huespedes !== undefined ? { huespedes } : {}),
      };
      const updatedReserva = await editReservaApi(body);

      actualizarReservaEnLista(updatedReserva);

      setSuccessMsg('Reserva actualizada exitosamente');
      setSuccessOpen(true);
      setEditModalOpen(false);
      setReservaToEdit(null);
    } catch (error) {
      console.error('Error editando reserva:', error);
      let msg = error instanceof Error ? error.message : 'Error al actualizar reserva';

      // Intentar farmatear si es JSON
      try {
        const parsed = JSON.parse(msg);
        if (parsed.message) msg = parsed.message;
      } catch (e) {
        // No es JSON, usar mensaje original
      }

      if (msg.includes('ocupadas') || msg.includes('traslap') || msg.includes('disponibilidad')) {
        setReservaError(msg);
      } else {
        alert(msg);
      }
    }
  };

  const handleDelete = (reserva: IReservaTableData) => {
    if (!canDelete) return;
    setReservaToDelete(reserva);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reservaToDelete) return;
    setConfirmDeleteOpen(false);

    try {
      await deleteReservaApi(reservaToDelete.id);
      eliminarReservaDeLista(reservaToDelete.id);
      setSuccessMsg('Reserva eliminada exitosamente');
      setSuccessOpen(true);
    } catch (error) {
      console.error('Error eliminando reserva:', error);
      setSuccessMsg('Error eliminando reserva');
      setSuccessOpen(true);
    }

    setReservaToDelete(null);
  };

  const handleViewDetail = (reserva: IReservaTableData) => {
    setReservaToView(reserva);
    setDetailModalOpen(true);
  };

  const handleViewHuespedes = (reserva: IReservaTableData) => {
    setReservaToViewHuespedes(reserva);
    setHuespedesModalOpen(true);
  };

  const handleViewPagos = (reserva: IReservaTableData) => {
    setReservaToViewPagos(reserva);
    setPagosModalOpen(true);
  };

  const handleViewTarjeta = (reserva: IReservaTableData) => {
    setReservaToViewTarjeta(reserva);
    setTarjetaModalOpen(true);
  };



  useEffect(() => {
    const cargarEstados = async () => {
      if (filteredReservas.length === 0) return;

      try {
        // Obtenemos los estados de todas las reservas filtradas
        const promesas = filteredReservas.map(res => getEstadoTarjetaApi(res.id));
        const resultados = await Promise.all(promesas);

        // Aplanamos el array de arrays en uno solo
        const todasLasTarjetas = resultados.flat();
        setTarjetas(todasLasTarjetas);
      } catch (err) {
        console.error("Error cargando tarjetas", err);
      }
    };

    cargarEstados();
  }, [filteredReservas]);



  const handleTarjetaSubmit = async (idReserva: number) => {
    if (!reservaToViewTarjeta) return;

    try {
      const updatedTarjeta = await sendTarjetaApi(idReserva);

      setSuccessMsg('Tarjeta enviada a Mincit');
      setSuccessOpen(true);
      setTarjetaModalOpen(false);
      setReservaToViewTarjeta(updatedTarjeta);
    } catch (error) {
      console.error('Error al enviar tarjeta:', error);
      alert(error instanceof Error ? error.message : 'Error al enviar tarjeta');
    }
  };

  const handleTarjetaClose = () => {
    setTarjetaModalOpen(false);
    setReservaToViewTarjeta(null);
  };



  return (
    <div className="p-0 md:p-4 space-y-6">
      <div className="flex-1 md:flex space-y-4 md:space-y-0 justify-between items-center">
        <h2 className="text-xl font-bold">Gestión de Reservas</h2>
        <div className="flex items-center space-x-4">
          <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
          <InmuebleSelector
            inmuebles={inmuebles}
            selectedInmueble={selectedInmueble}
            setSelectedInmueble={setSelectedInmueble}
          />


          <CreateReservaButton
            onClick={() => {
              if (canCreate) {
                setReservaError(null);
                setModalOpen(true);
              }
            }}
            disabled={!canCreate}
          />
        </div>
      </div>

      {/* Tabla de reservas */}
      {loading ? (
        <div className="text-center py-8">Cargando reservas...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">
          {error}
          <button
            onClick={refrescarReservas}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <ReservasTable
          tarjetas={tarjetas}
          reservas={filteredReservas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
          onViewTarjeta={handleViewTarjeta}
          onViewHuespedes={handleViewHuespedes}
          onViewPagos={handleViewPagos}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      <CreateReservaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
        externalError={reservaError}
      />

      <CreateReservaModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setReservaToEdit(null);
          setReservaError(null);
        }}
        onCreate={handleEditSubmit}
        externalError={reservaError}
        initialData={reservaToEdit ? {
          id_inmueble: reservaToEdit.id_inmueble,
          fecha_inicio: reservaToEdit.fecha_inicio,
          fecha_fin: reservaToEdit.fecha_fin,
          numero_huespedes: reservaToEdit.numero_huespedes,
          huespedes: reservaToEdit.huespedes.map(huesped => ({
            id: huesped.id, // IMPORTANTE: Pasar el ID para edición
            nombre: huesped.nombre || '',
            apellido: huesped.apellido || '',
            email: huesped.email || '',
            telefono: huesped.telefono || '',
            documento_tipo: huesped.documento_tipo || 'cedula',
            documento_numero: huesped.documento_numero || '',
            fecha_nacimiento: huesped.fecha_nacimiento || '',
            es_principal: huesped.es_principal,
            motivo: huesped.motivo || '',        // ← antes faltaba este campo
            ciudad_residencia: huesped.ciudad_residencia || '',
            ciudad_procedencia: huesped.ciudad_procedencia || '',
          })),
          precio_total: reservaToEdit.precio_total,
          total_reserva: reservaToEdit.total_reserva,
          total_pagado: reservaToEdit.total_pagado,
          estado: reservaToEdit.estado, // Usar exactamente el valor recibido
          observaciones: reservaToEdit.observaciones || '',
          id_empresa: reservaToEdit.id_empresa
        } : undefined}
        isEdit={true}
      />

      <ReservaDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setReservaToView(null);
        }}
        reserva={reservaToView}
      />

      <HuespedesListModal
        open={huespedesModalOpen}
        onClose={() => {
          setHuespedesModalOpen(false);
          setReservaToViewHuespedes(null);
        }}
        huespedes={reservaToViewHuespedes?.huespedes || []}
        codigoReserva={reservaToViewHuespedes?.codigo_reserva || ''}
      />

      <PagosModal
        open={pagosModalOpen}
        onClose={() => {
          setPagosModalOpen(false);
          setReservaToViewPagos(null);
        }}
        reserva={reservaToViewPagos}
        onPagoCreated={(pago: IPago) => {
          // Actualizar automáticamente los totales de la reserva
          if (reservaToViewPagos) {
            actualizarTotalesReserva(reservaToViewPagos.id);
          }
        }}
        onPagoDeleted={(pagoId: number) => {
          // Actualizar automáticamente los totales de la reserva
          if (reservaToViewPagos) {
            actualizarTotalesReserva(reservaToViewPagos.id);
          }
        }}
      />

      <TarjetaModal
        open={tarjetaModalOpen}
        onClose={handleTarjetaClose}
        reserva={reservaToViewTarjeta}
        onSubmit={handleTarjetaSubmit}
      />

      <ConfirmModal
        open={confirmDeleteOpen}
        message={`¿Estás seguro de que deseas eliminar la reserva "${reservaToDelete?.codigo_reserva || ''}"?`}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setReservaToDelete(null);
        }}
      />

      <SuccessModal
        open={successOpen}
        message={successMsg}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
};

export default Bookings;
