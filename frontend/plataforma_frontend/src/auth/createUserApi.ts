export async function createUserApi(
  user: {
    cedula: string;
    nombre: string;
    apellido: string;
    email: string;
    password_hash: string;
    username: string;
    id_empresa?: string | null;
    id_roles: number;
    estado?: string;
  }) {
    console.log('Creating user:', user);
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
