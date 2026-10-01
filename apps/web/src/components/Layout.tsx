import { Outlet, Link, useLocation } from 'react-router-dom';
import { Role } from '@isp/shared';
import { useAuth } from '../hooks/useAuth';

const STAFF = [Role.ADMIN, Role.ESTOQUISTA];

const navItems: { path: string; label: string; roles: string[] }[] = [
  { path: '/', label: 'Dashboard', roles: [Role.ADMIN, Role.ESTOQUISTA, Role.TECNICO] },
  { path: '/stock', label: 'Estoque', roles: [Role.ADMIN, Role.ESTOQUISTA, Role.TECNICO] },
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold text-gray-900">ISP Inventory</h1>
          <div className="flex gap-1">
            {visible.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">
            Sair
          </button>
        </div>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
