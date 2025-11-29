// src/auth/deleteUserApi.ts
export async function deleteUserApi(id: string): Promise<{ success: boolean; message: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch('/api/users/deleteUser', {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });
  return res.json();
}
