import { apiFetch } from './apiFetch';

export async function resetPassword(email: string, password: string) {
  return apiFetch('/api/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' },
  });
}
