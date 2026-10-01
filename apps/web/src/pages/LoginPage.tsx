import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import BrandMark from '../components/BrandMark';
import LoginCover from '../components/LoginCover';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password }, { onSuccess: () => navigate('/') });
  };

  return (
    <div className="min-h-screen md:grid md:min-h-screen md:grid-cols-[3fr_2fr]">
      <LoginCover />

      <main className="flex min-h-screen items-center justify-center px-6 py-12 md:px-10">
        <div className="w-full max-w-sm">
          {/* no celular a capa some: a marca vem junto do formulário */}
          <div className="rule-b mb-7 flex items-center gap-2.5 pb-4 md:hidden">
            <BrandMark className="h-6 w-6 text-carbon" />
            <h1 className="text-lg font-bold uppercase tracking-[0.2em] text-ink">ISP Inventory</h1>
          </div>

          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-70">
            Entrar na conta
          </h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label htmlFor="email" className="label">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                className="field"
                placeholder="tecnico@isp.com"
              />
            </div>

            <div>
              <label htmlFor="senha" className="label">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="field"
              />
            </div>

            {login.isError && (
              <p className="border-l-2 border-red-carbon pl-3 text-sm text-red-carbon">
                {login.error?.message}
              </p>
            )}

            <button type="submit" disabled={login.isPending} className="stamp w-full">
              {login.isPending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
