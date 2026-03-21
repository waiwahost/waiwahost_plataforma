'use client';
import React, { useEffect, useState } from 'react';
import {
    getNotasCredito, createNotaCredito, enviarNotaCreditoDian,
    getNotasDebito, createNotaDebito, enviarNotaDebitoDian,
    getDocumentosSoporte, createDocumentoSoporte, enviarDocumentoSoporteDian,
    getDeclaracionesTerceros, generarDeclaracionDesdeMovimientos,
    getNumeracionFactus, getClientesFacturacion,
    IFacturaItem, INotaDebito, IDocumentoSoporte,
} from '../../../auth/factusApi';

// ─── Estilos ─────────────────────────────────────────────────
const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid #2d3748', background: '#1a2234', color: '#e2e8f0',
    fontSize: 13, outline: 'none', boxSizing: 'border-box',
};
const lbl: React.CSSProperties = { color: '#94a3b8', fontSize: 12, marginBottom: 4, display: 'block' };
const btnP: React.CSSProperties = {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 600,
    cursor: 'pointer', fontSize: 13,
};
const card: React.CSSProperties = {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden', marginBottom: 24,
};
const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const modal: React.CSSProperties = {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 28,
    width: 640, maxHeight: '92vh', overflowY: 'auto',
};

// ─── Tipos ────────────────────────────────────────────────────
type Tab = 'notas-credito' | 'notas-debito' | 'doc-soporte' | 'declaraciones';
const EMPTY_ITEM: IFacturaItem = { descripcion: '', cantidad: 1, precio_unitario: 0 };

const TAB_CONFIG: Record<Tab, { label: string; icon: string }> = {
    'notas-credito': { label: 'Notas de Crédito', icon: '📝' },
    'notas-debito': { label: 'Notas de Débito', icon: '📋' },
    'doc-soporte': { label: 'Documentos Soporte', icon: '🗂️' },
    'declaraciones': { label: 'Declaraciones Terceros', icon: '📑' },
};

