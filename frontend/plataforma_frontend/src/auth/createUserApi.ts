export async function createUserApi(
  user: {
    cedula: string;
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    username: string;
    id_empresa?: string | number | null;
    id_roles: number;
    estado?: string;
  }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch('/api/users/createUser', {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Error al crear usuario');
  return res.json();
}
