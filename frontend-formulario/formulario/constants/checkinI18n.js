/**
 * Textos bilingüe para el formulario de check-in.
 * Uso: const t = CHECKIN_I18N[lang];  // lang = 'es' | 'en'
 */
export const CHECKIN_I18N = {
    es: {
        // ---------- Header ----------
        formTitle: 'Check-In',
        langToggle: 'English',

        // ---------- Formulario general ----------
        accommodation: 'Apartamento / Alojamiento *',
        selectAccommodation: 'Selecciona un alojamiento',
        loadingInfo: 'Cargando información...',
        notFound: 'Inmueble no encontrado',
        reservationId: 'ID Reserva (Opcional)',
        reservationIdPlaceholder: 'Ingresa ID de reserva',
        checkInDate: 'Fecha de Llegada *',
        checkOutDate: 'Fecha de Salida *',
        numberOfGuests: 'Número de Huéspedes *',
        guestSingular: 'Huésped',
        guestPlural: 'Huéspedes',

        // ---------- Sección huéspedes ----------
        guestInfoTitle: 'Información de Huéspedes',
        guestInfoSubtitle: 'Solo el',
        guestInfoSubtitleBold: 'Huésped Principal',
        guestInfoSubtitleEnd: 'es obligatorio. Los acompañantes son opcionales.',
        principalGuest: 'Huésped Principal',
        companionGuest: 'Huésped Acompañante',
        required: 'Obligatorio',
        optional: 'Opcional — sin datos',
        withData: 'Con datos',

        // ---------- Campos de huésped ----------
        firstName: 'Nombre',
        lastName: 'Apellido',
        email: 'Email',
        phone: 'Teléfono',
        docType: 'Tipo de Documento',
        docNumber: 'Número de Documento',
        birthDate: 'Fecha de Nacimiento',
        travelReason: 'Motivo de Viaje',
        countryResidence: 'País de Residencia',
        cityResidence: 'Ciudad de Residencia',
        countryOrigin: 'País de Procedencia',
        cityOrigin: 'Ciudad de Procedencia',
        selectCountry: 'Selecciona un país',
        selectCity: 'Selecciona una ciudad',
        selectReason: 'Seleccione un motivo',
        emailPlaceholder: 'correo@ejemplo.com',
        phonePlaceholder: '300 123 4567',
        docNumberPlaceholder: 'Número de documento',

        // ---------- Tipos de documento ----------
        cedula: 'Cédula',
        pasaporte: 'Pasaporte',
        tarjeta_identidad: 'Tarjeta de Identidad',

        // ---------- Motivos de viaje ----------
        Negocios: 'Negocios',
        Vacaciones: 'Vacaciones',
        Visitas: 'Visitas',
        Educacion: 'Educación',
        Salud: 'Salud',
        Religion: 'Religión',
        Compras: 'Compras',
        Transito: 'Tránsito',
        Otros: 'Otros',

        // ---------- Observaciones ----------
        observations: 'Observaciones Adicionales',
        observationsPlaceholder: '¿Alguna petición especial?',

        // ---------- Términos y condiciones ----------
        termsLabel: 'Acepto los términos y condiciones, así como la política de privacidad.',

        // ---------- Botón enviar ----------
        submit: 'Confirmar Check-in',
        submitting: 'Procesando...',

        // ---------- Éxito ----------
        successTitle: '¡Registro Completado!',
        successMessage: 'Gracias. Hemos procesado tu registro correctamente para el inmueble',
        successButton: 'Volver al inicio',

        // ---------- Errores de validación ----------
        errorSelectAccommodation: 'Debes seleccionar un apartamento/alojamiento.',
        errorAtLeastOneGuest: 'Debe haber al menos un huésped',
        errorPrincipalFirstName: 'El nombre del huésped principal es requerido',
        errorPrincipalLastName: 'El apellido del huésped principal es requerido',
        errorPrincipalEmail: 'El email del huésped principal es requerido',
        errorPrincipalPhone: 'El teléfono del huésped principal es requerido',
        errorPrincipalDoc: 'El documento del huésped principal es requerido',
        errorPrincipalBirth: 'La fecha de nacimiento del huésped principal es requerida',
        errorGuestEmail: (n) => `El email del huésped ${n} no es válido`,
        errorCheckIn: 'La fecha de llegada es requerida',
        errorCheckOut: 'La fecha de salida es requerida',
        errorDateOrder: 'La fecha de salida debe ser posterior a la llegada',
        errorTerms: 'Debes aceptar los términos y condiciones',

        // ---------- Estado de carga ----------
        loadingForm: 'Cargando formulario...',
        connectionError: 'Error de conexión. Por favor verifica tu internet e inténtalo de nuevo.',
    },

    en: {
        // ---------- Header ----------
        formTitle: 'Check-In',
        langToggle: 'Español',

        // ---------- Formulario general ----------
        accommodation: 'Apartment / Accommodation *',
        selectAccommodation: 'Select an accommodation',
        loadingInfo: 'Loading information...',
        notFound: 'Property not found',
        reservationId: 'Reservation ID (Optional)',
        reservationIdPlaceholder: 'Enter reservation ID',
        checkInDate: 'Check-in Date *',
        checkOutDate: 'Check-out Date *',
        numberOfGuests: 'Number of Guests *',
        guestSingular: 'Guest',
        guestPlural: 'Guests',

        // ---------- Sección huéspedes ----------
        guestInfoTitle: 'Guest Information',
        guestInfoSubtitle: 'Only the',
        guestInfoSubtitleBold: 'Primary Guest',
        guestInfoSubtitleEnd: 'is required. Other guests are optional.',
        principalGuest: 'Primary Guest',
        companionGuest: 'Additional Guest',
        required: 'Required',
        optional: 'Optional — no data',
        withData: 'With data',

        // ---------- Campos de huésped ----------
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        docType: 'Document Type',
        docNumber: 'Document Number',
        birthDate: 'Date of Birth',
        travelReason: 'Travel Purpose',
        countryResidence: 'Country of Residence',
        cityResidence: 'City of Residence',
        countryOrigin: 'Country of Origin',
        cityOrigin: 'City of Origin',
        selectCountry: 'Select a country',
        selectCity: 'Select a city',
        selectReason: 'Select a reason',
        emailPlaceholder: 'email@example.com',
        phonePlaceholder: '+1 555 123 4567',
        docNumberPlaceholder: 'Document number',

        // ---------- Tipos de documento ----------
        cedula: 'National ID',
        pasaporte: 'Passport',
        tarjeta_identidad: 'Identity Card',

        // ---------- Motivos de viaje ----------
        Negocios: 'Business',
        Vacaciones: 'Vacation',
        Visitas: 'Visits',
        Educacion: 'Education',
        Salud: 'Health',
        Religion: 'Religion',
        Compras: 'Shopping',
        Transito: 'Transit',
        Otros: 'Other',

        // ---------- Observaciones ----------
        observations: 'Additional Notes',
        observationsPlaceholder: 'Any special requests?',

        // ---------- Términos y condiciones ----------
        termsLabel: 'I accept the terms and conditions and the privacy policy.',

        // ---------- Botón enviar ----------
        submit: 'Confirm Check-in',
        submitting: 'Processing...',

        // ---------- Éxito ----------
        successTitle: 'Registration Completed!',
        successMessage: 'Thank you. Your check-in has been successfully processed for',
        successButton: 'Back to start',

        // ---------- Errores de validación ----------
        errorSelectAccommodation: 'You must select an accommodation.',
        errorAtLeastOneGuest: 'At least one guest is required',
        errorPrincipalFirstName: 'Primary guest first name is required',
        errorPrincipalLastName: 'Primary guest last name is required',
        errorPrincipalEmail: 'Primary guest email is required',
        errorPrincipalPhone: 'Primary guest phone is required',
        errorPrincipalDoc: 'Primary guest document number is required',
        errorPrincipalBirth: 'Primary guest date of birth is required',
        errorGuestEmail: (n) => `Guest ${n} email is not valid`,
        errorCheckIn: 'Check-in date is required',
        errorCheckOut: 'Check-out date is required',
        errorDateOrder: 'Check-out date must be after check-in date',
        errorTerms: 'You must accept the terms and conditions',

        // ---------- Estado de carga ----------
        loadingForm: 'Loading form...',
        connectionError: 'Connection error. Please check your internet and try again.',
    },
};
