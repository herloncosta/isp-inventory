import { LocationType } from '@isp/shared';
import CrudPage from '../components/CrudPage';

const LOCATION_TYPE_LABELS: Record<string, string> = {
  CENTRAL: 'Almoxarifado central',
  VEHICLE: 'Veículo',
};

export default function LocationsPage() {
  return (
    <CrudPage
      title="Locais de estoque"
      queryKey="locations"
      endpoint="/locations"
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'type', label: 'Tipo', values: LOCATION_TYPE_LABELS },
      ]}
      fields={[
        { key: 'name', label: 'Nome', type: 'text', required: true },
        {
          key: 'type',
          label: 'Tipo',
          type: 'select',
          options: Object.values(LocationType),
          values: LOCATION_TYPE_LABELS,
          required: true,
        },
        {
          key: 'vehicleId',
          label: 'Veículo vinculado (opcional)',
          hint: 'Um local do tipo Veículo aponta para o carro que responde por ele.',
          type: 'select',
          optionsFrom: { queryKey: 'vehicles', endpoint: '/vehicles' },
        },
      ]}
    />
  );
}
