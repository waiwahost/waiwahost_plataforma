
import React, { useMemo, useState, useEffect } from "react";
import { addDays, format, isSameMonth, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "../atoms/Button";
import { Plus, Filter, Lock, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon } from "lucide-react";
import CreateReservaModal from "./CreateReservaModal";
import CreateBloqueoModal from "./CreateBloqueoModal";
import ReservaDetailModal from "./ReservaDetailModal";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { IReservaForm, IReservaTableData } from "../../interfaces/Reserva";
import { createReservaApi, getReservaDetalleApi, editReservaApi } from "../../auth/reservasApi";
import { IBloqueo } from "../../interfaces/Bloqueo";
import { deleteBloqueoApi } from "../../auth/bloqueosApi";
import { useAuth } from "../../auth/AuthContext";

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────
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
  estado?: string;
  tipo_bloqueo?: string;
  descripcion?: string;
  total_reserva?: number | null;
  huesped_nombre?: string | null;
  huesped_apellido?: string | null;
}

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────
function parseDateNoTz(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return parseISO(dateStr);
}

function getDatesInRange(start: Date, end: Date) {
  const dates = [];
  let current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }
  return dates;
}

function formatCOP(n?: number | null) {
  if (n == null) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(n);
}

// ─────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────
const today = new Date();
today.setHours(0, 0, 0, 0);
const defaultStart = today;
const defaultEnd = addDays(today, 14);

const periodosFijos = [
  { label: "1 semana", days: 7 },
  { label: "2 semanas", days: 14 },
  { label: "3 semanas", days: 21 },
  { label: "1 mes", days: 30 },
  { label: "2 meses", days: 60 },
];

// Paleta corporativa Waiwa
// #0A3D2A verde oscuro | #E8A000 ámbar | #9B91A0 mauve | #C8E600 lima | #7A3B00 naranja oscuro | #6B4E00 dorado | #B3BBCF azul pálido
const ESTADO_COLORS: Record<string, { bg: string; text: string; badge: string; badgeText: string }> = {
  confirmada: { bg: 'bg-[#0A3D2A]', text: 'text-white', badge: 'bg-white/20', badgeText: 'text-white' },
  pendiente: { bg: 'bg-[#E8A000]', text: 'text-[#0A3D2A]', badge: 'bg-black/15', badgeText: 'text-[#0A3D2A]' },
  bloqueado: { bg: 'bg-[#9B91A0]', text: 'text-white', badge: 'bg-black/15', badgeText: 'text-white' },
};

const ESTADO_LABEL: Record<string, string> = {
  confirmada: 'Confirmada',
  pendiente: 'Pendiente',
  bloqueado: 'Bloqueado',
};

const CELL_W = 76;
const ROW_H = 70;
const SIDEBAR_W = 260;

function getEstadoStyle(estado?: string) {
  return ESTADO_COLORS[estado ?? ''] ?? ESTADO_COLORS.pendiente;
}

