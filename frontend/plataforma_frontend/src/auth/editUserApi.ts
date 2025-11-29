/* eslint-disable @typescript-eslint/no-explicit-any */
// src/auth/editUserApi.ts
export async function editUserApi(user: any): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/users/editUser', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return res.json();
}
