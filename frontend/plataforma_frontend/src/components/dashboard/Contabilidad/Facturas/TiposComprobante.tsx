'use client';
import React, { useState } from 'react';

export default function TiposComprobante() {
    const [comprobantes] = useState([
        { id: 1, codigo: '1', descripcion: 'FCE GASTOS PERSONALES', titulo: 'FCE GASTOS PERSONALES' },
        { id: 2, codigo: '2', descripcion: 'FCE WAIWA HOST', titulo: 'FCE WAIWA HOST' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex-1 md:flex space-y-4 md:space-y-0 justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">Crear tipos de comprobante compra / gastos</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="bg-lime-600 hover:bg-lime-700 text-white rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer">
                        Crear nuevo tipo de comprobante
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto bg-slate-900 rounded-xl shadow-sm border border-slate-800 mt-6">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 bg-slate-800 uppercase font-semibold border-b border-slate-700">
                        <tr>
                            <th className="px-4 py-3">Código del comprobante</th>
                            <th className="px-4 py-3">Descripción interna</th>
                            <th className="px-4 py-3">Título comprobante</th>
                            <th className="px-4 py-3 text-center w-20">Editar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 shadow-sm">
                        {comprobantes.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3 text-slate-200">{c.codigo}</td>
                                <td className="px-4 py-3 text-slate-400 border-x border-slate-800/50">{c.descripcion}</td>
                                <td className="px-4 py-3 text-slate-400">{c.titulo}</td>
                                <td className="px-4 py-3 text-center border-l border-slate-800/50"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
