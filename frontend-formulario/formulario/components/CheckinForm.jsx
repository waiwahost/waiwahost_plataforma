"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    User, Mail, Phone, Calendar, Users, FileText, Check, ShieldCheck,
    CreditCard, Building, ChevronDown, ChevronUp, CheckCircle, AlertCircle
} from 'lucide-react';

// Componente auxiliar para Input Flotante
const FloatingInput = ({ label, name, type = "text", value, onChange, icon, required = false, placeholder = "" }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.toString().length > 0;

    return (
        <div className="relative mb-1">
            <div className={`absolute top-3.5 left-3 text-slate-400 transition-colors ${isFocused ? 'text-indigo-600' : ''}`}>
                {icon}
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                required={required}
                placeholder={isFocused ? placeholder : ""}
                className={`
          peer w-full bg-white border rounded-lg outline-none transition-all duration-200
          ${icon ? 'pl-10' : 'pl-4'} pr-4 pt-5 pb-2 text-slate-800
          ${isFocused
                        ? 'border-indigo-600 ring-1 ring-indigo-600'
                        : 'border-slate-300 hover:border-slate-400'
                    }
        `}
            />
            <label
                className={`
          absolute left-0 pointer-events-none transition-all duration-200
          ${icon ? 'left-10' : 'left-4'}
          ${(isFocused || hasValue)
                        ? '-top-1 text-xs text-indigo-600 font-semibold'
                        : 'top-3.5 text-base text-slate-400'
                    }
        `}
            >
                {label}
            </label>
        </div>
    );
};

