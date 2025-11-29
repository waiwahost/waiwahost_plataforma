export async function getEmpresasApi(): Promise<{ success: boolean; data: { id_empresa: number; nombre: string }[] }> {
  const res = await fetch('/api/users/getEmpresas', {
    headers: { 'Content-Type': 'application/json', ...(typeof window !== 'undefined' && localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}) },
  });
  return res.json();
}