// ─────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────
const Availability: React.FC = () => {

  // ── Filter state (original filters) ──────────
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [inmuebleId, setInmuebleId] = useState<string>("");
  const [estado, setEstado] = useState<"todos" | "ocupado" | "pendiente" | "disponible">("todos");
  const [periodoFijo, setPeriodoFijo] = useState<number | null>(null);
  const [ciudadFilter, setCiudadFilter] = useState<string>("");
  const [search, setSearch] = useState('');

  // ── Calendar window navigation ────────────────
  const [windowStart, setWindowStart] = useState(() => addDays(today, -3));

  // ── Data ──────────────────────────────────────
  const [inmuebles, setInmuebles] = useState<AvailabilityInmueble[]>([]);
  const [reservas, setReservas] = useState<AvailabilityReserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Modals ────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateBloqueoModalOpen, setIsCreateBloqueoModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReservaDetail, setSelectedReservaDetail] = useState<IReservaTableData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reservaError, setReservaError] = useState<string | null>(null);
  const [selectedBloqueo, setSelectedBloqueo] = useState<IBloqueo | undefined>(undefined);
  const [isEditBloqueoMode, setIsEditBloqueoMode] = useState(false);
  const [notifModal, setNotifModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  // ── Auth / Rol ────────────────────────────────
  const { user } = useAuth();
  const isPropietario = user && (
    String(user.role) === 'PROPIETARIO' ||
    String(user.role) === '4' ||
    (user as any).id_roles === 4
  );

  // Mini-modal para propietario (solo nombre + valor)
  const [propietarioModal, setPropietarioModal] = useState<{ open: boolean; nombre: string; valor: number | null }>({ open: false, nombre: '', valor: null });

  // ── Derived dates ─────────────────────────────
  // Memoize DAYS_VISIBLE and windowEnd so they don't create new object references on every render
  const DAYS_VISIBLE = useMemo(
    () => periodoFijo ?? Math.max(8, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1),
    [periodoFijo, startDate, endDate]
  );
  const windowEnd = useMemo(() => addDays(windowStart, DAYS_VISIBLE - 1), [windowStart, DAYS_VISIBLE]);
  const fechas = useMemo(() => getDatesInRange(windowStart, windowEnd), [windowStart, windowEnd]);

  // Stable string values used as useEffect deps to avoid reference-equality issues with Date objects
  const windowStartStr = useMemo(() => format(windowStart, 'yyyy-MM-dd'), [windowStart]);
  const windowEndStr = useMemo(() => format(windowEnd, 'yyyy-MM-dd'), [windowEnd]);

  const cidadades = useMemo(() => {
    const s = new Set(inmuebles.map(i => i.ciudad).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [inmuebles]);

  const inmueblesFiltrados = useMemo(() => {
    return inmuebles.filter(i => {
      const matchSearch = !search || i.nombre.toLowerCase().includes(search.toLowerCase());
      const matchCiudad = !ciudadFilter || i.ciudad === ciudadFilter;
      const matchId = !inmuebleId || i.id === inmuebleId;
      return matchSearch && matchCiudad && matchId;
    });
  }, [inmuebles, search, ciudadFilter, inmuebleId]);

  const monthGroups = useMemo(() => {
    const groups: { month: string; dates: Date[] }[] = [];
    fechas.forEach(d => {
      const key = format(d, 'MMMM yyyy', { locale: es });
      const last = groups[groups.length - 1];
      if (last && last.month === key) last.dates.push(d);
      else groups.push({ month: key, dates: [d] });
    });
    return groups;
  }, [fechas]);

  // ── Fetch ─────────────────────────────────────
  const fetchDisponibilidad = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('start', format(windowStart, 'yyyy-MM-dd'));
      params.append('end', format(windowEnd, 'yyyy-MM-dd'));
      if (inmuebleId) params.append('inmuebleId', inmuebleId);
      if (estado && estado !== 'todos') params.append('estado', estado);
      const res = await fetch(`/api/disponibilidad?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error consultando disponibilidad');
      const data = await res.json();
      setInmuebles(data.inmuebles ?? []);
      setReservas(data.reservas ?? []);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisponibilidad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowStartStr, windowEndStr, inmuebleId, estado]);

  // ── Navigation ────────────────────────────────
  const navWeek = (dir: 1 | -1) => setWindowStart(d => addDays(d, 7 * dir));
  const goToday = () => setWindowStart(addDays(today, -3));

  const handlePeriodoFijoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPeriodoFijo(value === '' ? null : Number(value));
  };

  // ── Bar calculation ───────────────────────────
  const getBarsForInmueble = (inmId: string) => {
    const bars: { reserva: AvailabilityReserva; colStart: number; colSpan: number }[] = [];
    reservas.forEach(r => {
      if (r.inmuebleId !== inmId) return;
      if (!['pendiente', 'confirmada', 'en_proceso', 'completada', 'bloqueado', undefined].includes(r.estado)) return;
      // Filter by estado filter
      if (estado === 'disponible') return;
      if (estado === 'ocupado' && r.estado === 'bloqueado') return;
      if (estado === 'bloqueado' && r.estado !== 'bloqueado') return;
      if (estado === 'pendiente' && r.estado !== 'pendiente') return;

      const rStart = parseDateNoTz(r.start);
      const rEnd = parseDateNoTz(r.end);

      const firstVisible = fechas.findIndex(d => d >= rStart && d < rEnd);
      if (firstVisible === -1) return;

      let lastVisible = firstVisible;
      for (let i = firstVisible; i < fechas.length; i++) {
        if (fechas[i] < rEnd) lastVisible = i;
        else break;
      }

      bars.push({ reserva: r, colStart: firstVisible, colSpan: Math.max(1, lastVisible - firstVisible + 1) });
    });
    return bars;
  };

  // ── Event handlers ────────────────────────────
  const handleBarClick = async (reserva: AvailabilityReserva) => {
    // Si es propietario: mostrar solo nombre y valor, sin detalles completos
    if (isPropietario) {
      if (reserva.estado !== 'bloqueado') {
        const nombre = reserva.huesped_nombre
          ? `${reserva.huesped_nombre}${reserva.huesped_apellido ? ' ' + reserva.huesped_apellido : ''}`
          : 'Reserva';
        setPropietarioModal({ open: true, nombre, valor: reserva.total_reserva ?? null });
      }
      return;
    }

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
      } catch {
        alert('Error al cargar los detalles de la reserva');
      }
    }
  };

  const handleCreateBloqueoSuccess = () => {
    fetchDisponibilidad();
    setNotifModal({ open: true, message: isEditBloqueoMode ? 'Bloqueo actualizado exitosamente' : 'Bloqueo creado exitosamente' });
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
      let msg = err.message || 'Error al eliminar el bloqueo';
      try { const p = JSON.parse(msg); if (p.message) msg = p.message; } catch (_) { }
      setNotifModal({ open: true, message: msg });
    }
  };

  const handleCreateReserva = async (data: IReservaForm) => {
    try {
      setReservaError(null);
      if (isEditMode && selectedReservaDetail) {
        await editReservaApi({ ...data, id: selectedReservaDetail.id });
        alert('Reserva actualizada exitosamente');
      } else {
        await createReservaApi(data);
        alert('Reserva creada exitosamente');
      }
      setIsCreateModalOpen(false);
      setIsEditMode(false);
      fetchDisponibilidad();
    } catch (error) {
      let msg = error instanceof Error ? error.message : 'Error al guardar reserva';
      try { const p = JSON.parse(msg); if (p.message) msg = p.message; } catch (_) { }
      if (msg.includes('ocupadas') || msg.includes('traslap') || msg.includes('disponibilidad') || msg.includes('bloqueadas')) {
        setReservaError(msg);
      } else {
        alert(msg);
      }
    }
  };

  const handleEditFromDetail = () => {
    if (!selectedReservaDetail) return;
    setIsDetailModalOpen(false);
    setIsEditMode(true);
    setIsCreateModalOpen(true);
  };

  const todayColIndex = fechas.findIndex(d =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );

  // ── Render ────────────────────────────────────
  return (
    <div className="p-6 bg-white dark:bg-background rounded-2xl flex flex-col gap-4 shadow-lg border border-gray-100 dark:border-border">

      {/* ── Title + action buttons ── */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium">Desde:</label>
            <input
              type="date"
              value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const dateStr = e.target.value;
                if (dateStr) {
                  // Keep native functionality but map backwards
                  const [year, month, day] = dateStr.split('-');
                  const adjustedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  setPeriodoFijo(null);
                  setStartDate(adjustedDate);
                  setWindowStart(adjustedDate);
                }
              }}
              className="flex h-10 w-full min-w-[160px] items-center justify-between rounded-md border border-gray-200 dark:border-border bg-white px-3 py-2 text-sm dark:bg-background dark:text-foreground cursor-pointer outline-none focus:ring-2 focus:ring-waiwa-amber hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium dark:text-foreground dark:bg-background">Hasta:</label>
            <input
              type="date"
              value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const dateStr = e.target.value;
                if (dateStr) {
                  const [year, month, day] = dateStr.split('-');
                  const adjustedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  setPeriodoFijo(null);
                  setEndDate(adjustedDate);
                }
              }}
              className="flex h-10 w-full min-w-[160px] items-center justify-between rounded-md border border-gray-200 dark:border-border bg-white px-3 py-2 text-sm dark:bg-background dark:text-foreground cursor-pointer outline-none focus:ring-2 focus:ring-waiwa-amber hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-3">
          {!isPropietario && (
            <>
              <Button
                onClick={() => { setIsEditMode(false); setIsCreateModalOpen(true); }}
                className="bg-tourism-teal hover:bg-tourism-teal/80 text-white flex items-center gap-2"
              >
                Crear Reserva
              </Button>
              <Button
                onClick={() => { setSelectedBloqueo(undefined); setIsEditBloqueoMode(false); setIsCreateBloqueoModalOpen(true); }}
                className="bg-tourism-teal hover:bg-tourism-teal/80 text-white flex items-center gap-2"
              >
                Crear Bloqueo <Lock className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Original filters ── */}
      <div className="flex flex-wrap gap-8 rounded-lg py-4">
        <div>
          <label className="block text-sm font-medium mb-1">Periodo fijo</label>
          <Select value={periodoFijo ? String(periodoFijo) : "personalizado"} onValueChange={(val) => {
            const fakeEvent = { target: { value: val === "personalizado" ? "" : val } } as any;
            handlePeriodoFijoChange(fakeEvent);
          }}>
            <SelectTrigger className="w-full min-w-[150px] border-gray-200 dark:border-border dark:bg-background dark:text-foreground focus:ring-waiwa-amber h-10">
              <SelectValue placeholder="Periodo fijo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personalizado">Personalizado</SelectItem>
              {periodosFijos.map(p => (
                <SelectItem key={p.days} value={String(p.days)}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <Select value={ciudadFilter || "todas"} onValueChange={(val) => setCiudadFilter(val === "todas" ? "" : val)}>
            <SelectTrigger className="w-full min-w-[180px] border-gray-200 dark:border-border dark:bg-background dark:text-foreground focus:ring-waiwa-amber h-10">
              <SelectValue placeholder="Ciudad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las ciudades</SelectItem>
              {cidadades.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Inmueble</label>
          <Select value={inmuebleId || "todos"} onValueChange={(val) => setInmuebleId(val === "todos" ? "" : val)}>
            <SelectTrigger className="w-full min-w-[150px] border-gray-200 dark:border-border dark:bg-background dark:text-foreground focus:ring-waiwa-amber h-10">
              <SelectValue placeholder="Inmueble" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {inmuebles.map(i => <SelectItem key={i.id} value={i.id}>{i.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <Select value={estado} onValueChange={(val) => setEstado(val as any)}>
            <SelectTrigger className="w-full min-w-[150px] border-gray-200 dark:border-border dark:bg-background dark:text-foreground focus:ring-waiwa-amber h-10">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ocupado">Ocupado</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="bloqueado">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Gantt Calendar ── */}
      <div className="flex flex-col border border-gray-200 dark:border-border rounded-xl shadow-sm">

        {/* Calendar toolbar: nav arrows + Today + month label */}
        {/* Legend */}

        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 dark:border-border bg-gray-50 dark:bg-card">
          <button onClick={() => navWeek(-1)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-secondary text-gray-500 dark:text-gray-400 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={goToday} className="text-sm p-4 font-medium text-gray-700 dark:text-foreground hover:text-waiwa-forest dark:hover:text-waiwa-amber px-2 py-1 rounded-2xl px-2 border border-gray-200 dark:border-border hover:bg-gray-100 dark:hover:bg-secondary transition-colors">
            Hoy
          </button>
          <button onClick={() => navWeek(1)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-secondary text-gray-500 dark:text-gray-400 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-gray-700 dark:text-foreground ml-1 capitalize">
            {format(windowStart, 'MMMM yyyy', { locale: es })}
            {!isSameMonth(windowStart, windowEnd) && ` — ${format(windowEnd, 'MMMM yyyy', { locale: es })}`}
          </span>
        </div>

        {/* Sidebar + grid */}
        <div className="flex overflow-x-hidden">

          {/* Left sidebar */}
          <div className="flex-none flex flex-col border-r border-gray-200 dark:border-border bg-gray-50 dark:bg-card" style={{ width: SIDEBAR_W }}>
            {/* Search */}
            <div className="flex flex-col px-3 py-3 gap-2 border-b border-gray-200 dark:border-border bg-gray-50 dark:bg-card" style={{ height: 133, display: 'flex', alignItems: 'flex-start', paddingBottom: 0 }}>
              <div className="flex flex-col gap-1 justify-start items-start px-0 py-0 text-sm text-black dark:text-foreground border-t border-gray-100 dark:border-border">
                {Object.entries(ESTADO_LABEL).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full ${ESTADO_COLORS[key]?.bg ?? 'bg-gray-300'}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="relative w-full">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Busca el inmueble..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 dark:border-border rounded-md bg-white dark:bg-background dark:text-foreground focus:outline-none focus:ring-1 focus:ring-waiwa-amber"
                />
              </div>
            </div>
            {/* Property rows */}
            <div className="flex-1">
              {loading ? (
                <div className="p1 text-xs text-gray-400 text-center">Cargando...</div>
              ) : error ? (
                <div className="p-1 text-xs text-red-400 text-center">{error}</div>
              ) : inmueblesFiltrados.length === 0 ? (
                <div className="p-1 text-xs text-gray-400 text-center">Sin inmuebles</div>
              ) : (
                inmueblesFiltrados.map(inmueble => (
                  <div
                    key={inmueble.id}
                    className="flex flex-col justify-center px-3 border-b border-gray-100 dark:border-border hover:bg-white dark:hover:bg-secondary transition-colors"
                    style={{ height: ROW_H }}
                  >
                    <p className="text-sm font-semibold text-gray-800 dark:text-foreground truncate leading-tight">{inmueble.nombre}</p>
                    {inmueble.ciudad && (
                      <p className="text-xs text-gray-400 dark:text-muted-foreground truncate mt-0.5">{inmueble.ciudad}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Scrollable date grid */}
          <div className="flex-1 overflow-x-auto">
            <div style={{ minWidth: fechas.length * CELL_W }}>

              {/* Date headers */}
              <div className="sticky top-0 z-10 bg-white dark:bg-card border-b border-gray-200 dark:border-border flex flex-col justify-end" style={{ height: 133 }}>
                {/* Month row */}
                <div className="flex flex-1 items-end bg-gray-50/50 dark:bg-muted/30">
                  {monthGroups.map(g => (
                    <div
                      key={g.month}
                      style={{ width: g.dates.length * CELL_W }}
                      className="px-4 pb-7 capitalize border-r border-gray-200 dark:border-border last:border-r-0 flex flex-col justify-end"
                    >
                      <span className="text-xl font-bold tracking-tight text-waiwa-forest dark:text-waiwa-amber opacity-90">
                        {g.month}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Day row */}
                <div className="flex">
                  {fechas.map((d, i) => {
                    const isToday = i === todayColIndex;
                    return (
                      <div
                        key={d.toISOString()}
                        style={{ width: CELL_W, minWidth: CELL_W }}
                        className={`flex flex-col items-center justify-center py-0 border-r border-gray-100 dark:border-border last:border-r-0 ${isToday ? 'bg-[#0A3D2A]' : ''}`}
                      >
                        <span className={`text-[10px] font-medium uppercase tracking-wide ${isToday ? 'text-white' : 'text-gray-400 dark:text-muted-foreground'}`}>
                          {format(d, 'EEEE', { locale: es })}
                        </span>
                        <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-gray-800 dark:text-foreground'}`}>
                          {format(d, 'd')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid rows with reservation bars */}
              <div className="relative">
                {!loading && !error && inmueblesFiltrados.map(inmueble => {
                  const bars = getBarsForInmueble(inmueble.id);
                  return (
                    <div key={inmueble.id} className="flex relative border-b border-gray-200 dark:border-border" style={{ height: ROW_H }}>
                      {/* Background day cells */}
                      {fechas.map((d, i) => (
                        <div
                          key={d.toISOString()}
                          style={{ width: CELL_W, minWidth: CELL_W, height: ROW_H }}
                          className={`flex-none border-r border-gray-200 dark:border-border last:border-r-0 ${i === todayColIndex ? 'bg-[#C8E600]/15' : ''}`}
                        />
                      ))}

                      {/* Reservation bars */}
                      {bars.map(({ reserva, colStart, colSpan }) => {
                        const style = getEstadoStyle(reserva.estado);
                        const estadoLabel = ESTADO_LABEL[reserva.estado ?? ''] ?? reserva.estado ?? '';
                        const isBlock = reserva.estado === 'bloqueado';
                        const guestName = reserva.huesped_nombre
                          ? `${reserva.huesped_nombre}${reserva.huesped_apellido ? ' ' + reserva.huesped_apellido : ''}`
                          : null;

                        return (
                          <div
                            key={reserva.id}
                            onClick={() => handleBarClick(reserva)}
                            title={`${guestName ?? 'Bloqueo'} — ${estadoLabel}`}
                            className={`absolute top-5 bottom-3 rounded-2xl h-7 py-1 cursor-pointer flex items-center justify-end px-3 gap-5 shadow-md transition-all hover:brightness-90 active:scale-[0.99] ${style.bg} ${style.text}`}
                            style={{
                              left: colStart * CELL_W + 2,
                              width: colSpan * CELL_W - 4,
                            }}
                          >
                            {isBlock ? (
                              <>
                                <Lock className="w-3.5 h-3.5 flex-none opacity-80" />
                                <span className="text-xs font-semibold truncate opacity-90">
                                  {reserva.tipo_bloqueo ?? 'Bloqueado'}{reserva.descripcion ? ` — ${reserva.descripcion}` : ''}
                                </span>
                              </>
                            ) : (
                              <>
                                {/* Reservation ID badge — always shown */}
                                <span className={`flex-none text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${style.badge} ${style.badgeText}`}>
                                  RSV-{new Date().getFullYear()}-{reserva.id.padStart(3, '0')}
                                </span>
                                {guestName && (
                                  <span className="text-sm font-bold truncate whitespace-nowrap tracking-tight">
                                    {guestName.split(' ')[0]}
                                  </span>
                                )}
                                {reserva.total_reserva != null && colSpan >= 3 && (
                                  <span className="text-xs font-bold whitespace-nowrap opacity-90 ml-auto">
                                    {formatCOP(reserva.total_reserva)}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {loading && <div className="flex items-center justify-center py-16 text-sm text-gray-400">Cargando disponibilidad...</div>}
                {error && <div className="flex items-center justify-center py-16 text-sm text-red-400">{error}</div>}
                {!loading && !error && inmueblesFiltrados.length === 0 && (
                  <div className="flex items-center justify-center py-16 text-sm text-gray-400">No se encontraron inmuebles con los filtros seleccionados.</div>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* ── Modales ── */}
      <CreateReservaModal
        open={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setReservaError(null); }}
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
        onClose={() => { setIsCreateBloqueoModalOpen(false); setSelectedBloqueo(undefined); setIsEditBloqueoMode(false); }}
        onSuccess={handleCreateBloqueoSuccess}
        onDeleteRequest={() => { setIsCreateBloqueoModalOpen(false); setConfirmDeleteModal(true); }}
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

      {notifModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70]">
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-800 dark:text-foreground mb-5">{notifModal.message}</p>
            <Button className="bg-tourism-teal hover:bg-tourism-teal/80 text-white px-8" onClick={() => setNotifModal({ open: false, message: '' })}>
              Aceptar
            </Button>
          </div>
        </div>
      )}

      {confirmDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70]">
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center mb-5">
              <AlertTriangle className="h-14 w-14 text-amber-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">¿Eliminar bloqueo?</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setConfirmDeleteModal(false)}>Cancelar</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirmDelete}>Sí, eliminar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Mini-modal para propietario: solo nombre y valor */}
      {propietarioModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70]">
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏠</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-foreground mb-1">Reserva</h3>
            <p className="text-base font-semibold text-gray-700 dark:text-foreground mb-3">{propietarioModal.nombre}</p>
            {propietarioModal.valor != null && (
              <p className="text-2xl font-bold text-[#0A3D2A] dark:text-waiwa-amber mb-5">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(propietarioModal.valor)}
              </p>
            )}
            <Button
              className="bg-[#0A3D2A] hover:bg-[#0A3D2A]/80 text-white px-8"
              onClick={() => setPropietarioModal({ open: false, nombre: '', valor: null })}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );

};

export default Availability;
