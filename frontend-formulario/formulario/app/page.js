
"use client";

import UserForm from "../components/UserForm";
import Modal from "../components/Modal";
import { useState } from "react";

export default function Home() {
  const [modal, setModal] = useState({ open: false, isError: false, message: "", title: "" });
  const [resetForm, setResetForm] = useState(false);

  const handleSubmit = async (formData) => {
    setModal({ open: false, isError: false, message: "", title: "" });
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Error en el registro");
      }
      setModal({ open: true, isError: false, title: "Reserva exitosa", message: "¡Tu reserva fue enviada correctamente!" });
      setResetForm(true);
    } catch (err) {
      setModal({ open: true, isError: true, title: "Error", message: err.message || "Error al enviar la reserva." });
    }
  };

  const handleCloseModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
    if (!modal.isError) {
      setResetForm(false); // ya se limpió el form
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <UserForm onSubmit={handleSubmit} resetForm={resetForm} />
      <Modal open={modal.open} isError={modal.isError} title={modal.title} message={modal.message} onClose={handleCloseModal} />
    </div>
  );
}
