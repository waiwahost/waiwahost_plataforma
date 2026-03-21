'use client';
import React, { useState } from 'react';
import FacturasElectronicas from './FacturasElectronicas';
import FacturasVenta from './FacturasVenta';
import FacturasCompraGastos from './FacturasCompraGastos';
import TiposComprobante from './TiposComprobante';

export default function FacturasMain() {
    const [subTab, setSubTab] = useState<'electronica' | 'comprobantes' | 'venta' | 'compra_gastos'>('electronica');

    return (
        <div className="p-0 md:p-4 space-y-6">
            {/* Top Navigation Sub-Menu */}
            <div className="flex gap-3 mb-6 border-b border-slate-800 pb-3 overflow-x-auto whitespace-nowrap custom-scrollbar">
                {[
                    { id: 'electronica', label: 'Facturas Electrónicas' },
                    { id: 'venta', label: 'Facturas de Venta' },
                    { id: 'compra_gastos', label: 'Facturas de Compra / Gastos' },
                    { id: 'comprobantes', label: 'Tipos de Comprobante' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setSubTab(t.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                            subTab === t.id 
                                ? 'bg-slate-800 text-slate-200' 
                                : 'bg-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {subTab === 'electronica' && <FacturasElectronicas />}
            {subTab === 'venta' && <FacturasVenta />}
            {subTab === 'compra_gastos' && <FacturasCompraGastos />}
            {subTab === 'comprobantes' && <TiposComprobante />}
        </div>
    );
}