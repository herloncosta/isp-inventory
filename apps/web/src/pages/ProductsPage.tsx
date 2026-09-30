import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  technology: string;
  unit: string;
  minStock: number;
}

export default function ProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch<Product[]>('/products'),
  });

  if (isLoading) return <p className="text-gray-500">Carregando...</p>;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Produtos</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="px-4 py-2 font-medium">Nome</th>
            <th className="px-4 py-2 font-medium">SKU</th>
            <th className="px-4 py-2 font-medium">Categoria</th>
            <th className="px-4 py-2 font-medium">Unidade</th>
            <th className="px-4 py-2 font-medium">Estoque Mín.</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((p) => (
            <tr key={p.id} className="border-b border-gray-100">
              <td className="px-4 py-2">{p.name}</td>
              <td className="px-4 py-2 text-gray-500">{p.sku}</td>
              <td className="px-4 py-2">{p.category}</td>
              <td className="px-4 py-2">{p.unit}</td>
              <td className="px-4 py-2">{p.minStock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
