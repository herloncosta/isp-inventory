import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';

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
    <div className="min-h-screen px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="rule-b pb-4">
          <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-ink">ISP Inventory</h1>
          <p className="mt-1 text-sm leading-snug text-ink-70">
            Controle de estoque e rastreio de material. Entre com a conta do seu perfil.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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

        <div className="mt-8 border-t border-rule pt-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-45">
            Perfis de acesso
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-70">
            <li className="flex items-baseline gap-3">
              <span className="w-28 shrink-0 text-ink">Administrador</span>
              <span className="leader flex-1" />
              <span>cadastros e contas</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="w-28 shrink-0 text-ink">Estoquista</span>
              <span className="leader flex-1" />
              <span>entradas e transferências</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="w-28 shrink-0 text-ink">Técnico</span>
              <span className="leader flex-1" />
              <span>baixa e devolução no carro</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
