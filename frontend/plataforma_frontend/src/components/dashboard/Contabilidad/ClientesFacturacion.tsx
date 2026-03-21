'use client';
import React, { useEffect, useState } from 'react';
import {
    getClientesFacturacion, createClienteFacturacion, updateClienteFacturacion,
    deleteClienteFacturacion, IClienteFacturacion, getMunicipiosFactus
} from '../../../auth/factusApi';

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 13px', borderRadius: 8,
    border: '1px solid #2d3748', background: '#1a2234', color: '#e2e8f0',
    fontSize: 13, outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = { color: '#94a3b8', fontSize: 12, marginBottom: 4, display: 'block' };
const btnPrimary: React.CSSProperties = {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 600,
    cursor: 'pointer', fontSize: 13,
};
const card: React.CSSProperties = {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 16,
};

const EMPTY_CLIENTE: Partial<IClienteFacturacion> = {
    tipo_persona: 'natural', tipo_tercero: 'otro', tipo_documento: 'CC', numero_documento: '',
    nombres: '', apellidos: '', razon_social: '', email: '', telefono: '',
    direccion: '', codigo_municipio: '', regimen: 'simplificado',
    responsabilidades_fiscales: '["R-99-PN"]',
};

export default function ClientesFacturacion() {
    const [clientes, setClientes] = useState<IClienteFacturacion[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [tipoTerceroFilter, setTipoTerceroFilter] = useState('');
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<IClienteFacturacion | null>(null);
    const [form, setForm] = useState<Partial<IClienteFacturacion>>(EMPTY_CLIENTE);
    const [municipios, setMunicipios] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadMunicipios = async () => {
        if (municipios.length > 0) return;
        const r = await getMunicipiosFactus('?limit=1200'); // Tratar de traer todos
        if (r.success && r.data) setMunicipios(r.data);
    };

    const load = async () => {
        setLoading(true);
        const queryParams: any = { search, page, limit: 20 };
        if (tipoTerceroFilter) queryParams.tipo_tercero = tipoTerceroFilter;
        const r = await getClientesFacturacion(queryParams);
        if (r.success && r.data) {
            setClientes(r.data.items || []);
            setTotal(r.data.total || 0);
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, [search, tipoTerceroFilter, page]);

    const openCreate = () => { setForm(EMPTY_CLIENTE); setEditing(null); setShowForm(true); setError(''); loadMunicipios(); };
    const openEdit = (c: IClienteFacturacion) => { setForm(c); setEditing(c); setShowForm(true); setError(''); loadMunicipios(); };

    const handleSubmit = async () => {
        setLoading(true); setError('');
        const payload = { ...form } as any;
        const r = editing?.id
            ? await updateClienteFacturacion(editing.id, payload)
            : await createClienteFacturacion(payload);
        setLoading(false);
        if (r.success) {
            setSuccess(editing ? 'Cliente actualizado' : 'Cliente creado');
            setShowForm(false);
            load();
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(r.message || 'Error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Inactivar este cliente?')) return;
        await deleteClienteFacturacion(id);
        load();
    };

    return (
        <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h2 style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 700, margin: 0 }}>👥 Clientes de Facturación</h2>
                    <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{total} clientes registrados</p>
                </div>
                <button style={btnPrimary} onClick={openCreate}>+ Nuevo cliente</button>
            </div>

            {success && <div style={{ padding: '10px 16px', borderRadius: 8, background: '#064e3b', color: '#6ee7b7', marginBottom: 16, fontSize: 13 }}>✅ {success}</div>}

            {/* Filtros */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
                <input style={{ ...inputStyle, maxWidth: 340 }} placeholder="🔍 Buscar por nombre o documento..."
                    value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                
                <select style={{ ...inputStyle, maxWidth: 200 }} value={tipoTerceroFilter} onChange={e => { setTipoTerceroFilter(e.target.value); setPage(1); }}>
                    <option value="">Todos los terceros</option>
                    <option value="huesped">Huéspedes</option>
                    <option value="propietario">Propietarios</option>
                    <option value="empleado">Empleados</option>
                    <option value="otro">Otros</option>
                </select>
            </div>

            {/* Tabla */}
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: '#1e293b' }}>
                            {['Tipo Persona / Tercero', 'Documento', 'Nombre / Razón Social', 'Email', 'Teléfono', 'Régimen', 'Acciones'].map(h => (
                                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Cargando...</td></tr>
                        ) : clientes.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No hay clientes registrados</td></tr>
                        ) : clientes.map(c => (
                            <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                <td style={{ padding: '11px 14px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, width: 'fit-content',
                                            background: c.tipo_persona === 'juridica' ? '#1e3a5f' : '#1e3a3a',
                                            color: c.tipo_persona === 'juridica' ? '#93c5fd' : '#6ee7b7'
                                        }}>
                                            {c.tipo_persona === 'juridica' ? '🏢 Jurídica' : '👤 Natural'}
                                        </span>
                                        {c.tipo_tercero && (
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, width: 'fit-content',
                                                background: '#451a03', color: '#fbbf24'
                                            }}>
                                                {(c.tipo_tercero as string).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '11px 14px', color: '#94a3b8' }}>{c.tipo_documento} {c.numero_documento}</td>
                                <td style={{ padding: '11px 14px', color: '#e2e8f0', fontWeight: 500 }}>
                                    {c.razon_social || `${c.nombres || ''} ${c.apellidos || ''}`.trim()}
                                </td>
                                <td style={{ padding: '11px 14px', color: '#94a3b8' }}>{c.email || '—'}</td>
                                <td style={{ padding: '11px 14px', color: '#94a3b8' }}>{c.telefono || '—'}</td>
                                <td style={{ padding: '11px 14px', color: '#94a3b8' }}>{c.regimen || '—'}</td>
                                <td style={{ padding: '11px 14px' }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => openEdit(c)} style={{ padding: '4px 12px', borderRadius: 6, background: '#1e40af', color: '#93c5fd', border: 'none', cursor: 'pointer', fontSize: 12 }}>Editar</button>
                                        <button onClick={() => handleDelete(c.id!)} style={{ padding: '4px 12px', borderRadius: 6, background: '#450a0a', color: '#fca5a5', border: 'none', cursor: 'pointer', fontSize: 12 }}>Inactivar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {total > 20 && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ ...btnPrimary, padding: '6px 14px', opacity: page === 1 ? 0.4 : 1 }}>← Anterior</button>
                    <span style={{ color: '#94a3b8', padding: '6px 12px', fontSize: 13 }}>Pág {page}</span>
                    <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} style={{ ...btnPrimary, padding: '6px 14px', opacity: page * 20 >= total ? 0.4 : 1 }}>Siguiente →</button>
                </div>
            )}

            {/* Modal / Form */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 28, width: 620, maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ color: '#e2e8f0', margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>
                            {editing ? 'Editar cliente' : 'Nuevo cliente de facturación'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Tipo persona</label>
                                <select style={{ ...inputStyle }} value={form.tipo_persona} onChange={e => setForm(f => ({ ...f, tipo_persona: e.target.value as any }))}>
                                    <option value="natural">Natural</option>
                                    <option value="juridica">Jurídica</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Clasificación de Tercero</label>
                                <select style={{ ...inputStyle }} value={form.tipo_tercero as string || 'otro'} onChange={e => setForm(f => ({ ...f, tipo_tercero: e.target.value as any }))}>
                                    <option value="huesped">Huésped</option>
                                    <option value="propietario">Propietario</option>
                                    <option value="empleado">Empleado</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Tipo documento</label>
                                <select style={{ ...inputStyle }} value={form.tipo_documento} onChange={e => setForm(f => ({ ...f, tipo_documento: e.target.value as any }))}>
                                    {['CC', 'NIT', 'CE', 'PP', 'TI', 'DIE', 'NUIP'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Número documento *</label>
                                <input style={inputStyle} value={form.numero_documento || ''} placeholder="1234567890" onChange={e => setForm(f => ({ ...f, numero_documento: e.target.value }))} />
                            </div>
                            {form.tipo_documento === 'NIT' && (
                                <div>
                                    <label style={labelStyle}>Dígito verificación</label>
                                    <input style={inputStyle} value={form.digito_verificacion || ''} maxLength={1} onChange={e => setForm(f => ({ ...f, digito_verificacion: e.target.value }))} />
                                </div>
                            )}
                            {form.tipo_persona === 'natural' ? (
                                <>
                                    <div>
                                        <label style={labelStyle}>Nombres *</label>
                                        <input style={inputStyle} value={form.nombres || ''} onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Apellidos</label>
                                        <input style={inputStyle} value={form.apellidos || ''} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label style={labelStyle}>Razón social *</label>
                                        <input style={inputStyle} value={form.razon_social || ''} onChange={e => setForm(f => ({ ...f, razon_social: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Nombre comercial</label>
                                        <input style={inputStyle} value={form.nombre_comercial || ''} onChange={e => setForm(f => ({ ...f, nombre_comercial: e.target.value }))} />
                                    </div>
                                </>
                            )}
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input style={inputStyle} type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Teléfono</label>
                                <input style={inputStyle} value={form.telefono || ''} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                            </div>
                            <div style={{ gridColumn: '1/-1' }}>
                                <label style={labelStyle}>Dirección</label>
                                <input style={inputStyle} value={form.direccion || ''} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Municipio (Factus) *</label>
                                <select style={{ ...inputStyle }} value={form.codigo_municipio || ''} onChange={e => setForm(f => ({ ...f, codigo_municipio: e.target.value }))}>
                                    <option value="">— Seleccione municipio —</option>
                                    {municipios.map(m => (
                                        <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Régimen</label>
                                <select style={{ ...inputStyle }} value={form.regimen || 'simplificado'} onChange={e => setForm(f => ({ ...f, regimen: e.target.value }))}>
                                    <option value="simplificado">Simplificado</option>
                                    <option value="comun">Común</option>
                                    <option value="gran_contribuyente">Gran contribuyente</option>
                                    <option value="autorretenedor">Autorretenedor</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Código postal</label>
                                <input style={inputStyle} value={form.codigo_postal || ''} onChange={e => setForm(f => ({ ...f, codigo_postal: e.target.value }))} />
                            </div>
                            <div style={{ gridColumn: '1/-1' }}>
                                <label style={labelStyle}>Responsabilidades fiscales (mínimo asignar R-99-PN)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
                                    {[
                                        { id: 'O-13', label: 'Gran contribuyente' },
                                        { id: 'O-15', label: 'Autorretenedor' },
                                        { id: 'O-23', label: 'Agente de retención IVA' },
                                        { id: 'O-47', label: 'Régimen simple' },
                                        { id: 'R-99-PN', label: 'No aplica - Otros' },
                                    ].map(opt => {
                                        let selectedArr: string[] = [];
                                        try { selectedArr = form.responsabilidades_fiscales ? JSON.parse(form.responsabilidades_fiscales) : []; } catch(e){}
                                        const isSelected = selectedArr.includes(opt.id);
                                        return (
                                            <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0', fontSize: 13, cursor: 'pointer' }}>
                                                <input type="checkbox" checked={isSelected} onChange={e => {
                                                    let newArr = [...selectedArr];
                                                    if (e.target.checked) newArr.push(opt.id);
                                                    else newArr = newArr.filter((x: string) => x !== opt.id);
                                                    if (newArr.length === 0) newArr = ['R-99-PN']; // Fallback
                                                    setForm(f => ({ ...f, responsabilidades_fiscales: JSON.stringify(newArr) }));
                                                }} />
                                                {opt.id} - {opt.label}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {error && <div style={{ marginTop: 14, padding: '8px 14px', borderRadius: 8, background: '#450a0a', color: '#fca5a5', fontSize: 13 }}>⚠️ {error}</div>}

                        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', borderRadius: 8, background: '#1e293b', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
                            <button style={btnPrimary} onClick={handleSubmit} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
