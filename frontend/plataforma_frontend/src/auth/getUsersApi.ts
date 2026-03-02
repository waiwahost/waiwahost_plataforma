export async function getUsersApi() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch('/api/users/getUsers', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Error al obtener usuarios');
  const data = await res.json();
  if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
    return data.data;
  }
  return Array.isArray(data) ? data : [];
}
