import { LocationType } from '@isp/shared';
import CrudPage from '../components/CrudPage';

export default function LocationsPage() {
  return (
    <CrudPage
      title="Locais de Estoque"
      queryKey="locations"
      endpoint="/locations"
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'type', label: 'Tipo' },
      ]}
      fields={[
        { key: 'name', label: 'Nome', type: 'text', required: true },
        {
          key: 'type',
          label: 'Tipo',
          type: 'select',
          options: Object.values(LocationType),
          required: true,
        },
        { key: 'vehicleId', label: 'ID do Veículo (opcional)', type: 'text' },
      ]}
    />
  );
}
