import type { Balance, BalanceState } from '../../features/movements/types';

interface AvailableProps {
  balances: Balance[];
  productId: string;
  locationId: string;
  state: BalanceState;
}

/**
 * O número que decide: quanto há daquele item naquele local, agora. Sem saldo
 * carregado ele diz que não consultou — afirmar "zerado" sobre um erro seria mentira.
 */
export default function Available({ balances, productId, locationId, state }: AvailableProps) {
  if (!productId || !locationId) return null;

  if (state === 'carregando') {
    return (
      <div className="border-b border-rule pb-4">
        <p className="label">Disponível no local</p>
        <p className="num mt-1 text-2xl text-ink-45">consultando...</p>
      </div>
    );
  }

  if (state === 'erro') {
    return (
      <div className="border-b border-rule pb-4">
        <p className="label">Disponível no local</p>
        <p className="mt-1 border-l-2 border-red-carbon pl-3 text-sm text-red-carbon">
          Saldo não consultado. Recarregue a página antes de lançar.
        </p>
      </div>
    );
  }

  const found = balances.find((b) => b.product.id === productId && b.locationId === locationId);
  const qty = found?.quantity ?? 0;
  const unit = found?.product.unit ?? '';

  return (
    <div className="border-b border-rule pb-4">
      <p className="label">Disponível no local</p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="num text-5xl font-medium leading-none text-ink">{qty}</span>
        <span className="text-sm text-ink-70">{unit}</span>
      </p>
      {qty === 0 && (
        <p className="mt-2 text-sm text-red-carbon">
          Saldo zerado neste local: a operação vai ser recusada.
        </p>
      )}
    </div>
  );
}