export default function FactusDocumentos() {
    const [tab, setTab] = useState<Tab>('notas-credito');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [numeracion, setNumeracion] = useState<any[]>([]);
    const [clientes, setClientes] = useState<any[]>([]);

    // ─── Nota Débito Form ──────────────────────────────────────
    const [showNotaDebito, setShowNotaDebito] = useState(false);
    const [notaDebitoForm, setNotaDebitoForm] = useState<Partial<INotaDebito>>({
        fecha_emision: new Date().toISOString().split('T')[0],
        codigo_motivo: '1',
        items: [{ ...EMPTY_ITEM }],
    });

    // ─── Documento Soporte Form ────────────────────────────────
    const [showDocSoporte, setShowDocSoporte] = useState(false);
    const [docSoporteForm, setDocSoporteForm] = useState<Partial<IDocumentoSoporte>>({
        fecha_emision: new Date().toISOString().split('T')[0],
        numero_documento_proveedor: '',
        nombre_proveedor: '',
        items: [{ ...EMPTY_ITEM }],
    });

    // ─── Auto Declaración Form ─────────────────────────────────
    const [showAutoDecl, setShowAutoDecl] = useState(false);
    const [autoForm, setAutoForm] = useState({ id_propietario: '', id_rango_numeracion: '', periodo_inicio: '', periodo_fin: '' });

    // ─── Cargar datos ──────────────────────────────────────────
    const load = async () => {
        setLoading(true);
        let r: any;
        if (tab === 'notas-credito') r = await getNotasCredito();
        else if (tab === 'notas-debito') r = await getNotasDebito();
        else if (tab === 'doc-soporte') r = await getDocumentosSoporte();
        else r = await getDeclaracionesTerceros();
        if (r.success && r.data) setItems(r.data.items || r.data || []);
        setLoading(false);
    };

    const loadMeta = async () => {
        const [nr, cr] = await Promise.all([getNumeracionFactus(), getClientesFacturacion({ limit: 100 })]);
        if (nr.success && nr.data) setNumeracion(nr.data);
        if (cr.success && cr.data) setClientes(cr.data.items || []);
    };

    useEffect(() => { load(); }, [tab]);
    useEffect(() => { loadMeta(); }, []);

    const flash = (msg: string, isError = false) => {
        if (isError) setError(msg); else setSuccess(msg);
        setTimeout(() => { setSuccess(''); setError(''); }, 5000);
    };

    // ─── Enviar a DIAN ─────────────────────────────────────────
    const handleEnviar = async (id: number) => {
        if (!confirm('¿Enviar a DIAN?')) return;
        setActionLoading(id);
        let r: any;
        if (tab === 'notas-credito') r = await enviarNotaCreditoDian(id);
        else if (tab === 'notas-debito') r = await enviarNotaDebitoDian(id);
        else if (tab === 'doc-soporte') r = await enviarDocumentoSoporteDian(id);
        else r = { success: false, message: 'Endpoint en desarrollo' };
        setActionLoading(null);
        if (r.success) { flash('✅ Enviado a DIAN correctamente'); load(); }
        else flash(r.message || 'Error al enviar', true);
    };

    // ─── Crear Nota Débito ─────────────────────────────────────
    const submitNotaDebito = async () => {
        if (!notaDebitoForm.id_rango_numeracion) return flash('Selecciona un rango de numeración', true);
        setLoading(true);
        const r = await createNotaDebito({ ...notaDebitoForm, items: notaDebitoForm.items || [] } as INotaDebito);
        setLoading(false);
        if (r.success) { flash('✅ Nota de débito creada'); setShowNotaDebito(false); load(); }
        else flash(r.message || 'Error', true);
    };

    // ─── Crear Documento Soporte ───────────────────────────────
    const submitDocSoporte = async () => {
        if (!docSoporteForm.id_rango_numeracion || !docSoporteForm.numero_documento_proveedor) {
            return flash('Completa los campos obligatorios', true);
        }
        setLoading(true);
        const r = await createDocumentoSoporte({ ...docSoporteForm, items: docSoporteForm.items || [] } as IDocumentoSoporte);
        setLoading(false);
        if (r.success) { flash('✅ Documento soporte creado'); setShowDocSoporte(false); load(); }
        else flash(r.message || 'Error', true);
    };

    // ─── Auto-generar Declaración ──────────────────────────────
    const handleAutoDecl = async () => {
        if (!autoForm.id_propietario || !autoForm.id_rango_numeracion || !autoForm.periodo_inicio || !autoForm.periodo_fin) {
            return flash('Completa todos los campos', true);
        }
        setLoading(true);
        const r = await generarDeclaracionDesdeMovimientos({
            id_propietario: Number(autoForm.id_propietario),
            id_rango_numeracion: Number(autoForm.id_rango_numeracion),
            periodo_inicio: autoForm.periodo_inicio,
            periodo_fin: autoForm.periodo_fin,
        });
        setLoading(false);
        setShowAutoDecl(false);
        if (r.success) { flash('✅ Declaración generada automáticamente'); load(); }
        else flash(r.message || 'Error al generar', true);
    };

    // ─── Items helper ──────────────────────────────────────────
    const ItemsEditor = ({ items, onChange }: { items: IFacturaItem[]; onChange: (items: IFacturaItem[]) => void }) => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ ...lbl, margin: 0, color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>Líneas</label>
                <button onClick={() => onChange([...items, { ...EMPTY_ITEM }])} style={{ ...btnP, padding: '4px 12px', fontSize: 12 }}>+ Línea</button>
            </div>
            {items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 60px 110px auto', gap: 6, marginBottom: 6, alignItems: 'end' }}>
                    <div>
                        {i === 0 && <label style={lbl}>Descripción</label>}
                        <input style={inp} value={item.descripcion} placeholder="Ej: Servicio de alojamiento" onChange={e => onChange(items.map((it, idx) => idx === i ? { ...it, descripcion: e.target.value } : it))} />
                    </div>
                    <div>
                        {i === 0 && <label style={lbl}>Cant.</label>}
                        <input type="number" style={inp} value={item.cantidad} min={1} onChange={e => onChange(items.map((it, idx) => idx === i ? { ...it, cantidad: Number(e.target.value) } : it))} />
                    </div>
                    <div>
                        {i === 0 && <label style={lbl}>Precio unit.</label>}
                        <input type="number" style={inp} value={item.precio_unitario} min={0} onChange={e => onChange(items.map((it, idx) => idx === i ? { ...it, precio_unitario: Number(e.target.value) } : it))} />
                    </div>
                    <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} style={{ padding: '9px', borderRadius: 8, background: '#450a0a', color: '#fca5a5', border: 'none', cursor: 'pointer', marginTop: i === 0 ? 16 : 0 }}>✕</button>
                </div>
            ))}
            <div style={{ textAlign: 'right', marginTop: 6 }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>Total: </span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                    ${items.reduce((s, it) => s + (it.cantidad || 0) * (it.precio_unitario || 0), 0).toLocaleString('es-CO')}
                </span>
            </div>
        </div>
    );

    const NumeracionSelect = ({ value, onChange }: { value?: number; onChange: (v: number) => void }) => (
        <select style={{ ...inp }} value={value || ''} onChange={e => onChange(Number(e.target.value))}>
            <option value="">— Seleccionar rango —</option>
            {numeracion.length === 0
                ? <option disabled>Sin rangos disponibles (configura Factus primero)</option>
                : numeracion.map((n: any) => <option key={n.id} value={n.id}>{n.prefix || ''}{n.next_number ?? ''} · {n.document || n.name || `ID ${n.id}`}</option>)}
        </select>
    );

    // ─── Render tabla ──────────────────────────────────────────
    const canCreate = tab === 'notas-debito' || tab === 'doc-soporte';

    return (
        <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h2 style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 700, margin: 0 }}>📄 Documentos Fiscales</h2>
                    <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Notas · Soporte · Declaraciones de terceros</p>
                </div>
            </div>

            {success && <div style={{ padding: '10px 16px', borderRadius: 8, background: '#064e3b', color: '#6ee7b7', marginBottom: 16, fontSize: 13 }}>{success}</div>}
            {error && <div style={{ padding: '10px 16px', borderRadius: 8, background: '#450a0a', color: '#fca5a5', marginBottom: 16, fontSize: 13 }}>⚠️ {error} <button onClick={() => setError('')} style={{ marginLeft: 10, background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>✕</button></div>}

            {/* Tabs + botones de acción */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                {(Object.keys(TAB_CONFIG) as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        style={{
                            padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            background: tab === t ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1e293b',
                            color: tab === t ? '#fff' : '#94a3b8', transition: 'all 0.2s'
                        }}>
                        {TAB_CONFIG[t].icon} {TAB_CONFIG[t].label}
                    </button>
                ))}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    {tab === 'notas-debito' && (
                        <button onClick={() => { setShowNotaDebito(true); setNotaDebitoForm({ fecha_emision: new Date().toISOString().split('T')[0], codigo_motivo: '1', items: [{ ...EMPTY_ITEM }] }); }}
                            style={btnP}>+ Nueva nota débito</button>
                    )}
                    {tab === 'doc-soporte' && (
                        <button onClick={() => { setShowDocSoporte(true); setDocSoporteForm({ fecha_emision: new Date().toISOString().split('T')[0], numero_documento_proveedor: '', nombre_proveedor: '', items: [{ ...EMPTY_ITEM }] }); }}
                            style={btnP}>+ Nuevo documento soporte</button>
                    )}
                    {tab === 'declaraciones' && (
                        <button onClick={() => setShowAutoDecl(true)} style={{ ...btnP, background: '#0f766e' }}>
                            ⚡ Auto-generar desde movimientos
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla */}
            <div style={card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: '#1e293b' }}>
                            {['ID', tab === 'declaraciones' ? 'Propietario / Período' : 'Fecha', 'Total', 'Estado', 'Acciones'].map(h => (
                                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Cargando...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                                No hay {TAB_CONFIG[tab].label.toLowerCase()} registradas
                            </td></tr>
                        ) : items.map((item: any) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                <td style={{ padding: '11px 14px', color: '#818cf8', fontWeight: 600 }}>#{item.id}</td>
                                <td style={{ padding: '11px 14px', color: '#94a3b8' }}>
                                    {tab === 'declaraciones' ? (
                                        <div>
                                            <span style={{ color: '#e2e8f0' }}>{item.propietario_nombre || `Propietario #${item.id_propietario}`}</span>
                                            {item.periodo_inicio && <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>{item.periodo_inicio?.slice(0, 10)} → {item.periodo_fin?.slice(0, 10)}</span>}
                                        </div>
                                    ) : (item.fecha_emision || '').slice(0, 10)}
                                </td>
                                <td style={{ padding: '11px 14px', color: '#fbbf24', fontWeight: 600 }}>
                                    ${Number(item.total || 0).toLocaleString('es-CO')}
                                </td>
                                <td style={{ padding: '11px 14px' }}>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                        background: item.estado === 'enviada' || item.estado === 'aprobada' ? '#1e3a5f' : '#1e293b',
                                        color: item.estado === 'enviada' || item.estado === 'aprobada' ? '#93c5fd' : '#94a3b8'
                                    }}>
                                        {item.estado || 'borrador'}
                                    </span>
                                </td>
                                <td style={{ padding: '11px 14px' }}>
                                    {(item.estado === 'borrador' || !item.estado) && tab !== 'declaraciones' && (
                                        <button onClick={() => handleEnviar(item.id)} disabled={actionLoading === item.id}
                                            style={{ padding: '4px 12px', borderRadius: 6, background: '#1e3a5f', color: '#93c5fd', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                            {actionLoading === item.id ? '...' : '📤 Enviar DIAN'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ═══ MODAL: NOTA DE DÉBITO ══════════════════════════ */}
            {showNotaDebito && (
                <div style={overlay} onClick={e => { if (e.target === e.currentTarget) setShowNotaDebito(false); }}>
                    <div style={modal}>
                        <h3 style={{ color: '#e2e8f0', margin: '0 0 20px', fontWeight: 700, fontSize: 17 }}>📋 Nueva Nota de Débito</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                            <div>
                                <label style={lbl}>Rango de numeración *</label>
                                <NumeracionSelect value={notaDebitoForm.id_rango_numeracion} onChange={v => setNotaDebitoForm(f => ({ ...f, id_rango_numeracion: v }))} />
                            </div>
                            <div>
                                <label style={lbl}>Fecha emisión *</label>
                                <input type="date" style={inp} value={notaDebitoForm.fecha_emision} onChange={e => setNotaDebitoForm(f => ({ ...f, fecha_emision: e.target.value }))} />
                            </div>
                            <div>
                                <label style={lbl}>Cliente (opcional)</label>
                                <select style={inp} value={notaDebitoForm.id_cliente || ''} onChange={e => setNotaDebitoForm(f => ({ ...f, id_cliente: Number(e.target.value) || undefined }))}>
                                    <option value="">— Sin cliente específico —</option>
                                    {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.razon_social || `${c.nombres || ''} ${c.apellidos || ''}`.trim()} — {c.numero_documento}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={lbl}>Motivo *</label>
                                <select style={inp} value={notaDebitoForm.codigo_motivo} onChange={e => setNotaDebitoForm(f => ({ ...f, codigo_motivo: e.target.value as any }))}>
                                    <option value="1">1 — Intereses</option>
                                    <option value="2">2 — Gastos por cobrar</option>
                                    <option value="3">3 — Cambio del valor de la operación</option>
                                </select>
                            </div>
                            <div>
                                <label style={lbl}>Factura referencia ID (opcional)</label>
                                <input type="number" style={inp} value={notaDebitoForm.id_factura_referencia || ''} placeholder="ID de la factura original" onChange={e => setNotaDebitoForm(f => ({ ...f, id_factura_referencia: Number(e.target.value) || undefined }))} />
                            </div>
                            <div style={{ gridColumn: '1/-1' }}>
                                <label style={lbl}>Descripción del motivo</label>
                                <input style={inp} value={notaDebitoForm.descripcion_motivo || ''} placeholder="Ej: Ajuste por diferencia en precio pactado..." onChange={e => setNotaDebitoForm(f => ({ ...f, descripcion_motivo: e.target.value }))} />
                            </div>
                        </div>
                        <ItemsEditor items={notaDebitoForm.items || []} onChange={items => setNotaDebitoForm(f => ({ ...f, items }))} />
                        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowNotaDebito(false)} style={{ padding: '9px 18px', borderRadius: 8, background: '#1e293b', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
                            <button style={btnP} onClick={submitNotaDebito} disabled={loading}>{loading ? 'Guardando...' : '💾 Crear nota débito'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL: DOCUMENTO SOPORTE ════════════════════════ */}
            {showDocSoporte && (
                <div style={overlay} onClick={e => { if (e.target === e.currentTarget) setShowDocSoporte(false); }}>
                    <div style={modal}>
                        <h3 style={{ color: '#e2e8f0', margin: '0 0 20px', fontWeight: 700, fontSize: 17 }}>🗂️ Nuevo Documento Soporte</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                            <div style={{ gridColumn: '1/-1' }}>
                                <label style={lbl}>Rango de numeración *</label>
                                <NumeracionSelect value={docSoporteForm.id_rango_numeracion} onChange={v => setDocSoporteForm(f => ({ ...f, id_rango_numeracion: v }))} />
                            </div>
                            <div>
                                <label style={lbl}>Nombre proveedor *</label>
                                <input style={inp} value={docSoporteForm.nombre_proveedor || ''} placeholder="Nombre completo o razón social" onChange={e => setDocSoporteForm(f => ({ ...f, nombre_proveedor: e.target.value }))} />
                            </div>
                            <div>
                                <label style={lbl}>Tipo documento proveedor</label>
                                <select style={inp} value={docSoporteForm.tipo_documento_proveedor || 'CC'} onChange={e => setDocSoporteForm(f => ({ ...f, tipo_documento_proveedor: e.target.value }))}>
                                    {['CC', 'NIT', 'CE', 'PP', 'TI', 'DIE'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={lbl}>N° documento proveedor *</label>
                                <input style={inp} value={docSoporteForm.numero_documento_proveedor || ''} placeholder="Ej: 900123456" onChange={e => setDocSoporteForm(f => ({ ...f, numero_documento_proveedor: e.target.value }))} />
                            </div>
                            <div>
                                <label style={lbl}>Fecha emisión *</label>
                                <input type="date" style={inp} value={docSoporteForm.fecha_emision} onChange={e => setDocSoporteForm(f => ({ ...f, fecha_emision: e.target.value }))} />
                            </div>
                            <div style={{ gridColumn: '1/-1' }}>
                                <label style={lbl}>Descripción</label>
                                <input style={inp} value={docSoporteForm.descripcion || ''} placeholder="Descripción del servicio o bien adquirido..." onChange={e => setDocSoporteForm(f => ({ ...f, descripcion: e.target.value }))} />
                            </div>
                        </div>
                        <ItemsEditor items={docSoporteForm.items || []} onChange={items => setDocSoporteForm(f => ({ ...f, items }))} />
                        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowDocSoporte(false)} style={{ padding: '9px 18px', borderRadius: 8, background: '#1e293b', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
                            <button style={btnP} onClick={submitDocSoporte} disabled={loading}>{loading ? 'Guardando...' : '💾 Crear documento soporte'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL: AUTO DECLARACIÓN ════════════════════════ */}
            {showAutoDecl && (
                <div style={overlay} onClick={e => { if (e.target === e.currentTarget) setShowAutoDecl(false); }}>
                    <div style={{ ...modal, width: 480 }}>
                        <h3 style={{ color: '#e2e8f0', margin: '0 0 8px', fontWeight: 700, fontSize: 17 }}>⚡ Auto-generar Declaración de Tercero</h3>
                        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                            Calcula automáticamente los ingresos del propietario en el período, descontando la comisión de Waiwa.
                        </p>
                        <div style={{ display: 'grid', gap: 14 }}>
                            <div>
                                <label style={lbl}>ID Propietario *</label>
                                <input style={inp} type="number" value={autoForm.id_propietario} placeholder="Ej: 1"
                                    onChange={e => setAutoForm(f => ({ ...f, id_propietario: e.target.value }))} />
                            </div>
                            <div>
                                <label style={lbl}>Rango numeración *</label>
                                <NumeracionSelect value={Number(autoForm.id_rango_numeracion) || undefined} onChange={v => setAutoForm(f => ({ ...f, id_rango_numeracion: String(v) }))} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div>
                                    <label style={lbl}>Período inicio *</label>
                                    <input type="date" style={inp} value={autoForm.periodo_inicio} onChange={e => setAutoForm(f => ({ ...f, periodo_inicio: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={lbl}>Período fin *</label>
                                    <input type="date" style={inp} value={autoForm.periodo_fin} onChange={e => setAutoForm(f => ({ ...f, periodo_fin: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowAutoDecl(false)} style={{ padding: '9px 18px', borderRadius: 8, background: '#1e293b', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
                            <button style={{ ...btnP, background: '#0f766e' }} onClick={handleAutoDecl} disabled={loading}>
                                {loading ? 'Generando...' : '⚡ Generar declaración'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
