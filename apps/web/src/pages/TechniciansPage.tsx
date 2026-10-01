import CrudPage from '../components/CrudPage';

export default function TechniciansPage() {
  return (
    <CrudPage
      title="Técnicos"
      queryKey="technicians"
      endpoint="/technicians"
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'userId', label: 'ID Usuário' },
        { key: 'vehicle.plate', label: 'Veículo' },
      ]}
      fields={[
        { key: 'name', label: 'Nome', type: 'text', required: true },
        { key: 'userId', label: 'ID do Usuário', type: 'text', required: true },
        { key: 'vehicleId', label: 'ID do Veículo (opcional)', type: 'text' },
      ]}
    />
  );
}
