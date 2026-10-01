import { Link } from 'react-router-dom';
import { MOVEMENT_LABELS } from '@isp/shared';
import { useDashboard } from '../hooks/useDashboard';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <p className="text-sm text-ink-70">Carregando o painel...</p>;
  if (error)
    return (
      <p className="border-l-2 border-red-carbon pl-3 text-sm text-red-carbon">
        {(error as Error).message} Recarregue a página para tentar de novo.
      </p>
    );
  if (!data) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section>
        <div className="rule-b pb-3">
          <h1 className="text-lg font-bold uppercase tracking-[0.16em] text-ink">Painel</h1>
          <p className="mt-1 text-sm text-ink-70">
            Saldo dos locais, alertas de estoque mínimo e as últimas movimentações registradas.
          </p>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-6 sm:grid-cols-4">
          <Stat label="Produtos" value={data.totalProducts} />
          <Stat label="Locais" value={data.totalLocations} />
          <Stat label="Movimentações" value={data.totalMovements} />
          <Stat label="Em alerta" value={data.lowStockCount} alert={data.lowStockCount > 0} />
        </dl>
      </section>

      {data.lowStock.length > 0 && (
        <section className="alert-band">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-red-carbon">
              Estoque no mínimo
            </h2>
            <span className="num text-[11px] text-ink-70">
              {data.lowStock.length} {data.lowStock.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <ul className="mt-3 space-y-2.5">
            {data.lowStock.map((item) => (
              <li key={item.id} className="flex items-baseline gap-3 text-sm">
                <span className="flex-1 text-ink">{item.product.name}</span>
                <span className="leader w-8 shrink-0" />
                <span className="num shrink-0 text-red-carbon">
                  {item.quantity}/{item.product.minStock} {item.product.unit}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="flex items-baseline justify-between border-b border-ink pb-2">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
            Movimentações recentes
          </h2>
          <Link
            to="/movements"
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-carbon hover:underline underline-offset-4"
          >
            Ver histórico
          </Link>
        </div>

        {data.recentMovements.length === 0 ? (
          <p className="py-6 text-sm text-ink-70">
            Nenhuma movimentação registrada ainda. A primeira via sai do almoxarifado.
          </p>
        ) : (
          <div className="ledger-wrap">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Quando</th>
                  <th>Tipo</th>
                  <th>Produto</th>
                  <th className="text-right">Qtd</th>
                  <th>OS</th>
                </tr>
              </thead>
              <tbody>
                {data.recentMovements.map((m) => (
                  <tr key={m.id}>
                    <td className="num whitespace-nowrap text-ink-70">
                      {new Date(m.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="whitespace-nowrap">{MOVEMENT_LABELS[m.type] ?? m.type}</td>
                    <td>{m.product.name}</td>
                    <td className="num text-right">{m.quantity}</td>
                    <td className="num text-ink-70">{m.osNumber ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="rule-b pb-2">
      <dt className="label">{label}</dt>
      <dd className={`num mt-0.5 text-3xl font-medium ${alert ? 'text-red-carbon' : 'text-ink'}`}>
        {value}
      </dd>
    </div>
  );
}
