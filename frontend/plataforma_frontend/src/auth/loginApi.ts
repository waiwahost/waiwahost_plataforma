import { apiFetch } from './apiFetch';

export async function loginUser(identifier: string, password: string) {
  return apiFetch('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
    headers: { 'Content-Type': 'application/json' },
  });
}
