export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Session {
  accessToken: string;
  user: AuthUser;
}

let session: Session | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function getSession(): Session | null {
  return session;
}

export function setSession(next: Session): void {
  session = next;
  emit();
}

export function clearSession(): void {
  session = null;
  emit();
}

export function subscribeSession(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
