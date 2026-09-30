import { useDashboard } from '../hooks/useDashboard';

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <p className="text-gray-500">Carregando...</p>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Produtos" value={data.totalProducts} />
        <StatCard label="Locais" value={data.totalLocations} />
        <StatCard label="Movimentações" value={data.totalMovements} />
        <StatCard label="Estoque Baixo" value={data.lowStockCount} alert={data.lowStockCount > 0} />
      </div>

      {data.lowStock.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Alertas de Estoque Mínimo</h2>
          <div className="space-y-2">
            {data.lowStock.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.product.name}</span>
                <span className="text-red-600 font-medium">
                  {item.quantity} / {item.product.minStock} {item.product.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Movimentações Recentes</h2>
        <div className="space-y-2">
          {data.recentMovements.map((m) => (
            <div key={m.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{m.product.name}</span>
              <span className="text-gray-500">
                {m.type} — {m.quantity} un{m.osNumber ? ` (OS: ${m.osNumber})` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
