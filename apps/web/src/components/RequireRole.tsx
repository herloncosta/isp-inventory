import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RequireRoleProps {
  allow: string[];
  children: React.ReactNode;
}

export default function RequireRole({ allow, children }: RequireRoleProps) {
  const { logged, user } = useAuth();
  if (!logged) return <Navigate to="/login" replace />;
  if (!user || !allow.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
