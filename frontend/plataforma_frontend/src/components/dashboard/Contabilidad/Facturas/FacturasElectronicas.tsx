'use client';
import React, { useEffect, useState } from 'react';
import {
    getFacturas, getClientesFacturacion, getNumeracionFactus,
    createFactura, enviarFacturaDian, enviarFacturaEmail, descargarFacturaPdf,
    IFacturaElectronica, IFacturaItem
} from '../../../../auth/factusApi';
import NuevaFactura from '../NuevaFactura';

const EMPTY_ITEM: IFacturaItem = { descripcion: '', cantidad: 1, precio_unitario: 0, tributos: [] };
const ESTADO_COLORS: Record<string, { bg: string; text: string }> = {
    borrador: { bg: '#1e293b', text: '#94a3b8' },
    enviada: { bg: '#1e3a5f', text: '#93c5fd' },
    aprobada: { bg: '#064e3b', text: '#6ee7b7' },
    rechazada: { bg: '#450a0a', text: '#fca5a5' },
};

export default function FacturasElectronicas() {
    const [facturas, setFacturas] = useState<IFacturaElectronica[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [clientes, setClientes] = useState<any[]>([]);
    const [numeracion, setNumeracion] = useState<any[]>([]);
    const [form, setForm] = useState<Partial<IFacturaElectronica>>({
        fecha_emision: new Date().toISOString().split('T')[0],
        items: [{ ...EMPTY_ITEM }],
    });
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const load = async () => {
        setLoading(true);
        const r = await getFacturas({ estado: filtroEstado || undefined, page, limit: 20 });
        if (r.success && r.data) { setFacturas(r.data.items || []); setTotal(r.data.total || 0); }
        setLoading(false);
    };

    useEffect(() => { load(); }, [page, filtroEstado]);

    const openCreate = async () => {
        setError('');
        setShowForm(true);
    };

    const addItem = () => setForm(f => ({ ...f, items: [...(f.items || []), { ...EMPTY_ITEM }] }));
    const removeItem = (i: number) => setForm(f => ({ ...f, items: (f.items || []).filter((_, idx) => idx !== i) }));
    const updateItem = (i: number, field: keyof IFacturaItem, value: any) =>
        setForm(f => ({ ...f, items: (f.items || []).map((item, idx) => idx === i ? { ...item, [field]: value } : item) }));

    const calcTotal = () => (form.items || []).reduce((s, item) => s + (item.cantidad || 0) * (item.precio_unitario || 0), 0);

    const handleCreate = async () => {
        if (!form.id_cliente || !form.id_rango_numeracion) return setError('Selecciona un cliente y rango de numeración');
        setLoading(true); setError('');
        const r = await createFactura({ ...form, items: form.items || [] } as any);
        setLoading(false);
        if (r.success) {
            setSuccess('Factura creada como borrador'); setShowForm(false); load();
            setTimeout(() => setSuccess(''), 4000);
        } else setError(r.message || 'Error al crear factura');
    };

    const handleEnviar = async (id: number) => {
        if (!confirm('¿Enviar esta factura a Factus y la DIAN?')) return;
        setActionLoading(id);
        const r = await enviarFacturaDian(id);
        setActionLoading(null);
        if (r.success) { setSuccess('✅ Factura enviada a DIAN correctamente'); load(); setTimeout(() => setSuccess(''), 5000); }
        else setError(r.message || 'Error al enviar');
    };

    const handleEmail = async (id: number) => {
        const email = prompt('Email del destinatario (dejar vacío para usar el del cliente):');
        if (email === null) return;
        const r = await enviarFacturaEmail(id, email || undefined);
        if (r.success) setSuccess('📧 Email enviado'); else setError(r.message || 'Error');
        setTimeout(() => { setSuccess(''); setError(''); }, 4000);
    };

    if (showForm) {
        return <NuevaFactura onCancel={() => { setShowForm(false); load(); }} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex-1 md:flex space-y-4 md:space-y-0 justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">🧾 Facturas Electrónicas</h2>
                    <p className="text-slate-400 text-sm mt-1">{total} facturas en total</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer">
                        + Nueva factura
                    </button>
                </div>
            </div>

            {success && <div className="px-4 py-3 rounded-lg bg-emerald-900/50 text-emerald-400 border border-emerald-800 text-sm">{success}</div>}
            {error && <div className="px-4 py-3 rounded-lg bg-red-900/50 text-red-400 border border-red-800 text-sm">⚠️ {error}</div>}

            {/* Filtros */}
            <div className="flex gap-2">
                {['', 'borrador', 'enviada', 'aprobada', 'rechazada'].map(e => (
                    <button key={e} onClick={() => { setFiltroEstado(e); setPage(1); }}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            filtroEstado === e 
                                ? 'bg-indigo-500 text-white' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}>
                        {e || 'Todos'}
                    </button>
                ))}
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto bg-slate-900 rounded-xl shadow-sm border border-slate-800">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 bg-slate-800 uppercase font-semibold border-b border-slate-700">
                        <tr>
                            {['#', 'Cliente', 'Fecha', 'Total', 'Estado', 'DIAN', 'Acciones'].map(h => (
                                <th key={h} className="px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400 bg-slate-900">Cargando...</td></tr>
                        ) : facturas.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400 bg-slate-900">No hay facturas</td></tr>
                        ) : facturas.map(f => {
                            const colors = ESTADO_COLORS[f.estado || 'borrador'] || ESTADO_COLORS.borrador;
                            return (
                                <tr key={f.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 text-indigo-400 font-medium whitespace-nowrap">
                                        {f.prefijo}{f.numero || `FT-${f.id}`}
                                    </td>
                                    <td className="px-4 py-3 text-slate-200">
                                        {f.razon_social || `${f.nombres || ''} ${f.apellidos || ''}`.trim() || `ID:${f.id_cliente}`}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{f.fecha_emision?.slice(0, 10)}</td>
                                    <td className="px-4 py-3 text-amber-400 font-semibold whitespace-nowrap">
                                        ${Number(f.total || 0).toLocaleString('es-CO')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span style={{ background: colors.bg, color: colors.text }} className="px-3 py-1 rounded-full text-[11px] font-semibold">
                                            {f.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {f.estado_dian ? (
                                            <span className={`text-[11px] font-medium ${f.estado_dian === 'aprobada' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {f.estado_dian === 'aprobada' ? '✅' : '⏳'} {f.estado_dian}
                                            </span>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {f.estado === 'borrador' && (
                                                <button onClick={() => handleEnviar(f.id!)} disabled={actionLoading === f.id}
                                                    className="px-3 py-1 rounded-md bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900 hover:text-indigo-200 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer">
                                                    {actionLoading === f.id ? '...' : '📤 Enviar'}
                                                </button>
                                            )}
                                            {f.estado !== 'borrador' && (
                                                <>
                                                    <button onClick={() => descargarFacturaPdf(f.id!)}
                                                        className="px-3 py-1 rounded-md bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/70 text-xs font-semibold transition-colors cursor-pointer">
                                                        📄 PDF
                                                    </button>
                                                    <button onClick={() => handleEmail(f.id!)}
                                                        className="px-3 py-1 rounded-md bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer">
                                                        📧 Email
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {total > 20 && (
                <div className="flex gap-2 justify-center mt-6">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-sm font-semibold disabled:opacity-40 transition-colors cursor-pointer">← Anterior</button>
                    <span className="text-slate-400 px-3 py-2 text-sm font-medium">Pág {page}</span>
                    <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-sm font-semibold disabled:opacity-40 transition-colors cursor-pointer">Siguiente →</button>
                </div>
            )}
        </div>
    );
}
