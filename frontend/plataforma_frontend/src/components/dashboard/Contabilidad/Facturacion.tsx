'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const cl = (s: string) => s;
// Lazy load the heavy modules
const FactusConfig = dynamic(() => import('./FactusConfig'), { ssr: false, loading: () => <Loader label="Configuración" /> });
const ClientesFacturacion = dynamic(() => import('./ClientesFacturacion'), { ssr: false, loading: () => <Loader label="Clientes" /> });
const FacturasMain = dynamic(() => import('./Facturas/FacturasMain'), { ssr: false, loading: () => <Loader label="Facturas" /> });
const FactusDocumentos = dynamic(() => import('./FactusDocumentos'), { ssr: false, loading: () => <Loader label="Documentos" /> });
const FacturacionDashboardMenu = dynamic(() => import('./FacturacionDashboardMenu'), { ssr: false, loading: () => <Loader label="Inicio" /> });
const NuevaFactura = dynamic(() => import('./NuevaFactura'), { ssr: false, loading: () => <Loader label="Nueva Factura" /> });

function Loader({ label }: { label: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#64748b', fontSize: 14 }}>
            <span style={{ marginRight: 10, display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span>
            Cargando {label}...
        </div>
    );
}

type MainTab = 'inicio' | 'config' | 'clientes' | 'facturas' | 'documentos' | 'nueva_factura' | 'nueva_factura_reserva';

const TABS: { id: MainTab; icon: string; label: string; sublabel: string }[] = [
    { id: 'inicio', icon: '🏠', label: 'Inicio', sublabel: 'Acciones principales' },
    { id: 'config', icon: '🔐', label: 'Configuración', sublabel: 'Credenciales Factus' },
    { id: 'clientes', icon: '👥', label: 'Clientes', sublabel: 'Terceros fiscales' },
    { id: 'facturas', icon: '🧾', label: 'Facturas', sublabel: 'Facturación electrónica' },
    { id: 'documentos', icon: '📄', label: 'Documentos', sublabel: 'Notas · Soporte · Terceros' },
];

export default function Facturacion({ activeTab = 'inicio', onNavigate }: { activeTab?: MainTab, onNavigate?: (tab: string) => void }) {

    return (
        <div style={{ minHeight: '100vh', background: '#060e1f', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1a1040 100%)',
                borderBottom: '1px solid #1e293b',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
            }}>
                <div style={{ fontSize: 32 }}>🏛️</div>
                <div>
                    <h1 style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                        Facturación Electrónica
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 12, margin: 0, marginTop: 2 }}>
                        Integración Factus · DIAN Colombia
                    </p>
                </div>

                {/* Status Badge */}
                <div style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 20, background: '#0d2600', border: '1px solid #166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 600 }}>Sandbox</span>
                </div>
            </div>

            {/* Tab Bar Removed in favor of Sidebar Menu */}

            {/* Content */}
            <div>
                {activeTab === 'inicio' && <FacturacionDashboardMenu onNavigate={(t) => {
                    const mappedKeys: Record<string, string> = {
                        config: 'facturacion_config',
                        clientes: 'facturacion_clientes',
                        facturas: 'facturacion_facturas',
                        documentos: 'facturacion_documentos',
                        nueva_factura: 'facturacion_nueva',
                        nueva_factura_reserva: 'facturacion_nueva_reserva'
                    };
                    if (onNavigate) onNavigate(mappedKeys[t] || `facturacion_${t}`);
                }} />}
                {activeTab === 'config' && <FactusConfig />}
                {activeTab === 'clientes' && <ClientesFacturacion />}
                {activeTab === 'facturas' && <FacturasMain />}
                {activeTab === 'documentos' && <FactusDocumentos />}
                {activeTab === 'nueva_factura' && <NuevaFactura />}
                {activeTab === 'nueva_factura_reserva' && <NuevaFactura isFromReserva={true} />}
            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
        </div>
    );
}
