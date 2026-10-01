import { API_BASE_URL } from '@isp/shared';
import { clearSession, getSession, setSession } from './auth-store';

const baseUrl = import.meta.env.VITE_API_URL ?? API_BASE_URL;

let refreshPromise: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  refreshPromise ??= (async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return false;
      const data = await res.json();
      setSession({ accessToken: data.accessToken, user: data.user });
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

function request(path: string, token: string | undefined, options?: RequestInit) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const isAuthCall = path.startsWith('/auth/');
  let res = await request(path, getSession()?.accessToken, options);

  if (res.status === 401 && !isAuthCall && (await tryRefresh())) {
    res = await request(path, getSession()?.accessToken, options);
  }

  if (!res.ok) {
    if (res.status === 401 && !isAuthCall) {
      clearSession();
      window.location.href = '/login';
    }
    const error = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}
