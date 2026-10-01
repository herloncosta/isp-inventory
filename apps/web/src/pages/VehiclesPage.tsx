import CrudPage from '../components/CrudPage';

export default function VehiclesPage() {
  return (
    <CrudPage
      title="Veículos"
      queryKey="vehicles"
      endpoint="/vehicles"
      columns={[
        { key: 'plate', label: 'Placa', num: true },
        { key: 'model', label: 'Modelo' },
      ]}
      fields={[
        { key: 'plate', label: 'Placa', type: 'text', required: true },
        { key: 'model', label: 'Modelo', type: 'text', required: true },
      ]}
    />
  );
}
