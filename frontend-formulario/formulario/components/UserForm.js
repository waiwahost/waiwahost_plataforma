import React, { useState, useRef, useEffect } from "react";
import GuestFields from "./GuestFields";
import CompanyBillingFields from "./CompanyBillingFields";

const initialGuest = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  tipoDocumento: "",
  numeroDocumento: "",
  fechaNacimiento: ""
};

const inmuebles = [
  { value: "1", label: "Casa 1" },
  { value: "2", label: "Casa 2" },
  { value: "3", label: "Apartamento 1" }
];

const maxGuests = 6;

const billingOptions = [
  { value: "guest", label: { es: "Facturación al huésped principal", en: "Bill to main guest" } },
  { value: "company", label: { es: "Facturar a empresa", en: "Bill to company" } }
];

const languageOptions = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" }
];

export default function UserForm({ onSubmit, resetForm }) {
  // Estado para bloquear el selector de inmueble si viene en la URL
  const [inmuebleBloqueado, setInmuebleBloqueado] = useState(false);
  const initialForm = {
    inmueble: "",
    fechaLlegada: "",
    fechaSalida: "",
    cantidadHuespedes: 1,
    huespedes: [ { ...initialGuest } ],
    observaciones: "",
    billingType: "guest",
    companyBilling: {
      companyName: "",
      taxId: "",
      address: "",
      phone: "",
      email: ""
    },
    language: "es"
  };
  const [form, setForm] = useState(initialForm);

  // Al montar, leer query param 'inmueble' de la URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const inmuebleParam = params.get('inmueble');
      if (inmuebleParam && inmuebles.some(i => i.value === inmuebleParam)) {
        setForm(prev => ({ ...prev, inmueble: inmuebleParam }));
        setInmuebleBloqueado(true);
      }
    }
  }, []);
  // Limpiar formulario si resetForm cambia a true
  React.useEffect(() => {
    if (resetForm) {
      setForm(initialForm);
    }
  }, [resetForm]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBillingTypeChange = (e) => {
    setForm((prev) => ({ ...prev, billingType: e.target.value }));
  };

  const handleCompanyBillingChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      companyBilling: { ...prev.companyBilling, [name]: value }
    }));
  };

  const handleLanguageChange = (e) => {
    setForm((prev) => ({ ...prev, language: e.target.value }));
  };

  const handleGuestChange = (idx, field, value) => {
    setForm((prev) => {
      const huespedes = prev.huespedes.map((h, i) =>
        i === idx ? { ...h, [field]: value } : h
      );
      return { ...prev, huespedes };
    });
  };

  const handleCantidadHuespedes = (e) => {
    const cantidad = parseInt(e.target.value, 10);
    setForm((prev) => {
      let huespedes = [...prev.huespedes];
      if (cantidad > huespedes.length) {
        for (let i = huespedes.length; i < cantidad; i++) {
          huespedes.push({ ...initialGuest });
        }
      } else {
        huespedes = huespedes.slice(0, cantidad);
      }
      return { ...prev, cantidadHuespedes: cantidad, huespedes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError("");
    try {
      await onSubmit(form);
    } catch (err) {
      setError("Error al enviar la reserva. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  // Etiquetas por idioma
  const labels = {
    es: {
      reserva: "Check In",
      inmueble: "Inmueble:",
      selectInmueble: "Selecciona un inmueble",
      fechaLlegada: "Fecha de llegada:",
      fechaSalida: "Fecha de salida:",
      cantidadHuespedes: "Cantidad de huéspedes:",
      observaciones: "Observaciones:",
      enviar: "Enviar reserva",
      enviando: "Enviando...",
      billing: "Facturación:",
      companyName: "Nombre o razón social:",
      taxId: "NIT / identificación tributaria:",
      address: "Dirección:",
      phone: "Teléfono:",
      email: "Correo electrónico:",
      idioma: "Idioma:"
    },
    en: {
      reserva: "Book your Property",
      inmueble: "Property:",
      selectInmueble: "Select a property",
      fechaLlegada: "Check-in date:",
      fechaSalida: "Check-out date:",
      cantidadHuespedes: "Number of guests:",
      observaciones: "Observations:",
      enviar: "Submit booking",
      enviando: "Sending...",
      billing: "Billing:",
      companyName: "Company name:",
      taxId: "Tax ID:",
      address: "Address:",
      phone: "Phone:",
      email: "Email:",
      idioma: "Language:"
    }
  };

  const lang = form.language;

  // Referencias para inputs de fecha
  const fechaLlegadaRef = useRef(null);
  const fechaSalidaRef = useRef(null);

  // Componente campo de fecha reutilizable
  const DateField = ({ label, name, value, onChange, inputRef, required }) => (
    <div
      style={{ position: "relative", marginBottom: 16, cursor: "pointer" }}
      onClick={e => {
        // Evitar doble click si el usuario hace click en el input
        if (e.target.tagName !== 'INPUT') {
          if (inputRef.current && inputRef.current.showPicker) inputRef.current.showPicker();
          else if (inputRef.current) inputRef.current.focus();
        }
      }}
    >
      <label style={{ display: "block", marginBottom: 4 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          ref={inputRef}
          style={{
            width: "100%",
            padding: "8px 36px 8px 8px",
            fontSize: 16,
            borderRadius: 4,
            border: "1px solid #ccc",
            boxSizing: "border-box",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none"
          }}
        />
        <span
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            height: "100%"
          }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2" fill="#f3f3f3" stroke="#888" strokeWidth="1.5"/>
            <path d="M8 2v4M16 2v4" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="7" y="10" width="2" height="2" fill="#bbb"/>
            <rect x="11" y="10" width="2" height="2" fill="#bbb"/>
            <rect x="15" y="10" width="2" height="2" fill="#bbb"/>
          </svg>
        </span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <fieldset style={{ border: 0, padding: 0, margin: 0, background: 'none', boxShadow: 'none' }}>
          <legend style={{ fontWeight: "bold" }}>{labels[lang].idioma}</legend>
          <div className="radio-group">
            {languageOptions.map(opt => (
              <label key={opt.value} className="radio-label">
                <input
                  type="radio"
                  name="language"
                  value={opt.value}
                  checked={form.language === opt.value}
                  onChange={handleLanguageChange}
                /> {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <h2>{labels[lang].reserva}</h2>
      <label>
        {labels[lang].inmueble}
        <select
          name="inmueble"
          value={form.inmueble}
          onChange={handleChange}
          required
          disabled={inmuebleBloqueado}
          style={inmuebleBloqueado ? { background: '#f3f3f3', color: '#888', cursor: 'not-allowed' } : {}}
        >
          <option value="">{labels[lang].selectInmueble}</option>
          {inmuebles.map((i) => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
      </label>
      <DateField
        label={labels[lang].fechaLlegada}
        name="fechaLlegada"
        value={form.fechaLlegada}
        onChange={handleChange}
        inputRef={fechaLlegadaRef}
        required
      />
      <DateField
        label={labels[lang].fechaSalida}
        name="fechaSalida"
        value={form.fechaSalida}
        onChange={handleChange}
        inputRef={fechaSalidaRef}
        required
      />
      <label>
        {labels[lang].cantidadHuespedes}
        <select name="cantidadHuespedes" value={form.cantidadHuespedes} onChange={handleCantidadHuespedes} required>
          {[...Array(maxGuests)].map((_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </select>
      </label>
      <hr />
      {form.huespedes.map((huesped, idx) => (
        <GuestFields
          key={idx}
          index={idx}
          data={huesped}
          onChange={handleGuestChange}
          principal={idx === 0}
        />
      ))}
      <fieldset style={{ margin: "16px 0", border: 0, background: 'none', boxShadow: 'none', padding: 0 }}>
        <legend style={{ fontWeight: "bold" }}>{labels[lang].billing}</legend>
        <div className="radio-group">
          {billingOptions.map(opt => (
            <label key={opt.value} className="radio-label">
              <input
                type="radio"
                name="billingType"
                value={opt.value}
                checked={form.billingType === opt.value}
                onChange={handleBillingTypeChange}
              /> {opt.label[lang]}
            </label>
          ))}
        </div>
      </fieldset>
      {form.billingType === "company" && (
        <CompanyBillingFields
          values={form.companyBilling}
          onChange={handleCompanyBillingChange}
          labels={labels[lang]}
        />
      )}
      <label>
        {labels[lang].observaciones}
        <textarea name="observaciones" value={form.observaciones} onChange={handleChange} />
      </label>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit" disabled={enviando}>{enviando ? labels[lang].enviando : labels[lang].enviar}</button>
    </form>
  );
}
