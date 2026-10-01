import { ProductCategory, Technology, Unit } from '@isp/shared';
import CrudPage from '../components/CrudPage';

export default function ProductsPage() {
  return (
    <CrudPage
      title="Produtos"
      queryKey="products"
      endpoint="/products"
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'sku', label: 'SKU' },
        { key: 'category', label: 'Categoria' },
        { key: 'unit', label: 'Unidade' },
        { key: 'minStock', label: 'Estoque Mín.' },
      ]}
      fields={[
        { key: 'name', label: 'Nome', type: 'text', required: true },
        { key: 'sku', label: 'SKU', type: 'text', required: true },
        {
          key: 'category',
          label: 'Categoria',
          type: 'select',
          options: Object.values(ProductCategory),
          required: true,
        },
        {
          key: 'technology',
          label: 'Tecnologia',
          type: 'select',
          options: Object.values(Technology),
          required: true,
        },
        {
          key: 'unit',
          label: 'Unidade',
          type: 'select',
          options: Object.values(Unit),
          required: true,
        },
        { key: 'minStock', label: 'Estoque Mínimo', type: 'number', required: true },
      ]}
    />
  );
}
