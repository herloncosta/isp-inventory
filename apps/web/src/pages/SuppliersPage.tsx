import CrudPage from '../components/CrudPage';

export default function SuppliersPage() {
  return (
    <CrudPage
      title="Fornecedores"
      queryKey="suppliers"
      endpoint="/suppliers"
      columns={[
        { key: 'razaoSocial', label: 'Razão Social' },
        { key: 'cnpj', label: 'CNPJ', num: true },
        { key: 'contato', label: 'Contato' },
      ]}
      fields={[
        { key: 'razaoSocial', label: 'Razão Social', type: 'text', required: true },
        { key: 'cnpj', label: 'CNPJ', type: 'text', required: true },
        { key: 'contato', label: 'Contato', type: 'text', required: true },
      ]}
    />
  );
}
