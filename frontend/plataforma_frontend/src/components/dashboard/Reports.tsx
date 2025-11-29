import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Calendar, Filter, Download, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { getReporteFinanciero, ReporteFinancieroFilters, getOpcionesReporte, IOpcionesReporte } from '../../services/reportes.service';
import { getInmueblesApi } from '../../auth/getInmueblesApi';
import { getPropietariosApi } from '../../auth/propietariosApi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../atoms/Input';

export default function NuevoReporteFinanciero() {
    const [filters, setFilters] = useState<ReporteFinancieroFilters>({
        fechaInicio: '',
        fechaFin: '',
    });
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [opciones, setOpciones] = useState<IOpcionesReporte | null>(null);
    const [mounted, setMounted] = useState(false);
    const [filterMode, setFilterMode] = useState<'inmueble' | 'propietario'>('inmueble');

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
                    const propietariosData = await getPropietariosApi(filters.empresaId);
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
            const response = await getReporteFinanciero(filters);

            // Robust data extraction to handle different nesting levels
            let payload = null;

            if (response.data && response.data.resumen) {
                // Case 1: Standard response { isError: false, data: { ... }, ... }
                payload = response.data;
            } else if (response.data && response.data.data && response.data.data.resumen) {
                // Case 2: Double nested { data: { data: { ... } } }
                payload = response.data.data;
            } else if (response.resumen) {
                // Case 3: Direct payload { reservas: ..., resumen: ... }
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
        if (!reportRef.current) return;

        try {
            const canvas = await html2canvas(reportRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate how many pages we need
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Add additional pages if needed
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save('reporte_financiero.pdf');
        } catch (err) {
            console.error('Error generando PDF', err);
            setError('Error al generar el PDF');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount || 0);
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

                        {/* Filter By Selector */}
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
                            <Button variant="outline" onClick={handleDownloadPDF} className="flex gap-2">
                                <Download /> Descargar PDF
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
                                <p className="text-2xl font-bold text-green-800">{formatCurrency(reportData.resumen.totalIngresos)}</p>
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
                                <h3 className="text-blue-700 font-medium">Balance</h3>
                                <p className="text-2xl font-bold text-blue-800">{formatCurrency(reportData.resumen.balance)}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Indicators */}
                    <Card>
                        <CardHeader><CardTitle>Indicadores Clave</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Noches Ocupadas</p>
                                <p className="text-xl font-semibold">{reportData.indicadores.nochesOcupadas}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">% Ocupación (Est.)</p>
                                <p className="text-xl font-semibold">{reportData.indicadores.porcentajeOcupacion}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Reservas</p>
                                <p className="text-xl font-semibold">{reportData.indicadores.totalReservas}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Ingreso Promedio / Reserva</p>
                                <p className="text-xl font-semibold">{formatCurrency(reportData.indicadores.ingresoPorReserva)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reservations Table */}
                    <Card>
                        <CardHeader><CardTitle>Detalle de Reservas</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Código</th>
                                            <th className="px-4 py-3">Inmueble</th>
                                            <th className="px-4 py-3">Huésped</th>
                                            <th className="px-4 py-3">Plataforma</th>
                                            <th className="px-4 py-3">Ingreso</th>
                                            <th className="px-4 py-3">Salida</th>
                                            <th className="px-4 py-3">Noches</th>
                                            <th className="px-4 py-3">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.reservas.map((r: any) => (
                                            <tr key={r.id_reserva} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium">{r.codigo_reserva}</td>
                                                <td className="px-4 py-3">{r.nombre_inmueble}</td>
                                                <td className="px-4 py-3">{r.nombre_huesped} {r.apellido_huesped}</td>
                                                <td className="px-4 py-3 capitalize">{r.plataforma_origen || 'N/A'}</td>
                                                <td className="px-4 py-3">{new Date(r.fecha_inicio).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">{new Date(r.fecha_fin).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">{r.noches}</td>
                                                <td className="px-4 py-3 font-semibold">{formatCurrency(r.total_reserva)}</td>
                                            </tr>
                                        ))}
                                        {reportData.reservas.length > 0 && (
                                            <tr className="bg-green-50 border-t-2 border-green-200">
                                                <td colSpan={7} className="px-4 py-3 text-right font-bold text-green-800">Total Reservas:</td>
                                                <td className="px-4 py-3 font-bold text-green-800 text-lg">
                                                    {formatCurrency(reportData.reservas.reduce((sum: number, r: any) => sum + Number(r.total_reserva || 0), 0))}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {reportData.reservas.length === 0 && <p className="text-center py-4 text-gray-500">No hay reservas en este periodo.</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Expenses Table */}
                    <Card>
                        <CardHeader><CardTitle>Detalle de Gastos</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3">Inmueble</th>
                                            <th className="px-4 py-3">Concepto</th>
                                            <th className="px-4 py-3">Descripción</th>
                                            <th className="px-4 py-3">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.gastos.map((g: any) => (
                                            <tr key={g.id_movimiento} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">{new Date(g.fecha).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">{g.nombre_inmueble}</td>
                                                <td className="px-4 py-3 capitalize">{g.concepto.replace('_', ' ')}</td>
                                                <td className="px-4 py-3">{g.descripcion}</td>
                                                <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(g.monto)}</td>
                                            </tr>
                                        ))}
                                        {reportData.gastos.length > 0 && (
                                            <tr className="bg-red-50 border-t-2 border-red-200">
                                                <td colSpan={4} className="px-4 py-3 text-right font-bold text-red-800">Total Gastos:</td>
                                                <td className="px-4 py-3 font-bold text-red-800 text-lg">
                                                    {formatCurrency(reportData.gastos.reduce((sum: number, g: any) => sum + Number(g.monto || 0), 0))}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {reportData.gastos.length === 0 && <p className="text-center py-4 text-gray-500">No hay gastos en este periodo.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
