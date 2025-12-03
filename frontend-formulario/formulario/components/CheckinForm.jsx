"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    User, Mail, Phone, Calendar, Users, FileText, Check, ShieldCheck,
    CreditCard, ChevronDown, ChevronUp, CheckCircle, AlertCircle, X
} from 'lucide-react';

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
            {/* Div que abarca el 60% del espacio dentro del div inicial centrado */}
            <div className="w-full md:w-[60%] mx-auto">
                {/* Componente tipo popup/modal */}
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Encabezado */}
                    <div className="flex items-center justify-between p-6 border-b bg-white">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {inmuebleInfo ? `Registro - ${inmuebleInfo.nombre}` : 'Registro de Huéspedes'}
                            </h2>
                            {inmuebleInfo && (
                                <p className="text-sm text-gray-500 mt-1">{inmuebleInfo.direccion}</p>
                            )}
                        </div>
                    </div>

                    {/* Cuerpo del Formulario */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {/* Sección Fechas y Huéspedes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Llegada *
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_inicio}
                                    onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${errors.fecha_inicio ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.fecha_inicio && <p className="text-red-500 text-xs mt-1">{errors.fecha_inicio}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Salida *
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_fin}
                                    onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${errors.fecha_fin ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.fecha_fin && <p className="text-red-500 text-xs mt-1">{errors.fecha_fin}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número de Huéspedes *
                                </label>
                                <select
                                    value={formData.numero_huespedes}
                                    onChange={(e) => handleNumeroHuespedesChange(parseInt(e.target.value))}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${errors.numero_huespedes ? 'border-red-300' : 'border-gray-300'}`}
                                >
                                    {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                                        <option key={num} value={num}>
                                            {num} {num === 1 ? 'Huésped' : 'Huéspedes'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Sección Huéspedes */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Información de Huéspedes
                            </h3>
                            {errors.huespedes && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {errors.huespedes}
                                </div>
                            )}

                            {formData.huespedes.map((huesped, index) => {
                                const isComplete = isGuestComplete(huesped);
                                const isExpanded = expandedGuest === index;

                                return (
                                    <div key={index} className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                                        <div
                                            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                                            onClick={() => toggleGuest(index)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {isComplete ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-gray-400" />
                                                )}
                                                <h4 className="text-md font-medium text-gray-800">
                                                    {index === 0 ? 'Huésped Principal' : `Huésped Acompañante ${index}`}
                                                </h4>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="h-5 w-5 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-gray-500" />
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="p-4 border-t border-gray-200 bg-white">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                                        <input
                                                            type="text"
                                                            value={huesped.nombre}
                                                            onChange={(e) => handleHuespedChange(index, 'nombre', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder="Nombre"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                                                        <input
                                                            type="text"
                                                            value={huesped.apellido}
                                                            onChange={(e) => handleHuespedChange(index, 'apellido', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder="Apellido"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                                        <input
                                                            type="email"
                                                            value={huesped.email}
                                                            onChange={(e) => handleHuespedChange(index, 'email', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder="correo@ejemplo.com"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                                                        <input
                                                            type="tel"
                                                            value={huesped.telefono}
                                                            onChange={(e) => handleHuespedChange(index, 'telefono', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder="+57 300 123 4567"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento *</label>
                                                        <select
                                                            value={huesped.documento_tipo}
                                                            onChange={(e) => handleHuespedChange(index, 'documento_tipo', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                        >
                                                            <option value="cedula">Cédula</option>
                                                            <option value="pasaporte">Pasaporte</option>
                                                            <option value="tarjeta_identidad">Tarjeta de Identidad</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento *</label>
                                                        <input
                                                            type="text"
                                                            value={huesped.documento_numero}
                                                            onChange={(e) => handleHuespedChange(index, 'documento_numero', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder="Número de documento"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
                                                        <input
                                                            type="date"
                                                            value={huesped.fecha_nacimiento}
                                                            onChange={(e) => handleHuespedChange(index, 'fecha_nacimiento', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Observaciones */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Observaciones Adicionales
                            </label>
                            <textarea
                                value={formData.observaciones}
                                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                placeholder="¿Alguna petición especial?"
                                rows={3}
                            />
                        </div>

                        {/* Términos y Botón */}
                        <div className="pt-4 border-t border-gray-100">
                            <label className="flex items-start gap-3 cursor-pointer group mb-6">
                                <div className="relative flex items-center pt-1">
                                    <input
                                        type="checkbox"
                                        checked={formData.terms}
                                        onChange={(e) => handleInputChange('terms', e.target.checked)}
                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-tourism-teal checked:bg-tourism-teal hover:border-tourism-teal"
                                    />
                                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[40%] text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                                        <Check size={12} />
                                    </span>
                                </div>
                                <span className={`text-sm ${errors.terms ? 'text-red-500 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>
                                    Acepto los términos y condiciones, así como la política de privacidad.
                                </span>
                            </label>

                            {submitError && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center w-full mb-4">
                                    {submitError}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`
                                        px-6 py-3 rounded-md font-medium text-white shadow-sm transition-all
                                        flex items-center gap-2
                                        ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-tourism-teal hover:bg-teal-700'}
                                    `}
                                >
                                    {isSubmitting ? 'Procesando...' : (
                                        <>
                                            <ShieldCheck size={18} />
                                            Confirmar Check-in
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
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
