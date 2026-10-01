import { useQuery } from '@tanstack/react-query';
import { UNIT_LABELS } from '@isp/shared';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

interface StockBalance {
  id: string;
  locationId: string;
  quantity: number;
  product: { id: string; name: string; sku: string; unit: string };
  location?: { id: string; name: string };
}

export default function StockPage() {
  const { user } = useAuth();
  const isTecnico = user?.role === 'TECNICO';
  const endpoint = isTecnico ? '/stock/my-balances' : '/stock/balances';
  const { data, isLoading, error } = useQuery({
    queryKey: ['stock-balances', endpoint],
    queryFn: () => apiFetch<StockBalance[]>(endpoint),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rule-b pb-3">
        <h1 className="text-lg font-bold uppercase tracking-[0.16em] text-ink">
          {isTecnico ? 'Meu carro' : 'Saldo por local'}
        </h1>
        <p className="mt-1 text-sm text-ink-70">
          {isTecnico
            ? 'Material alocado no seu veículo. É daqui que sai a baixa e a devolução.'
            : 'Saldo disponível de cada produto em cada local de estoque.'}
        </p>
      </div>

      <div className="perf mt-6" />

      {isLoading ? (
        <p className="py-6 text-sm text-ink-70">Carregando...</p>
      ) : error ? (
        <p className="border-l-2 border-red-carbon py-2 pl-3 text-sm text-red-carbon">
          {(error as Error).message} Recarregue a página para tentar de novo.
        </p>
      ) : !data || data.length === 0 ? (
        <p className="py-8 text-sm text-ink-70">
          Nenhum saldo registrado ainda. Dê entrada de material para o primeiro lançamento.
        </p>
      ) : (
        <div className="ledger-wrap">
          <table className="ledger">
            <thead>
              <tr>
                {!isTecnico && <th>Local</th>}
                <th>Produto</th>
                <th>SKU</th>
                <th className="text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((b) => (
                <tr key={b.id}>
                  {!isTecnico && <td>{b.location?.name ?? '—'}</td>}
                  <td>{b.product.name}</td>
                  <td className="num text-ink-70">{b.product.sku}</td>
                  <td className="num text-right">
                    <span className="text-base">{b.quantity}</span>{' '}
                    <span className="text-[11px] text-ink-70">
                      {UNIT_LABELS[b.product.unit] ?? b.product.unit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