const CheckinFormContent = () => {
    const searchParams = useSearchParams();
    const inmuebleIdParam = searchParams.get('inmueble');

    const [formData, setFormData] = useState({
        id_inmueble: 0,
        fecha_inicio: '',
        fecha_fin: '',
        numero_huespedes: 1,
        huespedes: [
            {
                nombre: '',
                apellido: '',
                email: '',
                telefono: '',
                documento_tipo: 'cedula',
                documento_numero: '',
                fecha_nacimiento: '',
                es_principal: true,
            }
        ],
        precio_total: 0,
        total_reserva: 0,
        total_pagado: 0,
        estado: 'pendiente',
        observaciones: '',
        id_empresa: 1,
        plataforma_origen: 'directa',
        terms: false
    });

    const [errors, setErrors] = useState({});
    const [inmuebleInfo, setInmuebleInfo] = useState(null);
    const [loadingInmueble, setLoadingInmueble] = useState(false);
    const [expandedGuest, setExpandedGuest] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (inmuebleIdParam) {
            const id = parseInt(inmuebleIdParam);
            if (!isNaN(id)) {
                setFormData(prev => ({ ...prev, id_inmueble: id }));
                fetchInmuebleInfo(id);
            }
        }
    }, [inmuebleIdParam]);

    const fetchInmuebleInfo = async (id) => {
        try {
            setLoadingInmueble(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/inmuebles/public/${id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setInmuebleInfo(data.data);
                    setFormData(prev => ({ ...prev, id_empresa: data.data.id_empresa }));
                }
            }
        } catch (error) {
            console.error("Error fetching inmueble:", error);
        } finally {
            setLoadingInmueble(false);
        }
    };

    const isGuestComplete = (huesped) => {
        return Boolean(
            huesped.nombre.trim() &&
            huesped.apellido.trim() &&
            huesped.email.trim() &&
            huesped.telefono.trim() &&
            huesped.documento_numero.trim() &&
            huesped.fecha_nacimiento
        );
    };

    const toggleGuest = (index) => {
        setExpandedGuest(prev => (prev === index ? -1 : index));
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleHuespedChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            huespedes: prev.huespedes.map((huesped, i) =>
                i === index ? { ...huesped, [field]: value } : huesped
            )
        }));

        if (errors.huespedes) {
            setErrors(prev => ({ ...prev, huespedes: undefined }));
        }
    };

    const handleNumeroHuespedesChange = (newNumero) => {
        const currentHuespedes = [...formData.huespedes];

        if (newNumero > currentHuespedes.length) {
            const nuevosHuespedes = [];
            for (let i = currentHuespedes.length; i < newNumero; i++) {
                nuevosHuespedes.push({
                    nombre: '',
                    apellido: '',
                    email: '',
                    telefono: '',
                    documento_tipo: 'cedula',
                    documento_numero: '',
                    fecha_nacimiento: '',
                    es_principal: false,
                });
            }
            currentHuespedes.push(...nuevosHuespedes);
        } else if (newNumero < currentHuespedes.length) {
            currentHuespedes.splice(newNumero);
        }

        setFormData(prev => ({
            ...prev,
            numero_huespedes: newNumero,
            huespedes: currentHuespedes
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.id_inmueble) {
            newErrors.id_inmueble = 'No se ha seleccionado un inmueble válido.';
        }

        if (formData.huespedes.length === 0) {
            newErrors.huespedes = 'Debe haber al menos un huésped';
        } else {
            for (let i = 0; i < formData.huespedes.length; i++) {
                const huesped = formData.huespedes[i];
                if (!huesped.nombre.trim()) { newErrors.huespedes = `El nombre del huésped ${i + 1} es requerido`; break; }
                if (!huesped.apellido.trim()) { newErrors.huespedes = `El apellido del huésped ${i + 1} es requerido`; break; }
                if (!huesped.email.trim()) { newErrors.huespedes = `El email del huésped ${i + 1} es requerido`; break; }
                if (!huesped.telefono.trim()) { newErrors.huespedes = `El teléfono del huésped ${i + 1} es requerido`; break; }
                if (!huesped.documento_numero.trim()) { newErrors.huespedes = `El documento del huésped ${i + 1} es requerido`; break; }
                if (!huesped.fecha_nacimiento) { newErrors.huespedes = `La fecha de nacimiento del huésped ${i + 1} es requerida`; break; }
            }
        }

        if (!formData.fecha_inicio) newErrors.fecha_inicio = 'La fecha de llegada es requerida';
        if (!formData.fecha_fin) newErrors.fecha_fin = 'La fecha de salida es requerida';
        if (formData.fecha_inicio && formData.fecha_fin) {
            if (new Date(formData.fecha_inicio) >= new Date(formData.fecha_fin)) {
                newErrors.fecha_fin = 'La fecha de salida debe ser posterior a la llegada';
            }
        }

        if (!formData.terms) {
            newErrors.terms = 'Debes aceptar los términos y condiciones';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/reservas/public`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSubmitted(true);
            } else {
                setSubmitError(data.message || 'Error al enviar la reserva. Inténtalo de nuevo.');
            }
        } catch (error) {
            setSubmitError('Error de conexión. Por favor verifica tu internet e inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="w-full md:w-[60%] bg-white rounded-xl shadow-2xl p-10 text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-serif text-slate-800 mb-4">¡Registro Completado!</h2>
                    <p className="text-slate-600 mb-8">
                        Gracias. Hemos procesado tu registro correctamente para el inmueble <span className="font-semibold">{inmuebleInfo?.nombre}</span>.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            {/* Contenedor principal al 60% en pantallas medianas/grandes */}
            <div className="w-full md:w-[60%] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">

                {/* Encabezado con imagen o color sólido elegante */}
                <div className="bg-slate-900 px-8 py-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-indigo-500 rounded-full opacity-10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-amber-400 rounded-full opacity-10 blur-2xl"></div>

                    <h1 className="relative z-10 text-3xl md:text-4xl font-serif text-white tracking-wide text-center">
                        {inmuebleInfo ? inmuebleInfo.nombre : 'Cargando Inmueble...'}
                    </h1>
                    <p className="relative z-10 text-indigo-200 text-center mt-2 font-light tracking-wider uppercase text-sm">
                        {inmuebleInfo ? inmuebleInfo.direccion : 'Formulario de Pre-Check In'}
                    </p>
                </div>

                {/* Cuerpo del Formulario */}
                <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">

                    {/* Sección 1: Detalles de la Estancia */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-6 flex items-center gap-2">
                            <Calendar size={20} className="text-indigo-600" />
                            Detalles de la Reserva
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Check-in</label>
                                <input
                                    type="date"
                                    value={formData.fecha_inicio}
                                    onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 bg-slate-50 ${errors.fecha_inicio ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                                />
                                {errors.fecha_inicio && <p className="text-red-500 text-xs mt-1">{errors.fecha_inicio}</p>}
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Check-out</label>
                                <input
                                    type="date"
                                    value={formData.fecha_fin}
                                    onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 bg-slate-50 ${errors.fecha_fin ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                                />
                                {errors.fecha_fin && <p className="text-red-500 text-xs mt-1">{errors.fecha_fin}</p>}
                            </div>

                            <div className="relative">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Huéspedes</label>
                                <div className="relative">
                                    <Users size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                    <select
                                        value={formData.numero_huespedes}
                                        onChange={(e) => handleNumeroHuespedesChange(parseInt(e.target.value))}
                                        className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white text-slate-700"
                                    >
                                        {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                                            <option key={num} value={num}>
                                                {num} {num === 1 ? 'Huésped' : 'Huéspedes'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Información de Huéspedes */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-6 flex items-center gap-2">
                            <User size={20} className="text-indigo-600" />
                            Información de Huéspedes
                        </h3>

                        {errors.huespedes && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {errors.huespedes}
                            </div>
                        )}

                        <div className="space-y-4">
                            {formData.huespedes.map((huesped, index) => {
                                const isComplete = isGuestComplete(huesped);
                                const isExpanded = expandedGuest === index;

                                return (
                                    <div key={index} className={`border rounded-xl transition-all duration-200 overflow-hidden ${isExpanded ? 'border-indigo-500 ring-1 ring-indigo-500/20 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <div
                                            className={`flex items-center justify-between p-4 cursor-pointer ${isExpanded ? 'bg-indigo-50/30' : 'bg-white'}`}
                                            onClick={() => toggleGuest(index)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {isComplete ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${index === 0 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300 text-slate-400'}`}>
                                                        <span className="text-xs font-bold">{index + 1}</span>
                                                    </div>
                                                )}
                                                <div className="text-left">
                                                    <h4 className={`font-medium ${isExpanded ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                        {index === 0 ? 'Huésped Principal' : `Acompañante ${index}`}
                                                    </h4>
                                                    <p className="text-xs text-slate-500">
                                                        {huesped.nombre ? `${huesped.nombre} ${huesped.apellido}` : 'Información pendiente'}
                                                    </p>
                                                </div>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="h-5 w-5 text-indigo-600" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="p-6 border-t border-slate-100 bg-white animate-in slide-in-from-top-2 duration-200">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FloatingInput
                                                        label="Nombre"
                                                        value={huesped.nombre}
                                                        onChange={(e) => handleHuespedChange(index, 'nombre', e.target.value)}
                                                        required
                                                    />
                                                    <FloatingInput
                                                        label="Apellido"
                                                        value={huesped.apellido}
                                                        onChange={(e) => handleHuespedChange(index, 'apellido', e.target.value)}
                                                        required
                                                    />
                                                    <FloatingInput
                                                        label="Email"
                                                        type="email"
                                                        value={huesped.email}
                                                        onChange={(e) => handleHuespedChange(index, 'email', e.target.value)}
                                                        icon={<Mail size={18} />}
                                                        required
                                                    />
                                                    <FloatingInput
                                                        label="Teléfono"
                                                        type="tel"
                                                        value={huesped.telefono}
                                                        onChange={(e) => handleHuespedChange(index, 'telefono', e.target.value)}
                                                        icon={<Phone size={18} />}
                                                        required
                                                    />

                                                    <div className="relative mb-1">
                                                        <div className="absolute top-3.5 left-3 text-slate-400">
                                                            <CreditCard size={18} />
                                                        </div>
                                                        <select
                                                            value={huesped.documento_tipo}
                                                            onChange={(e) => handleHuespedChange(index, 'documento_tipo', e.target.value)}
                                                            className="peer w-full bg-white border border-slate-300 rounded-lg outline-none pl-10 pr-4 pt-5 pb-2 text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                                                        >
                                                            <option value="cedula">Cédula</option>
                                                            <option value="pasaporte">Pasaporte</option>
                                                            <option value="tarjeta_identidad">Tarjeta de Identidad</option>
                                                        </select>
                                                        <label className="absolute left-10 top-1 text-xs text-indigo-600 font-semibold pointer-events-none">
                                                            Tipo Documento
                                                        </label>
                                                    </div>

                                                    <FloatingInput
                                                        label="Número Documento"
                                                        value={huesped.documento_numero}
                                                        onChange={(e) => handleHuespedChange(index, 'documento_numero', e.target.value)}
                                                        icon={<FileText size={18} />}
                                                        required
                                                    />

                                                    <div className="md:col-span-2 relative">
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fecha Nacimiento</label>
                                                        <input
                                                            type="date"
                                                            value={huesped.fecha_nacimiento}
                                                            onChange={(e) => handleHuespedChange(index, 'fecha_nacimiento', e.target.value)}
                                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sección 3: Observaciones */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-6 flex items-center gap-2">
                            <FileText size={20} className="text-indigo-600" />
                            Observaciones Adicionales
                        </h3>
                        <textarea
                            value={formData.observaciones}
                            onChange={(e) => handleInputChange('observaciones', e.target.value)}
                            rows="3"
                            placeholder="¿Alguna petición especial?"
                            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 placeholder-slate-400"
                        ></textarea>
                    </div>

                    {/* Términos y Botón */}
                    <div className="pt-4 flex flex-col items-center space-y-6">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.terms}
                                    onChange={(e) => handleInputChange('terms', e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 shadow transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:shadow-md"
                                />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                    <Check size={14} />
                                </span>
                            </div>
                            <span className={`text-sm transition-colors ${errors.terms ? 'text-red-500 font-medium' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                Acepto los términos y condiciones, así como la política de privacidad.
                            </span>
                        </label>

                        {submitError && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center w-full">
                                {submitError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                w-full md:w-auto px-12 py-4 rounded-lg font-semibold text-lg tracking-wide shadow-xl transition-all transform hover:-translate-y-1
                flex items-center gap-2 justify-center
                ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'}
              `}
                        >
                            {isSubmitting ? (
                                <>Procesando...</>
                            ) : (
                                <>
                                    <ShieldCheck size={20} />
                                    Confirmar Check-in
                                </>
                            )}
                        </button>

                        <p className="text-xs text-slate-400 text-center mt-4">
                            Sus datos están protegidos por encriptación SSL de 256-bit.
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default function CheckinForm() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando formulario...</div>}>
            <CheckinFormContent />
        </Suspense>
    );
}
