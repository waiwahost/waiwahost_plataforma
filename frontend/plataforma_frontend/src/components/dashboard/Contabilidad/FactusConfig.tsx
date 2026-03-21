'use client';
import React, { useEffect, useState } from 'react';
import {
    getFactusConfig, saveFactusConfig, testFactusConnection,
    getNumeracionFactus, IFactusConfig
} from '../../../auth/factusApi';

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #2d3748', background: '#1a2234', color: '#e2e8f0',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = { color: '#94a3b8', fontSize: 13, marginBottom: 4, display: 'block' };
const btnPrimary: React.CSSProperties = {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600,
    cursor: 'pointer', fontSize: 14, transition: 'opacity 0.2s',
};
const card: React.CSSProperties = {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, marginBottom: 20,
};

export default function FactusConfig() {
    const [config, setConfig] = useState<Partial<IFactusConfig>>({ ambiente: 'sandbox' });
    const [numeracion, setNumeracion] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [saved, setSaved] = useState(false);
    const [hasConfig, setHasConfig] = useState(false);

    useEffect(() => {
        getFactusConfig().then(r => {
            if (r.success && r.data) {
                setConfig(r.data);
                setHasConfig(true);
                loadNumeracion();
            }
        });
    }, []);

    const loadNumeracion = async () => {
        const r = await getNumeracionFactus();
        if (r.success && r.data) setNumeracion(r.data);
    };

    const handleSave = async () => {
        setLoading(true);
        const r = await saveFactusConfig({
            client_id: config.client_id || '',
            client_secret: config.client_secret || '',
            factus_username: config.factus_username || '',
            factus_password: config.factus_password || '',
            ambiente: config.ambiente || 'sandbox',
        });
        setLoading(false);
        setSaved(r.success);
        if (r.success) { setHasConfig(true); loadNumeracion(); }
    };

    const handleTest = async () => {
        setLoading(true);
        const r = await testFactusConnection();
        setTestResult(r.data ?? { success: false, message: r.message || 'Error' });
        setLoading(false);
    };

    return (
        <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 28 }}>
                <h2 style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 700, margin: 0 }}>
                    🔐 Configuración Factus
                </h2>
                <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>
                    Credenciales OAuth2 de tu cuenta Factus — se guardan por empresa
                </p>
            </div>

            <div style={card}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Ambiente</label>
                        <select
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            value={config.ambiente}
                            onChange={e => setConfig(c => ({ ...c, ambiente: e.target.value as 'sandbox' | 'produccion' }))}
                        >
                            <option value="sandbox">🧪 Sandbox (pruebas)</option>
                            <option value="produccion">🚀 Producción</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Usuario Factus (email)</label>
                        <input style={inputStyle} value={config.factus_username || ''} placeholder="sandbox@factus.com.co"
                            onChange={e => setConfig(c => ({ ...c, factus_username: e.target.value }))} />
                    </div>
                    <div>
                        <label style={labelStyle}>Contraseña Factus</label>
                        <input style={inputStyle} type="password" value={config.factus_password || ''} placeholder="••••••••"
                            onChange={e => setConfig(c => ({ ...c, factus_password: e.target.value }))} />
                    </div>
                    <div>
                        <label style={labelStyle}>Client ID</label>
                        <input style={inputStyle} value={config.client_id || ''} placeholder="9fb40e9b-..."
                            onChange={e => setConfig(c => ({ ...c, client_id: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={labelStyle}>Client Secret</label>
                        <input style={inputStyle} type="password" value={config.client_secret || ''} placeholder="••••••••"
                            onChange={e => setConfig(c => ({ ...c, client_secret: e.target.value }))} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    <button style={btnPrimary} onClick={handleSave} disabled={loading}>
                        {loading ? 'Guardando...' : '💾 Guardar credenciales'}
                    </button>
                    {hasConfig && (
                        <button style={{ ...btnPrimary, background: '#0f766e' }} onClick={handleTest} disabled={loading}>
                            {loading ? 'Probando...' : '🔌 Probar conexión'}
                        </button>
                    )}
                </div>

                {saved && <div style={{ marginTop: 12, color: '#34d399', fontSize: 13 }}>✅ Configuración guardada correctamente</div>}
                {testResult && (
                    <div style={{
                        marginTop: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13,
                        background: testResult.success ? '#064e3b' : '#450a0a',
                        color: testResult.success ? '#6ee7b7' : '#fca5a5'
                    }}>
                        {testResult.success ? '✅' : '❌'} {testResult.message}
                    </div>
                )}
            </div>

            {numeracion.length > 0 && (
                <div style={card}>
                    <h3 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 16 }}>📋 Rangos de numeración disponibles</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                    {['ID', 'Documento', 'Prefijo', 'Desde', 'Hasta', 'Siguiente', 'Activo'].map(h => (
                                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {numeracion.map((r: any) => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                        <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{r.id}</td>
                                        <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{r.document}</td>
                                        <td style={{ padding: '8px 12px', color: '#818cf8' }}>{r.prefix}</td>
                                        <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{r.from}</td>
                                        <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{r.to}</td>
                                        <td style={{ padding: '8px 12px', color: '#fbbf24' }}>{r.next_number ?? r.generated_count + (r.from || 1)}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                                background: r.is_active ? '#064e3b' : '#450a0a',
                                                color: r.is_active ? '#6ee7b7' : '#fca5a5'
                                            }}>
                                                {r.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
