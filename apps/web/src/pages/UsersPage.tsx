import { Role } from '@isp/shared';
import CrudPage from '../components/CrudPage';

export default function UsersPage() {
  return (
    <CrudPage
      title="Usuários"
      queryKey="users"
      endpoint="/users"
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'email', label: 'E-mail' },
        { key: 'role', label: 'Perfil' },
      ]}
      fields={[
        { key: 'name', label: 'Nome', type: 'text', required: true },
        { key: 'email', label: 'E-mail', type: 'text', required: true },
        { key: 'password', label: 'Senha', type: 'text', required: true },
        {
          key: 'role',
          label: 'Perfil',
          type: 'select',
          options: Object.values(Role),
          required: true,
        },
      ]}
    />
  );
}
