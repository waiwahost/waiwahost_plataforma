
import React, { useMemo, useState, useEffect } from "react";
import { addDays, format, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "../atoms/Button";
import { Plus, Filter, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import CreateReservaModal from "./CreateReservaModal";
import CreateBloqueoModal from "./CreateBloqueoModal";
import ReservaDetailModal from "./ReservaDetailModal";
import { IReservaForm, IReservaTableData } from "../../interfaces/Reserva";
import { createReservaApi, getReservaDetalleApi, editReservaApi } from "../../auth/reservasApi";
import { IBloqueo } from "../../interfaces/Bloqueo";
import { deleteBloqueoApi } from "../../auth/bloqueosApi";

interface AvailabilityInmueble {
  id: string;
  nombre: string;
  ciudad?: string;
}

interface AvailabilityReserva {
  id: string;
  inmuebleId: string;
  start: string;
  end: string;
  estado?: string; // puede ser 'pendiente', 'confirmado', 'anulado', 'bloqueado' etc.
  tipo_bloqueo?: string;
  descripcion?: string;
}

// Función auxiliar para parsear fechas YYYY-MM-DD sin ajuste de zona horaria
// Crea la fecha como si fuera local a las 00:00:00
function parseDateNoTz(dateStr: string): Date {
  if (!dateStr) return new Date();
  // Asumimos formato YYYY-MM-DD
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return parseISO(dateStr);
}

// Genera un array de fechas entre dos fechas
function getDatesInRange(start: Date, end: Date) {
  const dates = [];
  let current = start;
  while (current <= end) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }
  return dates;
}

// Determina si un inmueble está ocupado en una fecha
function getReservaEnFecha(reservas: AvailabilityReserva[], inmuebleId: string, date: Date) {
  return reservas.find(r => {
    // Usar parseDateNoTz para evitar saltos de día por timezone
    const rStart = parseDateNoTz(r.start);
    const rEnd = parseDateNoTz(r.end);

    // Un día está ocupado si cae dentro del rango [start, end)
    // Normalmente check-out (end) no cuenta como ocupado para pernoctar, 
    // pero depende de la lógica exacta. Aquí usamos isWithinInterval inclusivo.
    // Ajuste: si la fecha es igual al end, suele ser día de salida y estar libre para otra entrada.
    // Pero isWithinInterval incluye el end. Revisemos lógica de negocio estándar hotelera.
    // Si r.start <= date < r.end => Ocupado. (Noche del check-in ocupada, noche antes del check-out ocupada).
    // isWithinInterval(date, { start, end }) incluye ambos extremos.
    // Para visualización de "Noches", solemos querer ver ocupado hasta el día antes de salida.

    // Opción A: isWithinInterval estricto (incluye start y end)
    // return r.inmuebleId === inmuebleId && isWithinInterval(date, { start: rStart, end: rEnd }) ...

    // Opción B: Excluir fecha fin (check-out)
    // Un día se ve "ocupado" si es >= start Y < end.
    // Si date es igual a start, está ocupado (noche de entrada).
    // Si date es igual a end, es salida (usualmente liberado a mediodía).

    if (r.inmuebleId !== inmuebleId) return false;

    // Normalizar 'date' para comparar solo fechas (sin horas)
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return d >= rStart && d < rEnd &&
      (r.estado === 'pendiente' || r.estado === 'confirmada' || r.estado === 'en_proceso' || r.estado === 'completada' || r.estado === 'bloqueado' || r.estado === undefined);
  });
}

const today = new Date();
today.setHours(0, 0, 0, 0); // Normalizar hoy
const defaultStart = today;
const defaultEnd = addDays(today, 14);

const periodosFijos = [
  { label: "1 semana", days: 7 },
  { label: "2 semanas", days: 14 },
  { label: "3 semanas", days: 21 },
  { label: "1 mes", days: 30 },
  { label: "2 meses", days: 60 },
];

// Paleta de colores para diferenciar reservas
// Cada reserva tendrá un borde de color único basado en su ID
const reservaColorPalette = [
  { border: 'border-l-4 border-rose-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { border: 'border-l-4 border-purple-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { border: 'border-l-4 border-indigo-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { border: 'border-l-4 border-cyan-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { border: 'border-l-4 border-teal-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { border: 'border-l-4 border-emerald-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { border: 'border-l-4 border-lime-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { border: 'border-l-4 border-amber-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { border: 'border-l-4 border-orange-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { border: 'border-l-4 border-red-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { border: 'border-l-4 border-pink-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { border: 'border-l-4 border-fuchsia-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
];

// Paleta para reservas pendientes (tonos amarillos con bordes distintivos)
const reservaPendienteColorPalette = [
  { border: 'border-l-4 border-rose-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' },
  { border: 'border-l-4 border-purple-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' },
  { border: 'border-l-4 border-indigo-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' },
  { border: 'border-l-4 border-cyan-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' },
  { border: 'border-l-4 border-teal-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' },
  { border: 'border-l-4 border-emerald-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' },
  { border: 'border-l-4 border-lime-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' },
  { border: 'border-l-4 border-amber-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' },
  { border: 'border-l-4 border-orange-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' },
  { border: 'border-l-4 border-red-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' },
  { border: 'border-l-4 border-pink-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' },
  { border: 'border-l-4 border-fuchsia-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' },
];

// Función para obtener color de reserva basado en su ID
const getReservaColor = (reservaId: string, isPendiente: boolean) => {
  // Convertir el ID a un número hash para asignar color consistente
  const hash = reservaId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = isPendiente ? reservaPendienteColorPalette : reservaColorPalette;
  const colorIndex = hash % palette.length;
  return palette[colorIndex];
};

const Availability: React.FC = () => {

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [inmuebleId, setInmuebleId] = useState<string | "">("");
  const [estado, setEstado] = useState<"todos" | "ocupado" | "pendiente" | "disponible">("todos");
  const [periodoFijo, setPeriodoFijo] = useState<number | null>(null);
  const [inmuebles, setInmuebles] = useState<AvailabilityInmueble[]>([]);
  const [reservas, setReservas] = useState<AvailabilityReserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtro de Ciudad
  const [ciudadFilter, setCiudadFilter] = useState<string>("");

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateBloqueoModalOpen, setIsCreateBloqueoModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReservaDetail, setSelectedReservaDetail] = useState<IReservaTableData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reservaError, setReservaError] = useState<string | null>(null);
  const [selectedBloqueo, setSelectedBloqueo] = useState<IBloqueo | undefined>(undefined);
  const [isEditBloqueoMode, setIsEditBloqueoMode] = useState(false);

  // Modales de notificación y confirmación
  const [notifModal, setNotifModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  // Calcular fechas a mostrar
  const fechas = useMemo(() => {
    if (periodoFijo) {
      return getDatesInRange(today, addDays(today, periodoFijo - 1));
    }
    return getDatesInRange(startDate, endDate);
  }, [startDate, endDate, periodoFijo]);

  // Fetch disponibilidad
  const fetchDisponibilidad = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const start = format(fechas[0], "yyyy-MM-dd");
      const end = format(fechas[fechas.length - 1], "yyyy-MM-dd");
      params.append("start", start);
      params.append("end", end);
      if (inmuebleId) params.append("inmuebleId", inmuebleId);
      if (estado && estado !== "todos") params.append("estado", estado);

      const token = localStorage.getItem('token');
      const res = await fetch(`/api/disponibilidad?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Error consultando disponibilidad");
      const data = await res.json();
      setInmuebles(data.inmuebles);
      setReservas(data.reservas);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisponibilidad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechas, inmuebleId, estado]);

  // Obtener lista de ciudades únicas
  const ciudades = useMemo(() => {
    const cities = new Set(inmuebles.map(i => i.ciudad).filter(Boolean));
    return Array.from(cities).sort();
  }, [inmuebles]);

  // Filtrar inmuebles
  const inmueblesFiltrados = useMemo(() => {
    let filtered = inmuebles;
    if (inmuebleId) {
      filtered = filtered.filter(i => i.id === inmuebleId);
    }
    if (ciudadFilter) {
      filtered = filtered.filter(i => i.ciudad === ciudadFilter);
    }
    return filtered;
  }, [inmuebles, inmuebleId, ciudadFilter]);

  // Handlers
  const handlePeriodoFijoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "") {
      setPeriodoFijo(null);
    } else {
      setPeriodoFijo(Number(value));
    }
  };

  const handleCellClick = async (reserva: AvailabilityReserva | undefined) => {
    if (reserva) {
      if (reserva.estado === 'bloqueado') {
        const bloqueoData: IBloqueo = {
          id: parseInt(reserva.id.replace('blk-', '')),
          id_inmueble: parseInt(reserva.inmuebleId),
          fecha_inicio: reserva.start,
          fecha_fin: reserva.end,
          tipo_bloqueo: (reserva.tipo_bloqueo as any) || 'mantenimiento',
          descripcion: reserva.descripcion
        };
        setSelectedBloqueo(bloqueoData);
        setIsEditBloqueoMode(true);
        setIsCreateBloqueoModalOpen(true);
      } else {
        try {
          const detail = await getReservaDetalleApi(parseInt(reserva.id));
          setSelectedReservaDetail(detail);
          setIsDetailModalOpen(true);
        } catch (error) {
          console.error("Error al cargar detalle de reserva", error);
          alert("Error al cargar los detalles de la reserva");
        }
      }
    } else {
      // Si la celda está vacía se podría abrir modal de creación con fechas preseleccionadas
      // Setear fechas y abrir modal... por ahora manual
    }
  };

  const handleCreateBloqueoSuccess = () => {
    fetchDisponibilidad();
    setNotifModal({
      open: true,
      message: isEditBloqueoMode ? 'Bloqueo actualizado exitosamente' : 'Bloqueo creado exitosamente',
    });
  };

  // Lo llama CreateBloqueoModal cuando el usuario presiona Eliminar
  const handleDeleteBloqueoRequest = () => {
    setIsCreateBloqueoModalOpen(false); // cierra el modal de edición
  };

  const handleConfirmDelete = async () => {
    if (!selectedBloqueo?.id) return;
    try {
      await deleteBloqueoApi(selectedBloqueo.id);
      setConfirmDeleteModal(false);
      setSelectedBloqueo(undefined);
      setIsEditBloqueoMode(false);
      fetchDisponibilidad();
      setNotifModal({ open: true, message: 'Bloqueo eliminado exitosamente' });
    } catch (err: any) {
      setConfirmDeleteModal(false);
      let errorMsg = err.message || 'Error al eliminar el bloqueo';
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed.message) errorMsg = parsed.message;
      } catch (_) { /* no es JSON */ }
      setNotifModal({ open: true, message: errorMsg });
    }
  };

  const handleCreateReserva = async (data: IReservaForm) => {
    try {
      setReservaError(null);
      if (isEditMode && selectedReservaDetail) {
        // Transformar IReservaForm a lo que espera editReservaApi (incluyendo ID)
        const dataToUpdate = {
          ...data,
          id: selectedReservaDetail.id,
        };
        await editReservaApi(dataToUpdate);
        alert("Reserva actualizada exitosamente");
      } else {
        await createReservaApi(data);
        alert("Reserva creada exitosamente");
      }
      setIsCreateModalOpen(false);
      setIsEditMode(false);
      fetchDisponibilidad(); // Refrescar grid
    } catch (error) {
      console.error("Error al guardar reserva:", error);
      let msg = error instanceof Error ? error.message : 'Error al guardar reserva';

      // Intentar farmatear si es JSON
      try {
        const parsed = JSON.parse(msg);
        if (parsed.message) msg = parsed.message;
      } catch (e) {
        // No es JSON
      }

      if (msg.includes('ocupadas') || msg.includes('traslap') || msg.includes('disponibilidad') || msg.includes('bloqueadas')) {
        setReservaError(msg);
      } else {
        alert(msg);
      }
    }
  };

  const handleEditFromDetail = () => {
    if (selectedReservaDetail) {
      setIsDetailModalOpen(false);
      setIsEditMode(true);
      // Mapear IReservaTableData a IReservaForm si es necesario o pasar directamente si son compatibles
      // IReservaTableData extiende IReservaForm pero tiene campos extra? Revisar interfaces.
      // CreateReservaModal acepta initialData: IReservaForm
      // Necesitamos asegurar compatibilidad

      // Transformamos lo que tenemos en detail a lo que espera el form
      const initialForm: IReservaForm = {
        id_inmueble: parseInt(selectedReservaDetail.id_inmueble as unknown as string) || 0, // Ajustar según tipo real
        fecha_inicio: selectedReservaDetail.fecha_inicio,
        fecha_fin: selectedReservaDetail.fecha_fin,
        numero_huespedes: selectedReservaDetail.numero_huespedes,
        huespedes: selectedReservaDetail.huespedes || [],
        precio_total: selectedReservaDetail.precio_total,
        total_reserva: selectedReservaDetail.total_reserva,
        total_pagado: selectedReservaDetail.total_pagado,
        estado: selectedReservaDetail.estado,
        observaciones: selectedReservaDetail.observaciones,
        id_empresa: selectedReservaDetail.id_empresa,
        plataforma_origen: selectedReservaDetail.plataforma_origen,
      };

      // CreateReservaModal usa initialData
      // Hack: CreateReservaModal mantiene estado interno, al pasar initialData se resetea en useEffect

      setIsCreateModalOpen(true);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Disponibilidad de Inmuebles</h2>
        <div className="flex gap-6">
          <Button
            onClick={() => { setIsEditMode(false); setIsCreateModalOpen(true); }}
            className="bg-tourism-teal hover:bg-tourism-teal/80 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Reserva
          </Button>
          <Button
            onClick={() => {
              setSelectedBloqueo(undefined);
              setIsEditBloqueoMode(false);
              setIsCreateBloqueoModalOpen(true);
            }}
            className="bg-tourism-teal hover:bg-tourism-teal/80 text-white flex items-center gap-2 ml-3"
          >
            <Lock className="h-4 w-4" />
            Crear Bloqueo
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div>
          <label className="block text-sm font-medium mb-1">Periodo fijo</label>
          <select
            value={periodoFijo ?? ""}
            onChange={handlePeriodoFijoChange}
            className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-tourism-teal focus:border-transparent outline-none"
          >
            <option value="">Personalizado</option>
            {periodosFijos.map(p => (
              <option key={p.days} value={p.days}>{p.label}</option>
            ))}
          </select>
        </div>
        {!periodoFijo && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Desde</label>
              <input type="date" value={format(startDate, "yyyy-MM-dd")} onChange={e => setStartDate(parseDateNoTz(e.target.value))} className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-tourism-teal" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hasta</label>
              <input type="date" value={format(endDate, "yyyy-MM-dd")} onChange={e => setEndDate(parseDateNoTz(e.target.value))} className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-tourism-teal" />
            </div>
          </>
        )}

        {/* Filtro de Ciudad */}
        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <div className="relative">
            <select
              value={ciudadFilter}
              onChange={e => setCiudadFilter(e.target.value)}
              className="border rounded px-3 py-2 w-full appearance-none pr-8 outline-none focus:ring-2 focus:ring-tourism-teal"
            >
              <option value="">Todas las ciudades</option>
              {ciudades.map(c => (
                <option key={c} value={c as string}>{c}</option>
              ))}
            </select>
            <Filter className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Inmueble</label>
          <select value={inmuebleId} onChange={e => setInmuebleId(e.target.value)} className="border rounded px-3 py-2 w-full outline-none focus:ring-2 focus:ring-tourism-teal">
            <option value="">Todos</option>
            {inmuebles.map(i => (
              <option key={i.id} value={i.id}>{i.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select value={estado} onChange={e => setEstado(e.target.value as any)} className="border rounded px-3 py-2 w-full outline-none focus:ring-2 focus:ring-tourism-teal">
            <option value="todos">Todos</option>
            <option value="ocupado">Ocupado</option>
            <option value="ocupado">Ocupado</option>
            <option value="disponible">Disponible</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>
          <span>Ocupado/Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-400 rounded-sm"></span>
          <span>Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-sm"></span>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-400 border border-gray-500 rounded-sm"></span>
          <span>Bloqueado/Mantenimiento</span>
        </div>
      </div>

      {/* Tabla tipo calendario */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-2 border-b border-r border-gray-200 text-left bg-gray-50 sticky left-0 z-10 min-w-[200px]">Inmueble</th>
              {fechas.map(date => (
                <th key={date.toISOString()} className="px-2 py-2 border-b border-r border-gray-200 text-xs bg-gray-50 text-center min-w-[60px]">
                  <div className="font-semibold">{format(date, "dd", { locale: es })}</div>
                  <div className="text-gray-500 font-normal">{format(date, "MMM", { locale: es })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={fechas.length + 1} className="text-center py-12 text-gray-500">Cargando disponibilidad...</td></tr>
            ) : error ? (
              <tr><td colSpan={fechas.length + 1} className="text-center text-red-500 py-12">{error}</td></tr>
            ) : inmueblesFiltrados.length === 0 ? (
              <tr><td colSpan={fechas.length + 1} className="text-center py-12 text-gray-500">No se encontraron inmuebles con los filtros seleccionados.</td></tr>
            ) : (
              inmueblesFiltrados.map(inmueble => (
                <tr key={inmueble.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 border-b border-r border-gray-200 font-medium whitespace-nowrap bg-white sticky left-0 z-10 shadow-sm">
                    {inmueble.nombre}
                    {inmueble.ciudad && <div className="text-xs text-gray-400 font-normal">{inmueble.ciudad}</div>}
                  </td>
                  {fechas.map(date => {
                    const reservaEnFecha = getReservaEnFecha(reservas, inmueble.id, date);
                    const ocupado = !!reservaEnFecha;

                    // Si estamos filtrando disponible y está ocupado, mostrar vacío
                    if (estado === "disponible" && ocupado) return <td key={date.toISOString()} className="border border-gray-200 bg-white"></td>;
                    // Si estamos filtrando ocupado y no está ocupado
                    if ((estado === "ocupado") && !ocupado) return <td key={date.toISOString()} className="border border-gray-200 bg-white"></td>;

                    let cellClasses = "bg-gray-100 text-gray-400 hover:bg-gray-200";

                    if (ocupado && reservaEnFecha) {
                      if (reservaEnFecha.estado === 'bloqueado') {
                        cellClasses = "bg-gray-400 border-l-4 border-gray-500 text-gray-600 cursor-not-allowed flex flex-col justify-center items-center text-[10px] leading-tight";
                      } else {
                        const isPendiente = reservaEnFecha.estado === 'pendiente';
                        const colors = getReservaColor(reservaEnFecha.id, isPendiente);
                        cellClasses = `${colors.bg} ${colors.hover} ${colors.border} text-blue-800 cursor-pointer`;
                      }
                    }

                    return (
                      <td
                        key={date.toISOString()}
                        className={`border border-gray-200 text-center transition-colors duration-200 h-12 p-1`}
                      >
                        <div
                          className={`w-full h-full rounded flex items-center justify-center ${cellClasses}`}
                          title={ocupado ? (reservaEnFecha?.estado === 'bloqueado' ? `Bloqueo: ${reservaEnFecha.tipo_bloqueo} - ${reservaEnFecha.descripcion || ''}` : `Reserva ID: ${reservaEnFecha?.id} - ${reservaEnFecha?.estado}`) : "Disponible"}
                          onClick={() => handleCellClick(reservaEnFecha)}
                        >
                          {ocupado && (
                            reservaEnFecha?.estado === 'bloqueado' ?
                              <><Lock className="h-3 w-3" />
                                <span>{reservaEnFecha.id}</span></> :

                              <span className="text-xs font-bold">●</span>

                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <CreateReservaModal
        open={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setReservaError(null);
        }}
        onCreate={handleCreateReserva}
        externalError={reservaError}
        initialData={isEditMode && selectedReservaDetail ? {
          id_inmueble: parseInt((selectedReservaDetail as any).id_inmueble) || 0,
          fecha_inicio: selectedReservaDetail.fecha_inicio,
          fecha_fin: selectedReservaDetail.fecha_fin,
          numero_huespedes: selectedReservaDetail.numero_huespedes,
          huespedes: selectedReservaDetail.huespedes,
          id_empresa: selectedReservaDetail.id_empresa,
          observaciones: selectedReservaDetail.observaciones,
          precio_total: selectedReservaDetail.precio_total,
          total_reserva: selectedReservaDetail.total_reserva,
          total_pagado: selectedReservaDetail.total_pagado,
          estado: selectedReservaDetail.estado,
          plataforma_origen: selectedReservaDetail.plataforma_origen,
        } : undefined}
        isEdit={isEditMode}
      />

      <CreateBloqueoModal
        open={isCreateBloqueoModalOpen}
        onClose={() => {
          setIsCreateBloqueoModalOpen(false);
          setSelectedBloqueo(undefined);
          setIsEditBloqueoMode(false);
        }}
        onSuccess={handleCreateBloqueoSuccess}
        onDeleteRequest={() => {
          setIsCreateBloqueoModalOpen(false);
          setConfirmDeleteModal(true);
        }}
        initialData={selectedBloqueo}
        isEdit={isEditBloqueoMode}
      />

      {selectedReservaDetail && (
        <ReservaDetailModal
          open={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          reserva={selectedReservaDetail}
          onEdit={handleEditFromDetail}
        />
      )}

      {/* Modal de notificación de éxito */}
      {notifModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-800 mb-5">{notifModal.message}</p>
            <Button
              className="bg-tourism-teal hover:bg-tourism-teal/80 text-white px-8"
              onClick={() => setNotifModal({ open: false, message: '' })}
            >
              Aceptar
            </Button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center mb-5">
              <AlertTriangle className="h-14 w-14 text-amber-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">¿Eliminar bloqueo?</h3>
              <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmDelete}
              >
                Sí, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Availability;
