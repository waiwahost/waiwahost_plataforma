import React from "react";

const tiposDocumento = [
  { value: "dni", label: "DNI" },
  { value: "pasaporte", label: "Pasaporte" },
  { value: "cedula", label: "Cédula" }
];

export default function GuestFields({ index, data, onChange, principal }) {
  const handleField = (e) => {
    onChange(index, e.target.name, e.target.value);
  };
  return (
    <fieldset style={{ marginBottom: 16, border: "1px solid #ccc", padding: 12 }}>
      <legend>{principal ? "Huésped principal" : `Acompañante #${index+1}`}</legend>
      <label>
        Nombre:
        <input name="nombre" value={data.nombre} onChange={handleField} required />
      </label>
      <label>
        Apellido:
        <input name="apellido" value={data.apellido} onChange={handleField} required />
      </label>
      <label>
        Email:
        <input name="email" type="email" value={data.email} onChange={handleField} required />
      </label>
      <label>
        Teléfono:
        <input name="telefono" value={data.telefono} onChange={handleField} required />
      </label>
      <label>
        Tipo documento:
        <select name="tipoDocumento" value={data.tipoDocumento} onChange={handleField} required>
          <option value="">Selecciona</option>
          {tiposDocumento.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>
      <label>
        Número documento:
        <input name="numeroDocumento" value={data.numeroDocumento} onChange={handleField} required />
      </label>
      <label>
        Fecha de nacimiento:
        <input name="fechaNacimiento" type="date" value={data.fechaNacimiento} onChange={handleField} required />
      </label>
    </fieldset>
  );
}
