"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    User, Mail, Phone, Calendar, Users, FileText, Check, ShieldCheck,
    CreditCard, ChevronDown, ChevronUp, CheckCircle, AlertCircle, X, Building
} from 'lucide-react';
import PhoneInput from './PhoneInput';

const CheckinFormContent = () => {
    const searchParams = useSearchParams();
    const inmuebleIdParam = searchParams.get('inmueble');
    const reservaIdParam = searchParams.get('reserva');

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

    /**
     * Resuelve el pais_id de cada huésped a partir del nombre de su ciudad guardada.
     * Carga las ciudades necesarias para cada país.
     * Usa la misma lógica que CreateReservaModal.
     */
    const resolveGuestLocations = async (huespedes) => {
        try {
            // 1. Traer todas las ciudades para poder cruzar nombre → id_pais
            const res = await fetch('/checkin/api/ciudades');
            if (!res.ok) return huespedes;
            const cidData = await res.json();
            const allCiudades = cidData.data || [];

            // 2. Para cada huésped, resolver pais_residencia y pais_procedencia
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

            // 3. Recopilar todos los ids de países únicos
            const paisIds = new Set();
            updatedHuespedes.forEach(h => {
                if (h.pais_residencia) paisIds.add(parseInt(h.pais_residencia));
                if (h.pais_procedencia) paisIds.add(parseInt(h.pais_procedencia));
            });

            // 4. Cargar ciudades de cada país en paralelo
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

                    // Mapear los huéspedes existentes, añadir campos de país vacíos
                    const existingMapped = (reserva.huespedes || []).map(h => ({
                        ...h,
                        fecha_nacimiento: h.fecha_nacimiento ? h.fecha_nacimiento.split('T')[0] : '',
                        motivo_viaje: h.motivo_viaje || h.motivo || 'Vacaciones',
                        pais_residencia: '',
                        ciudad_residencia: h.ciudad_residencia || '',
                        pais_procedencia: '',
                        ciudad_procedencia: h.ciudad_procedencia || '',
                    }));

                    // Completar con huéspedes vacíos hasta llegar a targetCount
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

                    // Resolver países y cargar ciudades en background
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

    // Un huésped "tiene datos reales" si al menos un campo clave no está vacío
    const hasHuespedData = (huesped) => {
        return !!(
            (huesped.nombre && huesped.nombre.trim()) ||
            (huesped.apellido && huesped.apellido.trim()) ||
            (huesped.documento_numero && huesped.documento_numero.trim()) ||
            (huesped.email && huesped.email.trim()) ||
            (huesped.telefono && huesped.telefono.trim())
        );
    };

    // El huésped principal se considera completo si tiene todos sus datos obligatorios
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

    // Para los acompañantes: checkmark verde si tienen algún dato, gris si están vacíos
    const isGuestComplete = (huesped, index) => {
        if (index === 0) return isPrincipalComplete(huesped);
        return hasHuespedData(huesped);
    };

    const toggleGuest = (index) => {
        setExpandedGuest(prev => (prev === index ? -1 : index));
    };

    // Valores que el backend pone como placeholder cuando no hay dato real
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

    // Al hacer focus en un campo de huésped, limpiar si tiene valor placeholder
    const handleHuespedFocus = (index, field) => {
        const currentValue = formData.huespedes[index]?.[field];
        if (currentValue && PLACEHOLDER_VALUES.has(currentValue.trim().toLowerCase())) {
            handleHuespedChange(index, field, '');
        }
        // También limpiar si tiene el value exacto (case-sensitive)
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

        // Si el campo es un país, cargar sus ciudades y limpiar ciudad
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
            newErrors.id_inmueble = 'Debes seleccionar un apartamento/alojamiento.';
        }

        if (formData.huespedes.length === 0) {
            newErrors.huespedes = 'Debe haber al menos un huésped';
        } else {
            // Solo validar el huésped principal (index 0)
            const principal = formData.huespedes[0];
            if (!principal.nombre || !principal.nombre.trim()) {
                newErrors.huespedes = 'El nombre del huésped principal es requerido';
            } else if (!principal.apellido || !principal.apellido.trim()) {
                newErrors.huespedes = 'El apellido del huésped principal es requerido';
            } else if (!principal.email || !principal.email.trim()) {
                newErrors.huespedes = 'El email del huésped principal es requerido';
            } else if (!principal.telefono || !principal.telefono.trim()) {
                newErrors.huespedes = 'El teléfono del huésped principal es requerido';
            } else if (!principal.documento_numero || !principal.documento_numero.trim()) {
                newErrors.huespedes = 'El documento del huésped principal es requerido';
            } else if (!principal.fecha_nacimiento) {
                newErrors.huespedes = 'La fecha de nacimiento del huésped principal es requerida';
            }

            // Para acompañantes: si tienen algún dato, validar mínimo nombre+apellido
            if (!newErrors.huespedes) {
                for (let i = 1; i < formData.huespedes.length; i++) {
                    const h = formData.huespedes[i];
                    if (hasHuespedData(h)) {
                        if (h.email && h.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(h.email)) {
                            newErrors.huespedes = `El email del huésped ${i + 1} no es válido`;
                            break;
                        }
                    }
                }
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
            // Filtrar huéspedes: el principal siempre va, los acompañantes solo si tienen datos
            // Limpiar campos opcionales vacíos para no romper enums en el backend
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
                    // No enviar campos de UI al backend
                    pais_residencia: undefined,
                    pais_procedencia: undefined,
                }));

            const payload = {
                ...formData,
                huespedes: huespedesToSend,
                terms: undefined, // no enviar al backend
            };

            const res = await fetch(`/checkin/api/proxy/reservas/public`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
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
            <div className="w-full md:w-[60%] mx-auto">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Encabezado */}
                    <div className="flex items-center justify-between p-6 border-b bg-white">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                CheckIn
                            </h2>
                        </div>
                    </div>

                    {/* Cuerpo del Formulario */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {/* Fila: Selector de Inmueble y ID Reserva */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Selector de Inmueble */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Apartamento / Alojamiento *
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <select
                                        value={String(formData.id_inmueble)}
                                        onChange={handleInmuebleSelect}
                                        disabled={!!inmuebleIdParam || loadingList || !!reservaIdParam}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal appearance-none bg-white ${errors.id_inmueble ? 'border-red-300' : 'border-gray-300'} ${(!!inmuebleIdParam || !!reservaIdParam) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="0">Selecciona un alojamiento</option>
                                        {inmuebleIdParam || reservaIdParam ? (
                                            loadingInmueble ? (
                                                <option disabled>Cargando información...</option>
                                            ) : inmuebleInfo ? (
                                                <option value={String(inmuebleInfo.id_inmueble)}>{inmuebleInfo.nombre}</option>
                                            ) : (
                                                <option disabled>Inmueble no encontrado</option>
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

                            {/* ID Reserva */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ID Reserva (Opcional)
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={reservaIdInput}
                                        onChange={(e) => setReservaIdInput(e.target.value)}
                                        onBlur={handleReservaIdBlur}
                                        disabled={!!reservaIdParam || loadingReserva}
                                        placeholder="Ingresa ID de reserva"
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
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                Información de Huéspedes
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Solo el <span className="font-medium text-gray-700">Huésped Principal</span> es obligatorio. Los acompañantes son opcionales.
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
                                                        {index === 0 ? 'Huésped Principal' : `Huésped Acompañante ${index}`}
                                                    </h4>
                                                    {index === 0 && (
                                                        <span className="text-xs text-red-500 font-medium">Obligatorio</span>
                                                    )}
                                                    {index > 0 && isEmpty && (
                                                        <span className="text-xs text-gray-400">Opcional — sin datos</span>
                                                    )}
                                                    {index > 0 && !isEmpty && (
                                                        <span className="text-xs text-green-600">Con datos</span>
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
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Nombre {index === 0 ? '*' : ''}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={huesped.nombre}
                                                            onChange={(e) => handleHuespedChange(index, 'nombre', e.target.value)}
                                                            onFocus={() => handleHuespedFocus(index, 'nombre')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder="Nombre"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Apellido {index === 0 ? '*' : ''}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={huesped.apellido}
                                                            onChange={(e) => handleHuespedChange(index, 'apellido', e.target.value)}
                                                            onFocus={() => handleHuespedFocus(index, 'apellido')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder="Apellido"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Email {index === 0 ? '*' : ''}
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={huesped.email}
                                                            onChange={(e) => handleHuespedChange(index, 'email', e.target.value)}
                                                            onFocus={() => handleHuespedFocus(index, 'email')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder="correo@ejemplo.com"
                                                        />
                                                    </div>
                                                    <div>
                                                        <PhoneInput
                                                            label={`Teléfono${index === 0 ? ' *' : ''}`}
                                                            value={huesped.telefono}
                                                            onChange={(value) => handleHuespedChange(index, 'telefono', value)}
                                                            onFocus={() => handleHuespedFocus(index, 'telefono')}
                                                            placeholder="300 123 4567"
                                                            error={index === 0 && errors.huespedes && !huesped.telefono?.trim() ? "Requerido" : ""}
                                                            required={index === 0}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Tipo de Documento {index === 0 ? '*' : ''}
                                                        </label>
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
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Número de Documento {index === 0 ? '*' : ''}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={huesped.documento_numero}
                                                            onChange={(e) => handleHuespedChange(index, 'documento_numero', e.target.value)}
                                                            onFocus={() => handleHuespedFocus(index, 'documento_numero')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                            placeholder="Número de documento"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Fecha de Nacimiento {index === 0 ? '*' : ''}
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={huesped.fecha_nacimiento}
                                                            onChange={(e) => handleHuespedChange(index, 'fecha_nacimiento', e.target.value)}
                                                            onFocus={() => handleHuespedFocus(index, 'fecha_nacimiento')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Motivo de Viaje
                                                        </label>
                                                        <select
                                                            value={huesped.motivo_viaje || ''}
                                                            onChange={(e) => handleHuespedChange(index, 'motivo_viaje', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                        >
                                                            <option value="">Seleccione un motivo</option>
                                                            <option value="Negocios">Negocios</option>
                                                            <option value="Vacaciones">Vacaciones</option>
                                                            <option value="Visitas">Visitas</option>
                                                            <option value="Educacion">Educacion</option>
                                                            <option value="Salud">Salud</option>
                                                            <option value="Religion">Religion</option>
                                                            <option value="Compras">Compras</option>
                                                            <option value="Transito">Transito</option>
                                                            <option value="Otros">Otros</option>
                                                        </select>
                                                    </div>
                                                    {/* País de Residencia */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            País de Residencia
                                                        </label>
                                                        <select
                                                            value={huesped.pais_residencia || ''}
                                                            onChange={(e) => handleHuespedChange(index, 'pais_residencia', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                        >
                                                            <option value="">Selecciona un país</option>
                                                            {paises.map(p => (
                                                                <option key={p.id_pais} value={p.id_pais}>{p.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {/* Ciudad de Residencia */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Ciudad de Residencia
                                                        </label>
                                                        <select
                                                            value={huesped.ciudad_residencia}
                                                            onChange={(e) => handleHuespedChange(index, 'ciudad_residencia', e.target.value)}
                                                            disabled={!huesped.pais_residencia}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal disabled:bg-gray-50 disabled:text-gray-400"
                                                        >
                                                            <option value="">Selecciona una ciudad</option>
                                                            {huesped.pais_residencia && (ciudadesByPais[parseInt(huesped.pais_residencia)] || []).map(c => (
                                                                <option key={c.id_ciudad} value={c.nombre}>{c.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {/* País de Procedencia */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            País de Procedencia
                                                        </label>
                                                        <select
                                                            value={huesped.pais_procedencia || ''}
                                                            onChange={(e) => handleHuespedChange(index, 'pais_procedencia', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal"
                                                        >
                                                            <option value="">Selecciona un país</option>
                                                            {paises.map(p => (
                                                                <option key={p.id_pais} value={p.id_pais}>{p.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {/* Ciudad de Procedencia */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Ciudad de Procedencia
                                                        </label>
                                                        <select
                                                            value={huesped.ciudad_procedencia}
                                                            onChange={(e) => handleHuespedChange(index, 'ciudad_procedencia', e.target.value)}
                                                            disabled={!huesped.pais_procedencia}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal disabled:bg-gray-50 disabled:text-gray-400"
                                                        >
                                                            <option value="">Selecciona una ciudad</option>
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
