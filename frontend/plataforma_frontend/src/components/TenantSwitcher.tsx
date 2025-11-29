'use client';

export default function TenantSwitcher() {
  // Aquí podrías obtener el tenant de un contexto global, cookie, subdominio, etc.
  // Para demo, solo muestra un selector simple
  return (
    <div className="mb-4">
      <label className="mr-2">Empresa:</label>
      <select className="border rounded p-1">
        <option>Empresa 1</option>
        <option>Empresa 2</option>
      </select>
    </div>
  );
}
