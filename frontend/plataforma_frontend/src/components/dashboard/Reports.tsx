import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Calendar, Filter, Download, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { getReporteFinanciero, ReporteFinancieroFilters, getOpcionesReporte, IOpcionesReporte } from '../../services/reportes.service';
import { getKpis } from '../../services/kpi.service';
import { KpiResponse, BuildingKpis, UnitKpis } from '../../interfaces/Kpi';
import { getInmueblesApi } from '../../auth/getInmueblesApi';
import { getPropietariosApi } from '../../auth/propietariosApi';
import { useReportePDF } from './ReportePDFGenerator';
import { useAuth } from '../../auth/AuthContext';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../atoms/Input';

export default function NuevoReporteFinanciero() {
    const { user } = useAuth();
    const isPropietario = user && (
        String(user.role) === 'PROPIETARIO' ||
        String(user.role) === '4' ||
        (user as any).id_roles === 4
    );

    const [filters, setFilters] = useState<ReporteFinancieroFilters>({
        fechaInicio: '',
        fechaFin: '',
    });
    const [reportData, setReportData] = useState<any>(null);
    const [kpiData, setKpiData] = useState<KpiResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [opciones, setOpciones] = useState<IOpcionesReporte | null>(null);
    const [mounted, setMounted] = useState(false);
    // Propietario siempre filtra por inmueble (no puede filtrar por propietario)
    const [filterMode, setFilterMode] = useState<'inmueble' | 'propietario'>('inmueble');
    const [pdfLoading, setPdfLoading] = useState(false);
    const { generarPDF } = useReportePDF();
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        // Initialize dates on client side to avoid hydration mismatch
        const today = new Date();
        setFilters(prev => ({
            ...prev,
            fechaInicio: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
            fechaFin: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0],
        }));

        // Initial load of companies (and potentially everything if superadmin wants to see all initially, 
        // but let's just load companies first to let them select)
        const loadInitialOptions = async () => {
            const data = await getOpcionesReporte(undefined, 'empresas');
            if (data) {
                setOpciones(prev => ({ ...prev, empresas: data.empresas } as IOpcionesReporte));

                // If only one company (e.g. company admin), set it automatically and load its properties/owners
                if (data.empresas && data.empresas.length === 1) {
                    const singleEmpresaId = Number(data.empresas[0].id);
                    setFilters(prev => ({ ...prev, empresaId: singleEmpresaId }));
                    // The useEffect below will handle loading properties/owners for this company
                } else {
                    // If superadmin with multiple companies, maybe load all properties/owners initially? 
                    // Or wait for selection. Let's wait for selection to be efficient.
                    // But we need to load something if they don't select a company.
                    // For now, let's load everything if no company selected (assuming superadmin wants to see all)
                    // OR better, let the user select.
                }
            }
        };
        loadInitialOptions();
    }, []);

    // Effect to load Properties/Owners when Company or Filter Mode changes
    useEffect(() => {
        const fetchOptions = async () => {
            // Determine what to fetch based on filterMode
            // If filterMode is 'inmueble', we need properties.
            // If filterMode is 'propietario', we need owners.

            // We always pass the selected empresaId (if any) to filter the results server-side.

            if (filterMode === 'inmueble') {
                try {
                    // Use the specific endpoint for inmuebles as requested
                    const inmueblesData = await getInmueblesApi();
                    if (inmueblesData) {
                        // Map to the expected format { id, nombre }
                        const mappedInmuebles = inmueblesData.map(i => ({
                            id: Number(i.id_inmueble),
                            nombre: i.nombre
                        }));
                        setOpciones(prev => ({ ...prev, inmuebles: mappedInmuebles } as IOpcionesReporte));
                    }
                } catch (err) {
                    console.error('Error fetching inmuebles:', err);
                }
            } else if (filterMode === 'propietario') {
                try {
                    const propietariosData = await getPropietariosApi();
                    if (propietariosData) {
                        const mappedPropietarios = propietariosData.map(p => ({
                            id: Number(p.id),
                            nombre: `${p.nombre} ${p.apellido}`.trim()
                        }));
                        setOpciones(prev => ({ ...prev, propietarios: mappedPropietarios } as IOpcionesReporte));
                    }
                } catch (err) {
                    console.error('Error fetching propietarios:', err);
                }
            }
        };

        if (mounted) {
            fetchOptions();
        }
    }, [filters.empresaId, filterMode, mounted]);

    if (!mounted) return null;

    const handleGenerateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const reportPromise = getReporteFinanciero(filters);
            let kpiPromise: Promise<KpiResponse | null> = Promise.resolve(null);

            if (filters.inmuebleId) {
                kpiPromise = getKpis({
                    id_inmueble: filters.inmuebleId,
                    fecha_inicio: filters.fechaInicio!,
                    fecha_fin: filters.fechaFin!
                });
            }

            const [response, kpiRes] = await Promise.all([reportPromise, kpiPromise]);
            setKpiData(kpiRes);

            // Robust data extraction to handle different nesting levels
            let payload = null;
            if (response.data && response.data.resumen) {
                payload = response.data;
            } else if (response.data && response.data.data && response.data.data.resumen) {
                payload = response.data.data;
            } else if (response.resumen) {
                payload = response;
            }

            if (!payload || !payload.resumen) {
                console.error('Invalid data structure received:', response);
                throw new Error('La estructura de datos recibida no es válida');
            }

            setReportData(payload);
        } catch (err: any) {
            console.error('Error generating report:', err);
            setError(err.message || 'Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!reportData) return;
        setPdfLoading(true);
        try {
            await generarPDF(reportData, kpiData, filters.fechaInicio ?? '', filters.fechaFin ?? '');
        } catch (err) {
            console.error('Error generando PDF', err);
            setError('Error al generar el PDF');
        } finally {
            setPdfLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount || 0);
    };

    const formatDateLocal = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        // Add offset to get local date correctly avoiding -1 day issue
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return localDate.toLocaleDateString();
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    Informe Financiero
                </h1>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Filter size={20} /> Filtros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha Inicio</label>
                            <Input
                                type="date"
                                value={filters.fechaInicio}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, fechaInicio: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha Fin</label>
                            <Input
                                type="date"
                                value={filters.fechaFin}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, fechaFin: e.target.value })}
                            />
                        </div>

                        {/* Company Filter - Only show if more than 1 company (Superadmin) */}
                        {opciones?.empresas && opciones.empresas.length > 1 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Empresa</label>
                                <Select onValueChange={(val) => setFilters({ ...filters, empresaId: val === 'all' ? undefined : Number(val) })}>
                                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {opciones.empresas.map(e => (
                                            <SelectItem key={e.id} value={e.id.toString()}>{e.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Filter By Selector — oculto para propietarios */}
                        {!isPropietario && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Filtrar por</label>
                                <Select
                                    value={filterMode}
                                    onValueChange={(val: 'inmueble' | 'propietario') => {
                                        setFilterMode(val);
                                        setFilters({ ...filters, inmuebleId: undefined, propietarioId: undefined });
                                    }}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="inmueble">Inmueble</SelectItem>
                                        <SelectItem value="propietario">Propietario</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {/* Dynamic Dropdown (Property or Owner) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {filterMode === 'propietario' ? 'Seleccionar Propietario' : 'Seleccionar Inmueble'}
                            </label>

                            {filterMode === 'propietario' ? (
                                <Select onValueChange={(val) => setFilters({ ...filters, propietarioId: val === 'all' ? undefined : Number(val) })}>
                                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {opciones?.propietarios?.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Select onValueChange={(val) => setFilters({ ...filters, inmuebleId: val === 'all' ? undefined : Number(val) })}>
                                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {opciones?.inmuebles?.map(i => (
                                            <SelectItem key={i.id} value={i.id.toString()}>{i.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <Button onClick={handleGenerateReport} disabled={loading} className="flex gap-2">
                            {loading ? <RefreshCw className="animate-spin" /> : <Calendar />} Generar Informe
                        </Button>
                        {reportData && (
                            <Button variant="outline" onClick={handleDownloadPDF} disabled={pdfLoading} className="flex gap-2">
                                {pdfLoading ? <RefreshCw className="animate-spin h-4 w-4" /> : <Download />}
                                {pdfLoading ? 'Generando PDF...' : 'Descargar PDF'}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4 text-red-700 flex items-center gap-2">
                        <AlertCircle /> {error}
                    </CardContent>
                </Card>
            )}

            {/* Report Content */}
            {reportData && (
                <div ref={reportRef} className="space-y-6 bg-white p-4 rounded-lg">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="p-6">
                                <h3 className="text-green-700 font-medium">Ingresos Totales</h3>
                                <p className="text-2xl font-bold text-green-800">
                                    {kpiData && kpiData.data ? formatCurrency(kpiData.type === 'unit' ? (kpiData.data as UnitKpis).ingreso_total : (kpiData.data as BuildingKpis).ingresos_totales) : formatCurrency(reportData.resumen.totalIngresos)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-50 border-red-200">
                            <CardContent className="p-6">
                                <h3 className="text-red-700 font-medium">Gastos Totales</h3>
                                <p className="text-2xl font-bold text-red-800">{formatCurrency(reportData.resumen.totalEgresos)}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-6">
                                <h3 className="text-blue-700 font-medium">Utilidad / Balance</h3>
                                <p className="text-2xl font-bold text-blue-800">
                                    {kpiData && kpiData.data ? formatCurrency(kpiData.type === 'unit' ? (kpiData.data as UnitKpis).utilidad : (kpiData.data as BuildingKpis).utilidad_total) : formatCurrency(reportData.resumen.balance)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Global Indicators Summary - Optional / Context based */}
                    {!kpiData && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-sm text-gray-500">Ocupación</p>
                                    <p className="text-xl font-semibold">{(reportData.indicadores.ocupacionPromedio * 100).toFixed(1)}%</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-sm text-gray-500">Total Reservas</p>
                                    <p className="text-xl font-semibold">{reportData.indicadores.totalReservas}</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Indicators */}
                    {kpiData && (
                        <Card>
                            <CardHeader><CardTitle>Indicadores Clave (KPIs)</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Ocupación</p>
                                    <p className="text-xl font-semibold">
                                        {kpiData.type === 'unit' ? (kpiData.data as UnitKpis).ocupacion.toFixed(1) : (kpiData.data as BuildingKpis).ocupacion_global.toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{kpiData.type === 'building' ? 'RevPAR Edificio' : 'ADR'}</p>
                                    <p className="text-xl font-semibold">
                                        {formatCurrency(kpiData.type === 'unit' ? (kpiData.data as UnitKpis).adr : (kpiData.data as BuildingKpis).revpar_edificio)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">RevPAR</p>
                                    <p className="text-xl font-semibold">
                                        {formatCurrency(kpiData.type === 'unit' ? (kpiData.data as UnitKpis).revpar : (kpiData.data as BuildingKpis).revpar_edificio)}
                                    </p>
                                </div>
                                {kpiData.type === 'unit' ? (
                                    <div>
                                        <p className="text-sm text-gray-500">Noches Ocupadas</p>
                                        <p className="text-xl font-semibold">{(kpiData.data as UnitKpis).noches_ocupadas} / {(kpiData.data as UnitKpis).noches_disponibles}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm text-gray-500">Margen Neto</p>
                                        <p className="text-xl font-semibold">{(kpiData.data as BuildingKpis).margen_neto.toFixed(1)}%</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Reservations Table */}
                    <div className="rounded-[1rem] border border-gray-100 dark:border-border overflow-hidden bg-white dark:bg-card shadow-sm w-full">
                        <div className="p-4 border-b border-gray-100 dark:border-border bg-white dark:bg-card flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-tourism-navy dark:text-foreground">Detalle de Reservas</h3>
                        </div>
                        <div className="overflow-x-auto w-full max-h-[400px] overflow-y-auto">
                            <table className="w-full text-sm text-left relative">
                                <thead className="bg-waiwa-sky dark:bg-waiwa-amber text-[#64748b] dark:text-muted-foreground text-[13px] font-semibold border-b border-gray-100 dark:border-border">
                                    <tr>
                                        <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Código</th>
                                        <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Inmueble</th>
                                        <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Huésped</th>
                                        <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Plataforma</th>
                                        <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Ingreso</th>
                                        <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Salida</th>
                                        <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black text-center">Noches</th>
                                        <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-border/50 bg-white dark:bg-card">
                                    {reportData.reservas.map((r: any) => (
                                        <tr key={r.id_reserva} className="hover:bg-gray-50/80 dark:hover:bg-muted/20 transition-colors group">
                                            <td className="px-5 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-foreground text-[13px]">{r.codigo_reserva}</td>
                                            <td className="px-5 py-4 text-[13px] font-medium text-gray-900 dark:text-foreground">{r.nombre_inmueble}</td>
                                            <td className="px-5 py-4 whitespace-nowrap text-[13px] text-gray-700 dark:text-gray-300">{r.nombre_huesped} {r.apellido_huesped}</td>
                                            <td className="px-5 py-4 whitespace-nowrap text-[13px] capitalize">{r.plataforma_origen || 'Directa'}</td>
                                            <td className="px-5 py-4 whitespace-nowrap text-[13px] text-gray-700 dark:text-gray-300">{formatDateLocal(r.fecha_inicio)}</td>
                                            <td className="px-5 py-4 whitespace-nowrap text-[13px] text-gray-700 dark:text-gray-300">{formatDateLocal(r.fecha_fin)}</td>
                                            <td className="px-5 py-4 whitespace-nowrap text-center text-[13px] text-gray-700 dark:text-gray-300 font-medium">{r.noches}</td>
                                            <td className="px-5 py-4 whitespace-nowrap font-bold text-right text-[13px]">{formatCurrency(r.total_reserva)}</td>
                                        </tr>
                                    ))}
                                    {reportData.reservas.length > 0 && (
                                        <tr className="bg-green-50 dark:bg-green-900/10 border-t-2 border-green-200 dark:border-green-900/30">
                                            <td colSpan={7} className="px-5 py-5 text-right font-bold text-green-800 dark:text-green-400 text-sm uppercase tracking-wider">Total Reservas:</td>
                                            <td className="px-5 py-5 font-bold text-right text-green-800 dark:text-green-400 text-lg">
                                                {formatCurrency(reportData.reservas.reduce((sum: number, r: any) => sum + Number(r.total_reserva || 0), 0))}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {reportData.reservas.length === 0 && <p className="text-center py-12 text-gray-500 dark:text-muted-foreground">No hay reservas en este periodo.</p>}
                        </div>
                    </div>

                    {/* Expenses Table */}
                    <div className="rounded-[1rem] border border-gray-100 dark:border-border overflow-hidden bg-white dark:bg-card shadow-sm w-full">
                        <div className="p-4 border-b border-gray-100 dark:border-border bg-white dark:bg-card flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-tourism-navy dark:text-foreground">Detalle de Gastos</h3>
                        </div>
                        <div className="overflow-x-auto w-full max-h-[400px] overflow-y-auto">
                            <table className="w-full text-sm text-left relative">
                                <thead className="bg-waiwa-sky dark:bg-waiwa-amber text-[#64748b] dark:text-muted-foreground text-[13px] font-semibold border-b border-gray-100 dark:border-border">
                                    <tr>
                                        <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Inmueble</th>
                                        <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Cuenta</th>
                                        <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Descripcion</th>
                                        <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black text-right">Importe</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-card">
                                    {Object.entries(
                                        reportData.gastos.reduce((acc: any, g: any) => {
                                            if (!acc[g.nombre_inmueble]) acc[g.nombre_inmueble] = {};
                                            if (!acc[g.nombre_inmueble][g.concepto]) acc[g.nombre_inmueble][g.concepto] = [];
                                            acc[g.nombre_inmueble][g.concepto].push(g);
                                            return acc;
                                        }, {})
                                    ).map(([inmueble, conceptos]: [string, any]) => {
                                        const subtotalInmueble = Object.values(conceptos).flat().reduce((sum: number, g: any) => sum + Number(g.monto || 0), 0);
                                        return (
                                            <React.Fragment key={inmueble}>
                                                {Object.entries(conceptos).map(([concepto, items]: [string, any]) => {
                                                    const subtotalConcepto = items.reduce((sum: number, g: any) => sum + Number(g.monto || 0), 0);
                                                    const isComision = String(concepto || '').toLowerCase().includes('comision') || String(concepto || '').toLowerCase().includes('comisión');

                                                    return (
                                                        <React.Fragment key={concepto}>
                                                            {isComision ? (
                                                                <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                                                                    <td className="px-5 py-3 text-[13px] font-bold text-gray-900">{items[0]?.nombre_inmueble}</td>
                                                                    <td className="px-5 py-3 text-[13px] text-gray-700 capitalize">{concepto.replace('_', ' ')}</td>
                                                                    <td className="px-5 py-3 text-[13px] text-gray-700">Total Admon</td>
                                                                    <td className="px-5 py-3 text-right font-medium text-gray-700 text-[13px]">{formatCurrency(-subtotalConcepto)}</td>
                                                                </tr>
                                                            ) : (
                                                                items.map((g: any, idx: number) => (
                                                                    <tr key={g.id_movimiento} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                                        <td className="px-5 py-3 text-[13px] font-bold text-gray-900">{idx === 0 ? g.nombre_inmueble : ''}</td>
                                                                        <td className="px-5 py-3 text-[13px] text-gray-700 capitalize">{idx === 0 ? g.concepto.replace('_', ' ') : ''}</td>
                                                                        <td className="px-5 py-3 text-[13px] text-gray-700">{g.descripcion}</td>
                                                                        <td className="px-5 py-3 text-right font-medium text-gray-700 text-[13px]">{formatCurrency(-g.monto)}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                            {!isComision && (
                                                                <tr className="border-b border-gray-100 bg-gray-50/30">
                                                                    <td colSpan={3} className="px-5 py-2 text-right font-bold text-[12px] uppercase">Subtotal</td>
                                                                    <td className="px-5 py-2 text-right font-bold text-[13px]">{formatCurrency(-subtotalConcepto)}</td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                                <tr className="bg-gray-100/50">
                                                    <td colSpan={3} className="px-5 py-3 text-right font-bold text-[13px] uppercase tracking-wider">Subtotal {inmueble}</td>
                                                    <td className="px-5 py-3 text-right font-bold text-[14px]">{formatCurrency(-subtotalInmueble)}</td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })}
                                    {reportData.gastos.length > 0 && (
                                        <tr className="bg-gray-200/50">
                                            <td colSpan={3} className="px-5 py-4 text-left font-bold text-tourism-navy text-[14px] uppercase tracking-widest">Total</td>
                                            <td className="px-5 py-4 text-right font-bold text-tourism-navy text-[15px]">
                                                {formatCurrency(-reportData.gastos.reduce((sum: number, g: any) => sum + Number(g.monto || 0), 0))}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {reportData.gastos.length === 0 && <p className="text-center py-12 text-gray-500 dark:text-muted-foreground">No hay gastos en este periodo.</p>}
                        </div>
                    </div>

                    {/* Resumen por Inmueble - Ingresos/Egresos */}
                    <div className="rounded-[1rem] border border-gray-100 overflow-hidden bg-white shadow-sm w-full">
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <h3 className="text-lg font-bold text-tourism-navy">Resumen por inmueble - Ingresos/Egresos</h3>
                        </div>
                        <div className="overflow-x-auto w-full max-h-[400px] overflow-y-auto">
                            <table className="w-full text-sm text-left relative">
                                <thead className="bg-waiwa-sky text-[#64748b] text-[13px] font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-4">Inmueble</th>
                                        <th className="px-5 py-4 text-center">Ingreso</th>
                                        <th className="px-5 py-4 text-center">Egreso</th>
                                        <th className="px-5 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(
                                        [...reportData.reservas, ...reportData.gastos].reduce((acc: any, item: any) => {
                                            const name = item.nombre_inmueble;
                                            if (!acc[name]) acc[name] = { ingreso: 0, egreso: 0 };
                                            if (item.total_reserva) acc[name].ingreso += Number(item.total_reserva);
                                            if (item.monto) acc[name].egreso += Number(item.monto);
                                            return acc;
                                        }, {})
                                    ).map(([name, totals]: [string, any]) => (
                                        <tr key={name} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="px-5 py-3 font-bold text-gray-900">{name}</td>
                                            <td className="px-5 py-3 text-center">{formatCurrency(totals.ingreso)}</td>
                                            <td className="px-5 py-3 text-center text-red-600">-{formatCurrency(totals.egreso)}</td>
                                            <td className="px-5 py-3 text-right font-bold">{formatCurrency(totals.ingreso - totals.egreso)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50">
                                        <td className="px-5 py-4 font-bold uppercase">Total</td>
                                        <td className="px-5 py-4 text-center font-bold text-green-700">{formatCurrency(reportData.resumen.totalIngresos)}</td>
                                        <td className="px-5 py-4 text-center font-bold text-red-600">-{formatCurrency(reportData.resumen.totalEgresos)}</td>
                                        <td className="px-5 py-3 text-right font-bold text-tourism-navy">{formatCurrency(reportData.resumen.balance)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Resumen por Inmueble - Indicadores */}
                    <div className="rounded-[1rem] border border-gray-100 overflow-hidden bg-white shadow-sm w-full">
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <h3 className="text-lg font-bold text-tourism-navy">Resumen por inmueble - Indicadores</h3>
                        </div>
                        <div className="overflow-x-auto w-full max-h-[400px] overflow-y-auto">
                            <table className="w-full text-sm text-left relative">
                                <thead className="bg-waiwa-sky text-[#64748b] text-[13px] font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-4">Inmueble</th>
                                        <th className="px-5 py-4 text-center">Noches</th>
                                        <th className="px-5 py-4 text-center font-medium">% Ocupacion</th>
                                        <th className="px-5 py-4 text-center">ADR</th>
                                        <th className="px-5 py-4 text-center">RevPAR</th>
                                        <th className="px-5 py-4 text-right">Utilidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Si hay datos de KPI de edificio o unidad, mostrarlos aquí prioritariamente */}
                                    {kpiData?.type === 'building' ? (
                                        (kpiData.data as BuildingKpis).unidades.map((unit) => (
                                            <tr key={unit.id_inmueble} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="px-5 py-3 font-bold text-gray-900">{unit.nombre}</td>
                                                <td className="px-5 py-3 text-center">{unit.noches_ocupadas}</td>
                                                <td className="px-5 py-3 text-center">{unit.ocupacion.toFixed(1)}%</td>
                                                <td className="px-5 py-3 text-center">{formatCurrency(unit.adr)}</td>
                                                <td className="px-5 py-3 text-center">{formatCurrency(unit.revpar)}</td>
                                                <td className="px-5 py-3 text-right font-bold text-green-700">{formatCurrency(unit.utilidad)}</td>
                                            </tr>
                                        ))
                                    ) : kpiData?.type === 'unit' ? (
                                        <tr className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="px-5 py-3 font-bold text-gray-900">{(kpiData.data as UnitKpis).nombre}</td>
                                            <td className="px-5 py-3 text-center">{(kpiData.data as UnitKpis).noches_ocupadas}</td>
                                            <td className="px-5 py-3 text-center">{(kpiData.data as UnitKpis).ocupacion.toFixed(1)}%</td>
                                            <td className="px-5 py-3 text-center">{formatCurrency((kpiData.data as UnitKpis).adr)}</td>
                                            <td className="px-5 py-3 text-center">{formatCurrency((kpiData.data as UnitKpis).revpar)}</td>
                                            <td className="px-5 py-3 text-right font-bold text-green-700">{formatCurrency((kpiData.data as UnitKpis).utilidad)}</td>
                                        </tr>
                                    ) : (
                                        /* Fallback a agregación básica de reportes si no hay kpiData */
                                        Object.entries(
                                            reportData.reservas.reduce((acc: any, r: any) => {
                                                const name = r.nombre_inmueble;
                                                if (!acc[name]) acc[name] = { noches: 0, ingreso: 0, count: 0 };
                                                acc[name].noches += Number(r.noches);
                                                acc[name].ingreso += Number(r.total_reserva);
                                                acc[name].count += 1;
                                                return acc;
                                            }, {})
                                        ).map(([name, data]: [string, any]) => {
                                            const start = new Date(filters.fechaInicio || new Date());
                                            const end = new Date(filters.fechaFin || new Date());
                                            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
                                            const occ = days > 0 ? (data.noches / days) * 100 : 0;
                                            return (
                                                <tr key={name} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="px-5 py-3 font-bold text-gray-900">{name}</td>
                                                    <td className="px-5 py-3 text-center">{data.noches}</td>
                                                    <td className="px-5 py-3 text-center">{occ.toFixed(2)}%</td>
                                                    <td className="px-5 py-3 text-center">{formatCurrency(data.ingreso / (data.noches || 1))}</td>
                                                    <td className="px-5 py-3 text-center">{formatCurrency(data.ingreso / (days || 1))}</td>
                                                    <td className="px-5 py-3 text-right font-bold text-green-700">{formatCurrency(data.ingreso)}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    {/* Mostrar totales si kpiData está presente */}
                                    {kpiData?.type === 'building' && (
                                        <tr className="bg-gray-50 font-bold border-t-2">
                                            <td className="px-5 py-4 uppercase">Total Edificio</td>
                                            <td className="px-5 py-4 text-center">{(kpiData.data as BuildingKpis).noches_ocupadas_total}</td>
                                            <td className="px-5 py-4 text-center">{(kpiData.data as BuildingKpis).ocupacion_global.toFixed(1)}%</td>
                                            <td className="px-5 py-4 text-center">-</td>
                                            <td className="px-5 py-4 text-center">{formatCurrency((kpiData.data as BuildingKpis).revpar_edificio)}</td>
                                            <td className="px-5 py-4 text-right text-tourism-navy text-lg">{formatCurrency((kpiData.data as BuildingKpis).utilidad_total)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
