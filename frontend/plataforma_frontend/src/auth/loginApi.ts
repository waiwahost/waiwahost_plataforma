import { apiFetch } from './apiFetch';

export async function loginUser(email: string, password: string) {
  return apiFetch('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' },
  });
}
