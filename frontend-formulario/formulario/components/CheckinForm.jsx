"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    User, Mail, Phone, Calendar, Users, FileText, Check, ShieldCheck,
    CreditCard, ChevronDown, ChevronUp, CheckCircle, AlertCircle, X, Building, Globe
} from 'lucide-react';
import PhoneInput from './PhoneInput';
import { CHECKIN_I18N } from '../constants/checkinI18n';

const CheckinFormContent = () => {
    const searchParams = useSearchParams();
    const inmuebleIdParam = searchParams.get('inmueble');
    const reservaIdParam = searchParams.get('reserva');

    // ─── Language state ────────────────────────────────────────────────────────
    const [lang, setLang] = useState('es');
    const t = CHECKIN_I18N[lang];

    const toggleLang = () => setLang(prev => prev === 'es' ? 'en' : 'es');
    // ──────────────────────────────────────────────────────────────────────────

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
                ciudad_residencia: '',
                ciudad_procedencia: '',
                pais_residencia: '',
                pais_procedencia: '',
                motivo_viaje: 'Vacaciones',
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

    const [reservaIdInput, setReservaIdInput] = useState('');
    const [loadingReserva, setLoadingReserva] = useState(false);
    const [errors, setErrors] = useState({});
    const [inmuebleInfo, setInmuebleInfo] = useState(null);
    const [inmueblesList, setInmueblesList] = useState([]);
    const [loadingInmueble, setLoadingInmueble] = useState(false);
    const [loadingList, setLoadingList] = useState(false);
    const [expandedGuest, setExpandedGuest] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paises, setPaises] = useState([]);
    const [ciudadesByPais, setCiudadesByPais] = useState({});
    const [loadingPaises, setLoadingPaises] = useState(false);

    useEffect(() => {
        if (reservaIdParam) {
            setReservaIdInput(reservaIdParam);
            fetchReservaInfo(reservaIdParam);
        } else if (inmuebleIdParam) {
            const id = parseInt(inmuebleIdParam);
            if (!isNaN(id)) {
                setFormData(prev => ({ ...prev, id_inmueble: id }));
                fetchInmuebleInfo(id);
            }
        } else {
            fetchInmueblesList();
        }
        fetchPaises();
    }, [inmuebleIdParam, reservaIdParam]);

    const fetchPaises = async () => {
        try {
            setLoadingPaises(true);
            const res = await fetch('/checkin/api/paises');
            if (res.ok) {
                const data = await res.json();
                if (!data.isError) {
                    setPaises(data.data);
                }
            }
        } catch (error) {
            console.error("Error fetching paises:", error);
        } finally {
            setLoadingPaises(false);
        }
    };

    const fetchCiudades = async (paisId) => {
        if (!paisId || ciudadesByPais[paisId]) return;
        try {
            const res = await fetch(`/checkin/api/ciudades/pais/${paisId}`);
            if (res.ok) {
                const data = await res.json();
                if (!data.isError) {
                    setCiudadesByPais(prev => ({ ...prev, [paisId]: data.data }));
                }
            }
        } catch (error) {
            console.error("Error fetching ciudades:", error);
        }
    };

    const resolveGuestLocations = async (huespedes) => {
        try {
            const res = await fetch('/checkin/api/ciudades');
            if (!res.ok) return huespedes;
            const cidData = await res.json();
            const allCiudades = cidData.data || [];

            const updatedHuespedes = huespedes.map((h) => {
                const updatedH = { ...h };

                if (!updatedH.pais_residencia && updatedH.ciudad_residencia) {
                    const match = allCiudades.find(c => c.nombre === updatedH.ciudad_residencia);
                    if (match) updatedH.pais_residencia = match.id_pais.toString();
                }

                if (!updatedH.pais_procedencia && updatedH.ciudad_procedencia) {
                    const match = allCiudades.find(c => c.nombre === updatedH.ciudad_procedencia);
                    if (match) updatedH.pais_procedencia = match.id_pais.toString();
                }

                return updatedH;
            });

            const paisIds = new Set();
            updatedHuespedes.forEach(h => {
                if (h.pais_residencia) paisIds.add(parseInt(h.pais_residencia));
                if (h.pais_procedencia) paisIds.add(parseInt(h.pais_procedencia));
            });

            await Promise.all(
                Array.from(paisIds).map(async (paisId) => {
                    if (!paisId || ciudadesByPais[paisId]) return;
                    try {
                        const r = await fetch(`/checkin/api/ciudades/pais/${paisId}`);
                        if (r.ok) {
                            const d = await r.json();
                            if (!d.isError) {
                                setCiudadesByPais(prev => ({ ...prev, [paisId]: d.data }));
                            }
                        }
                    } catch (err) {
                        console.error(`Error cargando ciudades para país ${paisId}:`, err);
                    }
                })
            );

            return updatedHuespedes;
        } catch (error) {
            console.error("Error resolviendo ubicaciones de huéspedes:", error);
            return huespedes;
        }
    };

    const fetchInmueblesList = async () => {
        try {
            setLoadingList(true);
            const res = await fetch(`/checkin/api/proxy/inmuebles/public-list`);
            if (res.ok) {
                const data = await res.json();
                if (!data.isError) {
                    setInmueblesList(data.data);
                }
            }
        } catch (error) {
            console.error("Error fetching inmuebles list:", error);
        } finally {
            setLoadingList(false);
        }
    };

    const fetchInmuebleInfo = async (id) => {
        if (!id) return;
        try {
            setLoadingInmueble(true);
            const res = await fetch(`/checkin/api/proxy/inmuebles/public/${id}`);
            if (res.ok) {
                const data = await res.json();
                if (!data.isError) {
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

    const fetchReservaInfo = async (id) => {
        if (!id) return;
        try {
            setLoadingReserva(true);
            const res = await fetch(`/checkin/api/proxy/reservas/public/${id}`);

            if (res.ok) {
                const data = await res.json();
                if (!data.isError && data.data) {
                    const reserva = data.data.data;

                    if (reserva.id_inmueble) {
                        fetchInmuebleInfo(reserva.id_inmueble);
                    }

                    const targetCount = reserva.numero_huespedes || 1;

                    const existingMapped = (reserva.huespedes || []).map(h => ({
                        ...h,
                        fecha_nacimiento: h.fecha_nacimiento ? h.fecha_nacimiento.split('T')[0] : '',
                        motivo_viaje: h.motivo_viaje || h.motivo || 'Vacaciones',
                        pais_residencia: '',
                        ciudad_residencia: h.ciudad_residencia || '',
                        pais_procedencia: '',
                        ciudad_procedencia: h.ciudad_procedencia || '',
                    }));

                    const mappedHuespedes = [...existingMapped];
                    while (mappedHuespedes.length < targetCount) {
                        mappedHuespedes.push({
                            nombre: '',
                            apellido: '',
                            email: '',
                            telefono: '',
                            documento_tipo: 'cedula',
                            documento_numero: '',
                            fecha_nacimiento: '',
                            es_principal: mappedHuespedes.length === 0,
                            ciudad_residencia: '',
                            ciudad_procedencia: '',
                            pais_residencia: '',
                            pais_procedencia: '',
                            motivo_viaje: 'Vacaciones',
                        });
                    }

                    setFormData(prev => ({
                        ...prev,
                        id_inmueble: reserva.id_inmueble,
                        id_reserva: reserva.id,
                        fecha_inicio: reserva.fecha_inicio.split('T')[0],
                        fecha_fin: reserva.fecha_fin.split('T')[0],
                        numero_huespedes: mappedHuespedes.length,
                        huespedes: mappedHuespedes,
                        precio_total: reserva.precio_total,
                        total_reserva: reserva.total_reserva,
                        total_pagado: reserva.total_pagado,
                        estado: reserva.estado,
                        observaciones: reserva.observaciones || '',
                        id_empresa: reserva.id_empresa,
                        plataforma_origen: reserva.plataforma_origen
                    }));

                    resolveGuestLocations(mappedHuespedes).then(resolved => {
                        setFormData(prev => ({ ...prev, huespedes: resolved }));
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching reserva:", error);
        } finally {
            setLoadingReserva(false);
        }
    };

    const handleInmuebleSelect = (e) => {
        const id = parseInt(e.target.value);
        setFormData(prev => ({ ...prev, id_inmueble: id }));
        if (id) {
            fetchInmuebleInfo(id);
        } else {
            setInmuebleInfo(null);
        }
    };

    const handleReservaIdBlur = () => {
        if (reservaIdInput && !reservaIdParam) {
            fetchReservaInfo(reservaIdInput);
        }
    };

    const hasHuespedData = (huesped) => {
        return !!(
            (huesped.nombre && huesped.nombre.trim()) ||
            (huesped.apellido && huesped.apellido.trim()) ||
            (huesped.documento_numero && huesped.documento_numero.trim()) ||
            (huesped.email && huesped.email.trim()) ||
            (huesped.telefono && huesped.telefono.trim())
        );
    };

    const isPrincipalComplete = (huesped) => {
        return Boolean(
            huesped.nombre && huesped.nombre.trim() &&
            huesped.apellido && huesped.apellido.trim() &&
            huesped.email && huesped.email.trim() &&
            huesped.telefono && huesped.telefono.trim() &&
            huesped.documento_numero && huesped.documento_numero.trim() &&
            huesped.fecha_nacimiento
        );
    };

    const isGuestComplete = (huesped, index) => {
        if (index === 0) return isPrincipalComplete(huesped);
        return hasHuespedData(huesped);
    };

    const toggleGuest = (index) => {
        setExpandedGuest(prev => (prev === index ? -1 : index));
    };

    const PLACEHOLDER_VALUES = new Set([
        'Sin nombre', 'Sin apellido', 'sin-email@ejemplo.com',
        'Sin teléfono', 'Sin documento', '1990-01-01',
        'sin nombre', 'sin apellido', 'sin telefono', 'sin documento'
    ]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleHuespedFocus = (index, field) => {
        const currentValue = formData.huespedes[index]?.[field];
        if (currentValue && PLACEHOLDER_VALUES.has(currentValue.trim().toLowerCase())) {
            handleHuespedChange(index, field, '');
        }
        if (currentValue && PLACEHOLDER_VALUES.has(currentValue)) {
            handleHuespedChange(index, field, '');
        }
    };

    const handleHuespedChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            huespedes: prev.huespedes.map((huesped, i) =>
                i === index ? { ...huesped, [field]: value } : huesped
            )
        }));

        if (field === 'pais_residencia' || field === 'pais_procedencia') {
            const paisId = parseInt(value);
            if (!isNaN(paisId)) {
                fetchCiudades(paisId);
            }

            const cityField = field === 'pais_residencia' ? 'ciudad_residencia' : 'ciudad_procedencia';
            setFormData(prev => ({
                ...prev,
                huespedes: prev.huespedes.map((huesped, i) =>
                    i === index ? { ...huesped, [field]: value, [cityField]: '' } : huesped
                )
            }));
        }

        if (errors.huespedes) {
            setErrors(prev => ({ ...prev, huespedes: undefined }));
        }
    };

    const handleNumeroHuespedesChange = (newNumero) => {
        const currentHuespedes = [...formData.huespedes];

        if (newNumero > currentHuespedes.length) {
            for (let i = currentHuespedes.length; i < newNumero; i++) {
                currentHuespedes.push({
                    nombre: '',
                    apellido: '',
                    email: '',
                    telefono: '',
                    documento_tipo: 'cedula',
                    documento_numero: '',
                    fecha_nacimiento: '',
                    es_principal: false,
                    ciudad_residencia: '',
                    ciudad_procedencia: '',
                    pais_residencia: '',
                    pais_procedencia: '',
                    motivo_viaje: 'Vacaciones',
                });
            }
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
            newErrors.id_inmueble = t.errorSelectAccommodation;
        }

        if (formData.huespedes.length === 0) {
            newErrors.huespedes = t.errorAtLeastOneGuest;
        } else {
            const principal = formData.huespedes[0];
            if (!principal.nombre || !principal.nombre.trim()) {
                newErrors.huespedes = t.errorPrincipalFirstName;
            } else if (!principal.apellido || !principal.apellido.trim()) {
                newErrors.huespedes = t.errorPrincipalLastName;
            } else if (!principal.email || !principal.email.trim()) {
                newErrors.huespedes = t.errorPrincipalEmail;
            } else if (!principal.telefono || !principal.telefono.trim()) {
                newErrors.huespedes = t.errorPrincipalPhone;
            } else if (!principal.documento_numero || !principal.documento_numero.trim()) {
                newErrors.huespedes = t.errorPrincipalDoc;
            } else if (!principal.fecha_nacimiento) {
                newErrors.huespedes = t.errorPrincipalBirth;
            }

            if (!newErrors.huespedes) {
                for (let i = 1; i < formData.huespedes.length; i++) {
                    const h = formData.huespedes[i];
                    if (hasHuespedData(h)) {
                        if (h.email && h.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(h.email)) {
                            newErrors.huespedes = t.errorGuestEmail(i + 1);
                            break;
                        }
                    }
                }
            }
        }

        if (!formData.fecha_inicio) newErrors.fecha_inicio = t.errorCheckIn;
        if (!formData.fecha_fin) newErrors.fecha_fin = t.errorCheckOut;
        if (formData.fecha_inicio && formData.fecha_fin) {
            if (new Date(formData.fecha_inicio) >= new Date(formData.fecha_fin)) {
                newErrors.fecha_fin = t.errorDateOrder;
            }
        }

        if (!formData.terms) {
            newErrors.terms = t.errorTerms;
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
            const huespedesToSend = formData.huespedes
                .filter((h, i) => i === 0 || hasHuespedData(h))
                .map(h => ({
                    ...h,
                    motivo_viaje: h.motivo_viaje && h.motivo_viaje.trim() ? h.motivo_viaje : undefined,
                    email: h.email && h.email.trim() ? h.email : undefined,
                    telefono: h.telefono && h.telefono.trim() ? h.telefono : undefined,
                    fecha_nacimiento: h.fecha_nacimiento && h.fecha_nacimiento.trim() ? h.fecha_nacimiento : undefined,
                    documento_numero: h.documento_numero && h.documento_numero.trim() ? h.documento_numero : undefined,
                    ciudad_residencia: h.ciudad_residencia && h.ciudad_residencia.trim() ? h.ciudad_residencia : undefined,
                    ciudad_procedencia: h.ciudad_procedencia && h.ciudad_procedencia.trim() ? h.ciudad_procedencia : undefined,
                    pais_residencia: undefined,
                    pais_procedencia: undefined,
                }));

            const payload = {
                ...formData,
                huespedes: huespedesToSend,
                terms: undefined,
            };

            const res = await fetch(`/checkin/api/proxy/reservas/public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSubmitted(true);
            } else {
                setSubmitError(data.message || t.connectionError);
            }
        } catch (error) {
            setSubmitError(t.connectionError);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Success screen ────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="w-full md:w-[60%] bg-white rounded-xl shadow-2xl p-10 text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-serif text-slate-800 mb-4">{t.successTitle}</h2>
                    <p className="text-slate-600 mb-8">
                        {t.successMessage} <span className="font-semibold">{inmuebleInfo?.nombre}</span>.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
                    >
                        {t.successButton}
                    </button>
                </div>
            </div>
        );
    }

    // ─── Motivos de viaje ──────────────────────────────────────────────────────
    const TRAVEL_REASONS = ['Negocios', 'Vacaciones', 'Visitas', 'Educacion', 'Salud', 'Religion', 'Compras', 'Transito', 'Otros'];

    // ─── Document types ────────────────────────────────────────────────────────
    const DOC_TYPES = [
        { value: 'cedula', label: t.cedula },
        { value: 'pasaporte', label: t.pasaporte },
        { value: 'tarjeta_identidad', label: t.tarjeta_identidad },
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="w-full md:w-[60%] mx-auto">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">

                    {/* ── Header ─────────────────────────────────────────────── */}
                    <div className="flex items-center justify-between p-6 border-b bg-white">
                        <h2 className="text-xl font-semibold text-gray-900">{t.formTitle}</h2>

                        {/* Language toggle */}
                        <button
                            type="button"
                            onClick={toggleLang}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-600 transition-colors"
                            aria-label="Switch language"
                        >
                            <Globe className="w-4 h-4" />
                            {t.langToggle}
                        </button>
                    </div>

                    {/* ── Form body ───────────────────────────────────────────── */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {/* Row: Inmueble selector + Reservation ID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.accommodation}
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <select
                                        value={String(formData.id_inmueble)}
                                        onChange={handleInmuebleSelect}
                                        disabled={!!inmuebleIdParam || loadingList || !!reservaIdParam}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal appearance-none bg-white ${errors.id_inmueble ? 'border-red-300' : 'border-gray-300'} ${(!!inmuebleIdParam || !!reservaIdParam) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="0">{t.selectAccommodation}</option>
                                        {inmuebleIdParam || reservaIdParam ? (
                                            loadingInmueble ? (
                                                <option disabled>{t.loadingInfo}</option>
                                            ) : inmuebleInfo ? (
                                                <option value={String(inmuebleInfo.id_inmueble)}>{inmuebleInfo.nombre}</option>
                                            ) : (
                                                <option disabled>{t.notFound}</option>
                                            )
                                        ) : (
                                            inmueblesList.map(inmueble => (
                                                <option key={inmueble.id_inmueble} value={String(inmueble.id_inmueble)}>
                                                    {inmueble.nombre}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                                {errors.id_inmueble && <p className="text-red-500 text-xs mt-1">{errors.id_inmueble}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.reservationId}
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={reservaIdInput}
                                        onChange={(e) => setReservaIdInput(e.target.value)}
                                        onBlur={handleReservaIdBlur}
                                        disabled={!!reservaIdParam || loadingReserva}
                                        placeholder={t.reservationIdPlaceholder}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${!!reservaIdParam ? 'bg-gray-100 cursor-not-allowed' : ''} ${loadingReserva ? 'bg-gray-50' : ''}`}
                                    />
                                    {loadingReserva && (
                                        <div className="absolute right-3 top-3">
                                            <div className="animate-spin h-4 w-4 border-2 border-tourism-teal border-t-transparent rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Dates + number of guests */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.checkInDate}
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
                                    {t.checkOutDate}
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
                                    {t.numberOfGuests}
                                </label>
                                <select
                                    value={formData.numero_huespedes}
                                    onChange={(e) => handleNumeroHuespedesChange(parseInt(e.target.value))}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal ${errors.numero_huespedes ? 'border-red-300' : 'border-gray-300'}`}
                                >
                                    {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                                        <option key={num} value={num}>
                                            {num} {num === 1 ? t.guestSingular : t.guestPlural}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Guests section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {t.guestInfoTitle}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                {t.guestInfoSubtitle}{' '}
                                <span className="font-medium text-gray-700">{t.guestInfoSubtitleBold}</span>{' '}
                                {t.guestInfoSubtitleEnd}
                            </p>
                            {errors.huespedes && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {errors.huespedes}
                                </div>
                            )}

                            {formData.huespedes.map((huesped, index) => {
                                const isComplete = isGuestComplete(huesped, index);
                                const isEmpty = index > 0 && !hasHuespedData(huesped);
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
                                                    <AlertCircle className={`h-5 w-5 ${index === 0 ? 'text-orange-400' : 'text-gray-300'}`} />
                                                )}
                                                <div>
                                                    <h4 className="text-md font-medium text-gray-800">
                                                        {index === 0 ? t.principalGuest : `${t.companionGuest} ${index}`}
                                                    </h4>
                                                    {index === 0 && (
                                                        <span className="text-xs text-red-500 font-medium">{t.required}</span>
                                                    )}
                                                    {index > 0 && isEmpty && (
                                                        <span className="text-xs text-gray-400">{t.optional}</span>
                                                    )}
                                                    {index > 0 && !isEmpty && (
                                                        <span className="text-xs text-green-600">{t.withData}</span>
                                                    )}
                                                </div>
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
                                                    {/* First Name */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t.firstName} {index === 0 ? '*' : ''}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={huesped.nombre}
                                                            onChange={(e) => handleHuespedChange(index, 'nombre', e.target.value)}
                                                            onFocus={() => handleHuespedFocus(index, 'nombre')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder={t.firstName}
                                                        />
                                                    </div>
                                                    {/* Last Name */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t.lastName} {index === 0 ? '*' : ''}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={huesped.apellido}
                                                            onChange={(e) => handleHuespedChange(index, 'apellido', e.target.value)}
                                                            onFocus={() => handleHuespedFocus(index, 'apellido')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder={t.lastName}
                                                        />
                                                    </div>
                                                    {/* Email */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t.email} {index === 0 ? '*' : ''}
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={huesped.email}
                                                            onChange={(e) => handleHuespedChange(index, 'email', e.target.value)}
                                                            onFocus={() => handleHuespedFocus(index, 'email')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder={t.emailPlaceholder}
                                                        />
                                                    </div>
                                                    {/* Phone */}
                                                    <div>
                                                        <PhoneInput
                                                            label={`${t.phone}${index === 0 ? ' *' : ''}`}
                                                            value={huesped.telefono}
                                                            onChange={(value) => handleHuespedChange(index, 'telefono', value)}
                                                            onFocus={() => handleHuespedFocus(index, 'telefono')}
                                                            placeholder={t.phonePlaceholder}
                                                            error={index === 0 && errors.huespedes && !huesped.telefono?.trim() ? t.required : ""}
                                                            required={index === 0}
                                                        />
                                                    </div>
                                                    {/* Document Type */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t.docType} {index === 0 ? '*' : ''}
                                                        </label>
                                                        <select
                                                            value={huesped.documento_tipo}
                                                            onChange={(e) => handleHuespedChange(index, 'documento_tipo', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                        >
                                                            {DOC_TYPES.map(dt => (
                                                                <option key={dt.value} value={dt.value}>{dt.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {/* Document Number */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t.docNumber} {index === 0 ? '*' : ''}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={huesped.documento_numero}
                                                            onChange={(e) => handleHuespedChange(index, 'documento_numero', e.target.value)}
                                                            onFocus={() => handleHuespedFocus(index, 'documento_numero')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder={t.docNumberPlaceholder}
                                                        />
                                                    </div>
                                                    {/* Birth Date */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t.birthDate} {index === 0 ? '*' : ''}
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={huesped.fecha_nacimiento}
                                                            onChange={(e) => handleHuespedChange(index, 'fecha_nacimiento', e.target.value)}
                                                            onFocus={() => handleHuespedFocus(index, 'fecha_nacimiento')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                        />
                                                    </div>
                                                    {/* Travel Reason */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t.travelReason}
                                                        </label>
                                                        <select
                                                            value={huesped.motivo_viaje || ''}
                                                            onChange={(e) => handleHuespedChange(index, 'motivo_viaje', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                        >
                                                            <option value="">{t.selectReason}</option>
                                                            {TRAVEL_REASONS.map(reason => (
                                                                <option key={reason} value={reason}>{t[reason]}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {/* Country of Residence */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t.countryResidence}
                                                        </label>
                                                        <select
                                                            value={huesped.pais_residencia || ''}
                                                            onChange={(e) => handleHuespedChange(index, 'pais_residencia', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                        >
                                                            <option value="">{t.selectCountry}</option>
                                                            {paises.map(p => (
                                                                <option key={p.id_pais} value={p.id_pais}>{p.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {/* City of Residence */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t.cityResidence}
                                                        </label>
                                                        <select
                                                            value={huesped.ciudad_residencia}
                                                            onChange={(e) => handleHuespedChange(index, 'ciudad_residencia', e.target.value)}
                                                            disabled={!huesped.pais_residencia}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal disabled:bg-gray-50 disabled:text-gray-400"
                                                        >
                                                            <option value="">{t.selectCity}</option>
                                                            {huesped.pais_residencia && (ciudadesByPais[parseInt(huesped.pais_residencia)] || []).map(c => (
                                                                <option key={c.id_ciudad} value={c.nombre}>{c.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {/* Country of Origin */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t.countryOrigin}
                                                        </label>
                                                        <select
                                                            value={huesped.pais_procedencia || ''}
                                                            onChange={(e) => handleHuespedChange(index, 'pais_procedencia', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                        >
                                                            <option value="">{t.selectCountry}</option>
                                                            {paises.map(p => (
                                                                <option key={p.id_pais} value={p.id_pais}>{p.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {/* City of Origin */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t.cityOrigin}
                                                        </label>
                                                        <select
                                                            value={huesped.ciudad_procedencia}
                                                            onChange={(e) => handleHuespedChange(index, 'ciudad_procedencia', e.target.value)}
                                                            disabled={!huesped.pais_procedencia}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal disabled:bg-gray-50 disabled:text-gray-400"
                                                        >
                                                            <option value="">{t.selectCity}</option>
                                                            {huesped.pais_procedencia && (ciudadesByPais[parseInt(huesped.pais_procedencia)] || []).map(c => (
                                                                <option key={c.id_ciudad} value={c.nombre}>{c.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Observations */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.observations}
                            </label>
                            <textarea
                                value={formData.observaciones}
                                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                placeholder={t.observationsPlaceholder}
                                rows={3}
                            />
                        </div>

                        {/* Terms + Submit */}
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
                                    {t.termsLabel}
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
                                    {isSubmitting ? t.submitting : (
                                        <>
                                            <ShieldCheck size={18} />
                                            {t.submit}
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
        <Suspense fallback={<div className="p-8 text-center text-gray-500">{CHECKIN_I18N.es.loadingForm}</div>}>
            <CheckinFormContent />
        </Suspense>
    );
}
