'use client';
import React from 'react';

export default function FacturasVenta() {
    return (
        <div className="space-y-6">
            <div className="flex-1 md:flex space-y-4 md:space-y-0 justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">🛍️ Facturas de Venta</h2>
                    <p className="text-slate-400 text-sm mt-1">Control de ventas tradicionales</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer">
                        + Nueva factura
                    </button>
                </div>
            </div>

            {/* Filtros Placeholder */}
            <div className="flex gap-2">
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500 text-white cursor-pointer">Todos</button>
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 hover:bg-slate-700 cursor-pointer">Pendientes</button>
            </div>

            {/* Tabla Placeholder */}
            <div className="overflow-x-auto bg-slate-900 rounded-xl shadow-sm border border-slate-800">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 bg-slate-800 uppercase font-semibold border-b border-slate-700">
                        <tr>
                            {['#', 'Cliente', 'Fecha', 'Total', 'Estado', 'Acciones'].map(h => (
                                <th key={h} className="px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-slate-400 bg-slate-900">
                                Módulo de facturas de venta en desarrollo...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
