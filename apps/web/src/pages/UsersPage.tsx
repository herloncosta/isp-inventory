import { Role, ROLE_LABELS } from '@isp/shared';
import CrudPage from '../components/CrudPage';

export default function UsersPage() {
  return (
    <CrudPage
      title="Usuários"
      queryKey="users"
      endpoint="/users"
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'email', label: 'E-mail', num: true },
        { key: 'role', label: 'Perfil', values: ROLE_LABELS },
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
          values: ROLE_LABELS,
          required: true,
        },
      ]}
    />
  );
}
