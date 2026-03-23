import React, { useState, useEffect } from 'react';
import { getProductosServicios, createProductoServicio } from '../../../auth/factusApi';

// ─── Tipos ────────────────────────────────────────────────────
interface ProductoServicioItem {
    id?: number;
    tipo: string;
    codigo_referencia: string;
    nombre: string;
    unidad_medida_nombre?: string;
    tribute_id?: number;
    precio_venta_1?: number;
}

interface ProductoSeleccionado {
    codigo_referencia: string;
    nombre: string;
    precio_venta_1?: number;
    tribute_id?: number;
}

interface Props {
    onClose: () => void;
    onSeleccionar: (prod: ProductoSeleccionado) => void;
}

// ─── Estilos reutilizables ───────────────────────────────────
const inputStyle: React.CSSProperties = {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f1f5f9',
    padding: '8px 12px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
};

const btnPrimary: React.CSSProperties = {
    background: '#0ea5e9',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
};

// ─── Componente ───────────────────────────────────────────────
export default function ProductoServicioModal({ onClose, onSeleccionar }: Props) {
    // Vista: lista de existentes o formulario de creación
    const [vista, setVista] = useState<'lista' | 'crear'>('lista');
    const [search, setSearch] = useState('');
    const [productosExistentes, setProductosExistentes] = useState<ProductoServicioItem[]>([]);
    const [loadingExistentes, setLoadingExistentes] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [form, setForm] = useState({
        tipo: 'servicio' as 'producto' | 'servicio',
        categoria: '',
        codigo: '',
        nombre: '',
        unidad_medida: '94',
        unidad_medida_nombre: '94 - Unidad',
        standard_code_id: 10,
        tribute_id: 21,
        impuesto_porcentaje: 0,
        is_excluded: 0 as 0 | 1,
        precio_incluye_iva: false,
        precio_venta_1: 0,
        precio_venta_2: 0,
        descripcion: '',
    });

    // Cargar productos existentes al montar
    useEffect(() => {
        setLoadingExistentes(true);
        getProductosServicios({ limit: 100 })
            .then(res => {
                if (res.success && res.data?.items) setProductosExistentes(res.data.items);
            })
            .finally(() => setLoadingExistentes(false));
    }, []);

    // ── Seleccionar un producto existente ───────────────────
    const handleSeleccionar = (prod: ProductoServicioItem) => {
        onSeleccionar({
            codigo_referencia: prod.codigo_referencia,
            nombre: prod.nombre,
            precio_venta_1: prod.precio_venta_1,
            tribute_id: prod.tribute_id,
        });
        onClose();
    };

    // ── Guardar nuevo producto/servicio ─────────────────────
    const handleGuardar = async () => {
        if (!form.codigo || !form.nombre) return;
        setError('');
        setSaving(true);

        const res = await createProductoServicio({
            tipo: form.tipo,
            categoria: form.categoria || undefined,
            codigo_referencia: form.codigo,
            nombre: form.nombre,
            descripcion_larga: form.descripcion || undefined,
            unidad_medida_id: Number(form.unidad_medida),
            unidad_medida_nombre: form.unidad_medida_nombre,
            standard_code_id: form.standard_code_id,
            tribute_id: form.tribute_id,
            impuesto_porcentaje: form.impuesto_porcentaje,
            is_excluded: form.is_excluded,
            precio_incluye_iva: form.precio_incluye_iva,
            precio_venta_1: form.precio_venta_1,
            precio_venta_2: form.precio_venta_2,
        });

        setSaving(false);

        if (!res.success) {
            setError(res.message || 'Error al guardar producto/servicio');
            return;
        }

        // Añadir a la lista y usar automáticamente
        if (res.data) {
            setProductosExistentes(prev => [res.data, ...prev]);
        }
        setSuccessMsg('¡Guardado correctamente!');
        onSeleccionar({
            codigo_referencia: form.codigo,
            nombre: form.nombre,
            precio_venta_1: form.precio_venta_1,
            tribute_id: form.tribute_id,
        });
        setTimeout(() => onClose(), 300);
    };

    const handleUpdateForm = (key: string, value: any) =>
        setForm(f => ({ ...f, [key]: value }));

    const setUnidadMedida = (val: string) => {
        const opts: Record<string, string> = {
            '94': '94 - Unidad',
            '70': '70 - Unidad (otro)',
            '96': '96 - Hora',
            'MON': 'MON - Mes',
            'DIA': 'DIA - Día',
        };
        setForm(f => ({ ...f, unidad_medida: val, unidad_medida_nombre: opts[val] || val }));
    };

    const productosFiltrados = productosExistentes.filter(p =>
        !search ||
        p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        p.codigo_referencia?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={(e: any) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-[#111827] border border-[#1e293b] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* ── Header ─────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#0ea5e9] text-white shrink-0">
                    <span className="font-bold text-base">
                        {vista === 'lista' ? '🔍 Buscar producto o servicio' : '➕ Nuevo producto o servicio'}
                    </span>
                    <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold leading-none">✕</button>
                </div>

                {/* ══════════════════════════════════════════════
                    VISTA LISTA
                ════════════════════════════════════════════════ */}
                {vista === 'lista' && (
                    <div className="flex flex-col gap-4 px-6 py-5 overflow-y-auto flex-1">
                        {/* Buscador + botón nuevo */}
                        <div className="flex gap-3">
                            <input
                                style={inputStyle}
                                placeholder="Buscar por nombre o código..."
                                value={search}
                                onChange={(e: any) => setSearch(e.target.value)}
                                autoFocus
                            />
                            <button
                                onClick={() => { setVista('crear'); setError(''); setSuccessMsg(''); }}
                                style={{ ...btnPrimary, whiteSpace: 'nowrap' as const }}
                            >
                                + Nuevo
                            </button>
                        </div>

                        {/* Lista */}
                        {loadingExistentes ? (
                            <p className="text-center text-[#64748b] text-sm py-8">Cargando...</p>
                        ) : productosFiltrados.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-10">
                                <p className="text-[#64748b] text-sm">
                                    {search ? 'No se encontraron resultados.' : 'No hay productos ni servicios guardados.'}
                                </p>
                                <button onClick={() => setVista('crear')} style={btnPrimary}>
                                    Crear el primero
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {productosFiltrados.map((prod) => (
                                    <button
                                        key={prod.id ?? prod.codigo_referencia}
                                        onClick={() => handleSeleccionar(prod)}
                                        className="w-full text-left px-4 py-3 rounded-lg border border-[#1e293b] hover:border-[#0ea5e9] hover:bg-[#0ea5e9]/5 transition-colors flex items-start justify-between gap-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-white">{prod.nombre}</p>
                                            <p className="text-xs text-[#64748b]">
                                                {prod.codigo_referencia} · {prod.tipo} · {prod.unidad_medida_nombre || '94 - Unidad'}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm text-[#60a5fa] font-medium">
                                                {prod.precio_venta_1 && prod.precio_venta_1 > 0
                                                    ? `$${Number(prod.precio_venta_1).toLocaleString('es-CO')}`
                                                    : '—'}
                                            </p>
                                            <p className="text-xs text-[#64748b]">tribute: {prod.tribute_id ?? '—'}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════
                    VISTA CREAR
                ════════════════════════════════════════════════ */}
                {vista === 'crear' && (
                    <div className="flex flex-col gap-4 px-6 py-5 overflow-y-auto flex-1">

                        {/* Tipo: Producto / Servicio */}
                        <div className="flex gap-8">
                            {(['producto', 'servicio'] as const).map(tipo => (
                                <label key={tipo} className="flex items-center gap-2 cursor-pointer" onClick={() => handleUpdateForm('tipo', tipo)}>
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${form.tipo === tipo ? 'border-[#0ea5e9]' : 'border-[#475569]'}`}>
                                        {form.tipo === tipo && <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />}
                                    </div>
                                    <span className={`text-sm font-medium ${form.tipo === tipo ? 'text-white' : 'text-[#64748b]'}`}>
                                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                    </span>
                                </label>
                            ))}
                        </div>

                        <p className="text-xs font-semibold text-[#60a5fa] uppercase tracking-wider">Datos generales</p>

                        {/* Categoría + Código + Nombre */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-[#94a3b8]">Categoría</label>
                                <select style={inputStyle} value={form.categoria} onChange={(e: any) => handleUpdateForm('categoria', e.target.value)}>
                                    <option value="">Elige una opción</option>
                                    <option value="alojamiento">Alojamiento / Hospedaje</option>
                                    <option value="limpieza">Servicio de limpieza</option>
                                    <option value="mantenimiento">Mantenimiento</option>
                                    <option value="comision">Comisión de gestión</option>
                                    <option value="otros">Otros servicios</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-[#94a3b8]">Código *</label>
                                <input style={inputStyle} placeholder="Ej: ALOJS-001" value={form.codigo} onChange={(e: any) => handleUpdateForm('codigo', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-[#94a3b8]">Nombre *</label>
                                <input style={inputStyle} placeholder="Ej: Servicio de alojamiento" value={form.nombre} onChange={(e: any) => handleUpdateForm('nombre', e.target.value)} />
                            </div>
                        </div>

                        {/* Unidad de medida */}
                        <div className="flex flex-col gap-1 w-1/2">
                            <label className="text-xs text-[#94a3b8]">Unidad de medida DIAN *</label>
                            <select style={inputStyle} value={form.unidad_medida} onChange={(e: any) => setUnidadMedida(e.target.value)}>
                                <option value="94">94 - Unidad</option>
                                <option value="70">70 - Unidad (otro)</option>
                                <option value="96">96 - Hora</option>
                                <option value="MON">MON - Mes</option>
                                <option value="DIA">DIA - Día</option>
                            </select>
                        </div>

                        {form.tipo === 'servicio' && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 text-xs text-[#7dd3fc]">
                                ℹ️ Los servicios no son inventariables.
                            </div>
                        )}

                        <p className="text-xs font-semibold text-[#60a5fa] uppercase tracking-wider">Datos adicionales (impuestos)</p>

                        {/* Tribute + Impuesto + IVA excluido */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-[#94a3b8]">Tributo (tribute_id)</label>
                                <select style={inputStyle} value={form.tribute_id} onChange={(e: any) => handleUpdateForm('tribute_id', Number(e.target.value))}>
                                    <option value={21}>21 — No aplica IVA</option>
                                    <option value={1}>1 — IVA 19%</option>
                                    <option value={4}>4 — IVA 5%</option>
                                    <option value={2}>2 — IVA 0%</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-[#94a3b8]">Impuesto cargo %</label>
                                <input style={inputStyle} type="number" min="0" max="100"
                                    value={form.impuesto_porcentaje}
                                    onChange={(e: any) => handleUpdateForm('impuesto_porcentaje', Number(e.target.value))} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-[#94a3b8]">IVA excluido (is_excluded)</label>
                                <select style={inputStyle} value={form.is_excluded} onChange={(e: any) => handleUpdateForm('is_excluded', Number(e.target.value) as 0 | 1)}>
                                    <option value={0}>0 — No excluido</option>
                                    <option value={1}>1 — Excluido de IVA</option>
                                </select>
                            </div>
                        </div>

                        <p className="text-xs font-semibold text-[#60a5fa] uppercase tracking-wider">Lista de precios</p>

                        {/* IVA incluido */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.precio_incluye_iva}
                                onChange={(e: any) => handleUpdateForm('precio_incluye_iva', e.target.checked)}
                                className="w-4 h-4 rounded accent-[#0ea5e9]"
                            />
                            <span className="text-sm text-[#94a3b8]">Incluir IVA en el precio de venta</span>
                        </label>

                        {/* Precios */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-[#94a3b8]">Lista de precio 1 (COP)</label>
                                <input style={inputStyle} type="number" min="0"
                                    value={form.precio_venta_1}
                                    onChange={(e: any) => handleUpdateForm('precio_venta_1', Number(e.target.value))} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-[#94a3b8]">Lista de precio 2 (COP)</label>
                                <input style={inputStyle} type="number" min="0"
                                    value={form.precio_venta_2}
                                    onChange={(e: any) => handleUpdateForm('precio_venta_2', Number(e.target.value))} />
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-[#94a3b8]">Descripción larga</label>
                            <textarea
                                style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' as const }}
                                placeholder="Descripción detallada del producto o servicio..."
                                value={form.descripcion}
                                onChange={(e: any) => handleUpdateForm('descripcion', e.target.value)}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                                ⚠️ {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-xs text-green-400">
                                ✅ {successMsg}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Footer ─────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#1e293b] bg-[#0f172a] shrink-0">
                    {vista === 'crear' ? (
                        <>
                            <button onClick={() => setVista('lista')} className="text-sm text-[#60a5fa] hover:underline">
                                ← Volver a la lista
                            </button>
                            <button
                                style={{
                                    ...btnPrimary,
                                    opacity: (!form.codigo || !form.nombre || saving) ? 0.5 : 1,
                                    cursor: (!form.codigo || !form.nombre || saving) ? 'not-allowed' : 'pointer',
                                }}
                                onClick={handleGuardar}
                                disabled={!form.codigo || !form.nombre || saving}
                            >
                                {saving ? 'Guardando...' : '💾 Guardar y usar'}
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} className="ml-auto text-sm text-[#64748b] hover:text-white transition-colors">
                            Cerrar
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
