
import React, { useMemo, useState, useEffect } from "react";
import { addDays, format, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface AvailabilityInmueble {
  id: string;
  nombre: string;
}

interface AvailabilityReserva {
  id: string;
  inmuebleId: string;
  start: string;
  end: string;
  estado?: string; // puede ser 'pendiente', 'confirmado', 'anulado', etc.
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
function isOcupado(reservas: AvailabilityReserva[], inmuebleId: string, date: Date) {
  // Solo cuenta como ocupado si el estado es pendiente o confirmado
  return reservas.some(r =>
    r.inmuebleId === inmuebleId &&
    isWithinInterval(date, { start: parseISO(r.start), end: parseISO(r.end) }) &&
    (r.estado === 'pendiente' || r.estado === 'confirmado' || r.estado === undefined) // undefined por compatibilidad
  );
}

const today = new Date();
const defaultStart = today;
const defaultEnd = addDays(today, 14);

const periodosFijos = [
  { label: "1 semana", days: 7 },
  { label: "2 semanas", days: 14 },
  { label: "3 semanas", days: 21 },
  { label: "1 mes", days: 30 },
];

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

  // Calcular fechas a mostrar
  const fechas = useMemo(() => {
    if (periodoFijo) {
      return getDatesInRange(today, addDays(today, periodoFijo - 1));
    }
    return getDatesInRange(startDate, endDate);
  }, [startDate, endDate, periodoFijo]);

  // Fetch disponibilidad
  useEffect(() => {
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
        const res = await fetch(`/api/disponibilidad?${params.toString()}`);
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
    fetchDisponibilidad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechas, inmuebleId, estado]);

  // Filtrar inmuebles si corresponde
  const inmueblesFiltrados = useMemo(() => {
    if (!inmuebleId) return inmuebles;
    return inmuebles.filter(i => i.id === inmuebleId);
  }, [inmuebles, inmuebleId]);

  // Handlers para alternar entre periodo fijo y rango manual
  const handlePeriodoFijoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "") {
      setPeriodoFijo(null);
    } else {
      setPeriodoFijo(Number(value));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Disponibilidad de Inmuebles</h2>
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Periodo fijo</label>
          <select
            value={periodoFijo ?? ""}
            onChange={handlePeriodoFijoChange}
            className="border rounded px-2 py-1"
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
              <label className="block text-sm font-medium">Desde</label>
              <input type="date" value={format(startDate, "yyyy-MM-dd")} onChange={e => setStartDate(parseISO(e.target.value))} className="border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Hasta</label>
              <input type="date" value={format(endDate, "yyyy-MM-dd")} onChange={e => setEndDate(parseISO(e.target.value))} className="border rounded px-2 py-1" />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium">Inmueble</label>
          <select value={inmuebleId} onChange={e => setInmuebleId(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Todos</option>
            {inmuebles.map(i => (
              <option key={i.id} value={i.id}>{i.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select value={estado} onChange={e => setEstado(e.target.value as any)} className="border rounded px-2 py-1">
            <option value="todos">Todos</option>
            <option value="ocupado">Ocupado</option>
            <option value="disponible">Disponible</option>
          </select>
        </div>
      </div>
      {/* Leyenda */}
      <div className="flex items-center gap-4 mb-2">
        <span className="w-4 h-4 bg-blue-500 rounded inline-block border border-blue-400"></span>
        <span className="text-sm">Ocupado</span>
        <span className="w-4 h-4 bg-gray-100 border border-gray-300 rounded inline-block ml-6"></span>
        <span className="text-sm">Disponible</span>
      </div>
      {/* Tabla tipo calendario */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="px-2 py-1 border-b border-r border-gray-200 text-left bg-gray-50 sticky left-0 z-10">Inmueble</th>
              {fechas.map(date => (
                <th key={date.toISOString()} className="px-2 py-1 border-b border-r border-gray-200 text-xs bg-gray-50">
                  {format(date, "dd MMM", { locale: es })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={fechas.length + 1} className="text-center py-8">Cargando disponibilidad...</td></tr>
            ) : error ? (
              <tr><td colSpan={fechas.length + 1} className="text-center text-red-500 py-8">{error}</td></tr>
            ) : inmueblesFiltrados.length === 0 ? (
              <tr><td colSpan={fechas.length + 1} className="text-center py-8">No hay inmuebles para mostrar.</td></tr>
            ) : (
              inmueblesFiltrados.map(inmueble => (
                <tr key={inmueble.id}>
                  <td className="px-2 py-2.5 border-b border-r border-gray-200 font-medium whitespace-nowrap bg-white sticky left-0 z-10">{inmueble.nombre}</td>
                  {fechas.map(date => {
                    const ocupado = isOcupado(reservas, inmueble.id, date);
                    if ((estado === "ocupado" || estado === "pendiente") && !ocupado) return <td key={date.toISOString()} className="border-b border-r border-gray-200 bg-white"></td>;
                    if (estado === "disponible" && ocupado) return <td key={date.toISOString()} className="border-b border-r border-gray-200 bg-white"></td>;
                    return (
                      <td
                        key={date.toISOString()}
                        className={`border-b border-r border-gray-200 text-center transition-colors duration-200 ${ocupado ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"}`}
                        title={ocupado ? "Ocupado" : "Disponible"}
                      >
                        {ocupado ? "●" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Availability;
