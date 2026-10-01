import { Outlet, Link, useLocation } from 'react-router-dom';
import { Role } from '@isp/shared';
import { useAuth } from '../hooks/useAuth';
import BrandMark from './BrandMark';

const STAFF = [Role.ADMIN, Role.ESTOQUISTA];

const navItems: { path: string; label: string; roles: string[] }[] = [
  { path: '/', label: 'Painel', roles: [Role.ADMIN, Role.ESTOQUISTA, Role.TECNICO] },
  { path: '/stock', label: 'Estoque', roles: [Role.ADMIN, Role.ESTOQUISTA, Role.TECNICO] },
  {
    path: '/movements',
    label: 'Movimentações',
    roles: [Role.ADMIN, Role.ESTOQUISTA, Role.TECNICO],
  },
  { path: '/products', label: 'Produtos', roles: STAFF },
  { path: '/technicians', label: 'Técnicos', roles: STAFF },
  { path: '/suppliers', label: 'Fornecedores', roles: STAFF },
  { path: '/vehicles', label: 'Veículos', roles: STAFF },
  { path: '/locations', label: 'Locais', roles: STAFF },
  { path: '/users', label: 'Usuários', roles: [Role.ADMIN] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const visible = navItems.filter((item) => user && item.roles.includes(user.role));
  const current = visible.find((item) => item.path === location.pathname);

  return (
    <div className="min-h-screen">
      <header className="band">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 pt-2.5 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <BrandMark className="h-5 w-5 text-carbon" />
            <span className="whitespace-nowrap text-lg font-bold uppercase tracking-[0.2em] text-ink">
              ISP Inventory
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-45">
              {current?.label ?? 'Painel'}
            </span>
          </Link>
          <div className="flex items-center gap-3 pb-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-70">
              {user?.name}
            </span>
            <button
              onClick={logout}
              className="text-[11px] font-bold uppercase tracking-[0.12em] text-carbon hover:underline underline-offset-4"
            >
              Sair
            </button>
          </div>
        </div>

        <nav className="-mb-px flex gap-0 overflow-x-auto px-4 md:px-6">
          {visible.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] ${
                  active
                    ? 'border-carbon text-carbon'
                    : 'border-transparent text-ink-70 hover:border-rule-strong hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="px-4 pb-16 pt-5 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}
