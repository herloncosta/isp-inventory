import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Role } from '@isp/shared';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useList } from '../hooks/useCrud';
import { MOVEMENT_TABS } from '../features/movements/constants';
import type { Balance, BalanceState, Tab } from '../features/movements/types';
import { toOptions } from '../features/options';
import EntryForm from '../components/movements/EntryForm';
import HistoryList from '../components/movements/HistoryList';
import IssueForm from '../components/movements/IssueForm';
import ReturnForm from '../components/movements/ReturnForm';
import TransferForm from '../components/movements/TransferForm';

/**
 * A tela de movimentações é só a régua de abas e a composição: cada operação
 * e o histórico vivem em `components/movements/`.
 */
export default function MovementsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === Role.ADMIN || user?.role === Role.ESTOQUISTA;
  const [tab, setTab] = useState<Tab>(() => (user?.role === Role.TECNICO ? 'baixa' : 'entrada'));

  // fornecedor não tem `name`: a regra de rótulo vive em features/options
  const { data: rawProducts } = useList<Record<string, unknown>>('products', '/products');
  const { data: rawLocations } = useList<Record<string, unknown>>('locations', '/locations');
  const { data: rawSuppliers } = useList<Record<string, unknown>>('suppliers', '/suppliers');
  const products = toOptions(rawProducts);
  const suppliers = toOptions(rawSuppliers);

  const balanceEndpoint = user?.role === Role.TECNICO ? '/stock/my-balances' : '/stock/balances';
  const {
    data: balances,
    isLoading: loadingBalances,
    error: balancesError,
  } = useQuery({
    queryKey: ['stock-balances', balanceEndpoint],
    queryFn: () => apiFetch<Balance[]>(balanceEndpoint),
  });
  const balanceState: BalanceState = balancesError
    ? 'erro'
    : loadingBalances
      ? 'carregando'
      : 'pronto';

  // TECNICO só enxerga o próprio veículo (a API recusa a Central com 403):
  // oferecer os outros locais no select "sai do local" seria um erro de fábrica.
  const locations = toOptions(rawLocations).filter(
    (l) => isStaff || (balances ?? []).some((b) => b.locationId === l.id),
  );

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? '—';
  const locationName = (id: string) => locations.find((l) => l.id === id)?.name ?? '—';
  const visibleTabs = MOVEMENT_TABS.filter((t) => !t.staffOnly || isStaff);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rule-b flex gap-0 overflow-x-auto">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-current={tab === t.key ? 'true' : undefined}
            className={`shrink-0 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] ${
              tab === t.key
                ? 'border-carbon text-carbon'
                : 'border-transparent text-ink-70 hover:border-rule-strong hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'entrada' && isStaff && (
        <EntryForm
          products={products}
          locations={locations}
          suppliers={suppliers}
          productName={productName}
          locationName={locationName}
        />
      )}
      {tab === 'transferencia' && isStaff && (
        <TransferForm
          products={products}
          locations={locations}
          balances={balances ?? []}
          balanceState={balanceState}
          productName={productName}
          locationName={locationName}
        />
      )}
      {tab === 'baixa' && (
        <IssueForm
          products={products}
          locations={locations}
          balances={balances ?? []}
          balanceState={balanceState}
          productName={productName}
          locationName={locationName}
        />
      )}
      {tab === 'devolucao' && (
        <ReturnForm
          products={products}
          locations={locations}
          balances={balances ?? []}
          balanceState={balanceState}
          productName={productName}
          locationName={locationName}
        />
      )}
      {tab === 'historico' && <HistoryList products={products} locations={locations} />}
    </div>
  );
}
