import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

interface StockBalance {
  id: string;
  quantity: number;
  product: { id: string; name: string; unit: string };
}

export default function StockPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stock-balances'],
    queryFn: () => apiFetch<StockBalance[]>('/stock/balances'),
  });

  if (isLoading) return <p className="text-gray-500">Carregando...</p>;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Saldo por Local</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="px-4 py-2 font-medium">Produto</th>
            <th className="px-4 py-2 font-medium">Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((b) => (
            <tr key={b.id} className="border-b border-gray-100">
              <td className="px-4 py-2">{b.product.name}</td>
              <td className="px-4 py-2">{b.quantity} {b.product.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
