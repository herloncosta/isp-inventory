import CrudPage from '../components/CrudPage';

export default function TechniciansPage() {
  return (
    <CrudPage
      title="Técnicos"
      queryKey="technicians"
      endpoint="/technicians"
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'vehicle.plate', label: 'Veículo', num: true },
      ]}
      fields={[
        { key: 'name', label: 'Nome', type: 'text', required: true },
        {
          key: 'userId',
          label: 'Conta de usuário',
          type: 'select',
          optionsFrom: { queryKey: 'users', endpoint: '/users' },
          required: true,
        },
        {
          key: 'vehicleId',
          label: 'Veículo (almoxarifado móvel)',
          hint: 'Sem veículo, o técnico não consegue ver saldo nem registrar movimentação.',
          type: 'select',
          optionsFrom: { queryKey: 'vehicles', endpoint: '/vehicles' },
        },
      ]}
    />
  );
}
