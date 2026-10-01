import { CATEGORY_LABELS, ProductCategory, Technology, UNIT_LABELS, Unit } from '@isp/shared';
import CrudPage from '../components/CrudPage';

const TECHNOLOGY_LABELS: Record<string, string> = {
  FIBRA: 'Fibra',
  UTP: 'UTP',
  RADIO: 'Rádio',
};

export default function ProductsPage() {
  return (
    <CrudPage
      title="Produtos"
      queryKey="products"
      endpoint="/products"
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'sku', label: 'SKU', num: true },
        { key: 'category', label: 'Categoria', values: CATEGORY_LABELS },
        { key: 'technology', label: 'Tecnologia', values: TECHNOLOGY_LABELS },
        { key: 'unit', label: 'Unidade', values: UNIT_LABELS },
        { key: 'minStock', label: 'Estoque mín.', num: true },
      ]}
      fields={[
        { key: 'name', label: 'Nome', type: 'text', required: true },
        { key: 'sku', label: 'SKU', type: 'text', required: true },
        {
          key: 'category',
          label: 'Categoria',
          type: 'select',
          options: Object.values(ProductCategory),
          values: CATEGORY_LABELS,
          required: true,
        },
        {
          key: 'technology',
          label: 'Tecnologia',
          type: 'select',
          options: Object.values(Technology),
          values: TECHNOLOGY_LABELS,
          required: true,
        },
        {
          key: 'unit',
          label: 'Unidade',
          type: 'select',
          options: Object.values(Unit),
          values: UNIT_LABELS,
          required: true,
        },
        { key: 'minStock', label: 'Estoque mínimo', type: 'number', required: true },
      ]}
    />
  );
}
