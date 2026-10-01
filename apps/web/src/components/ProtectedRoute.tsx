import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { restoreSession } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

/**
 * Guarda de rota autenticada. No boot chama `restoreSession`, que lê o cookie de
 * access via `GET /auth/me` — recarregar a página não gira o refresh token.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { logged } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    restoreSession().finally(() => setChecked(true));
  }, []);

  if (!checked) return <p className="p-6 text-sm text-ink-70">Verificando sessão...</p>;
  if (!logged) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
