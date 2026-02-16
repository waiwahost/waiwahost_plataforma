import React, { useState, useEffect } from 'react';
import { IReservaTableData } from "../../interfaces/Reserva";
import { ITarjeta, IPayloadTarjeta } from '../../interfaces/Tarjeta';
import { getTarjetaRegistroApi } from '../../auth/tarjetaRegistroApi';


interface TarjetaModalProps {
    open: boolean;
    onClose: () => void;
    reserva: IReservaTableData | null;
    onSubmit: (tarjetaData: any) => void;
}

export default function TarjetaModal({
    open,
    onClose,
    reserva,
    onSubmit,
}: TarjetaModalProps) {
    const [tarjetasRegistro, setTarjetasRegistro] = useState<ITarjeta[]>([]);
    const [payloadTarjeta, setPayloadTarjeta] = useState<IPayloadTarjeta | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (open && reserva) {
                setTarjetasRegistro([]);
                setPayloadTarjeta(null);
                setLoading(true);

                try {
                    const tarjetasData = await getTarjetaRegistroApi(reserva.id);
                    
                    if (Array.isArray(tarjetasData) && tarjetasData.length > 0) {
                        setTarjetasRegistro(tarjetasData);
                        setPayloadTarjeta(tarjetasData[0].payload);
                    } else {
                        setPayloadTarjeta(null);
                    }
                } catch (error) {
                    console.error('Error al cargar:', error);
                    setPayloadTarjeta(null);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [open, reserva]);

    if (!open) return null;

    

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Tarjeta de Alojamiento (TRA)</h2>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Registro Oficial de Huéspedes</p>
            </div>
            <button 
                className="text-slate-400 hover:text-slate-600 transition-colors p-1" 
                onClick={onClose}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="p-6">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mb-4"></div>
                    <p className="text-slate-500 font-medium">Sincronizando con el servidor...</p>
                </div>
            ) : payloadTarjeta ? (
                <div className="space-y-6">
                    
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Establecimiento</label>
                                <p className="text-slate-800 font-semibold">{payloadTarjeta.nombre_establecimiento}</p>
                            </div>
                            <div className="text-right">
                                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">RNT No.</label>
                                <p className="text-slate-600 font-mono">{payloadTarjeta.rnt_establecimiento}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div className="col-span-2 border-b border-slate-100 pb-1">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tight">Datos del Huésped</h3>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-slate-500">Nombre Completo</label>
                            <p className="text-sm text-slate-800 font-medium">{payloadTarjeta.nombres} {payloadTarjeta.apellidos}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500">Identificación</label>
                            <p className="text-sm text-slate-800 font-medium">{payloadTarjeta.tipo_identificacion}: {payloadTarjeta.numero_identificacion}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500">Origen</label>
                            <p className="text-sm text-slate-800">{payloadTarjeta.cuidad_procedencia}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500">Residencia</label>
                            <p className="text-sm text-slate-800">{payloadTarjeta.cuidad_residencia}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-white">
                        <div className="col-span-3 border-b border-slate-100 pb-1">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tight">Detalles de Alojamiento</h3>
                        </div>
                        
                        <div className="p-3 border border-slate-100 rounded-lg shadow-sm">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Check-In</label>
                            <p className="text-sm text-slate-800 font-semibold">{payloadTarjeta.check_in}</p>
                        </div>
                        <div className="p-3 border border-slate-100 rounded-lg shadow-sm">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Habitación</label>
                            <p className="text-sm text-slate-800 font-semibold">{payloadTarjeta.numero_habitacion}</p>
                        </div>
                        <div className="p-3 border border-slate-100 rounded-lg shadow-sm">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Acompañantes</label>
                            <p className="text-sm text-slate-800 font-semibold">{payloadTarjeta.numero_acompanantes}</p>
                        </div>
                        <div className="p-3 border border-slate-100 rounded-lg shadow-sm bg-green-50/30">
                            <label className="block text-[10px] font-bold text-green-600/70 uppercase">Costo Total</label>
                            <p className="text-sm text-green-700 font-bold">${payloadTarjeta.costo}</p>
                        </div>
                        <div className="col-span-2 p-3 border border-slate-100 rounded-lg shadow-sm">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Motivo / Acomodación</label>
                            <p className="text-sm text-slate-800 truncate">{payloadTarjeta.motivo} — {payloadTarjeta.tipo_acomodacion}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-10">
                    <p><strong>Confirma la Reserva, antes de proceder a enviar los datos de la tarjeta de Alojamiento.</strong></p>
                    <p className="text-slate-500 italic">No se encontró información de la tarjeta para esta reserva.</p>
                </div>
            )}
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-between gap-3 border-t border-slate-200">
            <button 
                onClick={onClose} 
                className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
            >
                Cerrar
            </button>
            <div className="flex gap-2">
                <button 
                    onClick={() => window.print()} 
                    className="px-5 py-2 text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-white rounded-lg transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                    Imprimir
                </button>
                <button 
                    onClick={() => onSubmit(tarjetasRegistro[0].id_reserva)}
                    className="px-5 py-2 text-sm font-semibold bg-slate-800 text-white hover:bg-slate-700 rounded-lg shadow-md transition-all flex items-center gap-2"
                >
                    Enviar TRA
                </button>
            </div>
        </div>
    </div>
</div>
    );
}