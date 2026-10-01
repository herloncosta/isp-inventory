import { clearSession, setSession } from './auth-store';

/**
 * A API é chamada na MESMA ORIGEM do front, via o proxy `/api` do Vite
 * (apps/web/vite.config.ts). Isso importa: com o cookie de sessão, uma
 * chamada de outra origem depende da política de cookie do navegador — e
 * aí a sessão simplesmente não volta. Same-origin não tem CORS e o cookie
 * é de primeira parte.
 *
 * Em produção, aponte VITE_API_URL para a raiz da API (ex.: https://api.exemplo.com).
 */
const baseUrl = import.meta.env.VITE_API_URL ?? '/api';

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
      console.error(`[auth] 401 em ${path} — limpando a sessão`);
      clearSession();
      window.location.href = '/login';
    }
    const error = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}
