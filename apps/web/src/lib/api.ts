import { API_BASE_URL } from '@isp/shared';
import { clearSession, setSession } from './auth-store';

const baseUrl = import.meta.env.VITE_API_URL ?? API_BASE_URL;

let restorePromise: Promise<boolean> | null = null;

async function whoAmI(): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/auth/me`, { credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json();
    setSession({ user: data.user });
    return true;
  } catch {
    return false;
  }
}

/**
 * Restaura a sessão no boot. Os dois tokens vivem em cookies httpOnly: o
 * navegador os envia sozinho, então o JS nunca os vê. Só se o access cookie
 * estiver vencido é que o refresh gira (rotação single-use).
 */
export function restoreSession(): Promise<boolean> {
  restorePromise ??= (async () => {
    if (await whoAmI()) return true;
    try {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return false;
      const data = await res.json();
      setSession({ user: data.user });
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    restorePromise = null;
  });
  return restorePromise;
}

function request(path: string, options?: RequestInit) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const isAuthCall = path.startsWith('/auth/');
  let res = await request(path, options);

  if (res.status === 401 && !isAuthCall && (await restoreSession())) {
    res = await request(path, options);
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
