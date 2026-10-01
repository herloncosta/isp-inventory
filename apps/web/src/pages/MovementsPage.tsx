import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Role } from '@isp/shared';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useList } from '../hooks/useCrud';

interface Option {
  id: string;
  name: string;
}
interface Movement {
  id: string;
  type: string;
  quantity: number;
  osNumber?: string | null;
  createdAt: string;
  product: { name: string };
}

type Tab = 'entrada' | 'transferencia' | 'baixa' | 'devolucao' | 'historico';

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

function parseSerials(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBatch(raw: string): { serialNumber: string; macAddress?: string }[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [serialNumber, macAddress] = line.split(',').map((s) => s.trim());
      return macAddress ? { serialNumber, macAddress } : { serialNumber };
    });
}

function useMovementMutation(path: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<unknown>(path, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

function Select({
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={inputCls}
      >
        <option value="">{placeholder ?? 'Selecione'}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Feedback({ error, ok }: { error: Error | null; ok: boolean }) {
  if (error) return <p className="text-sm text-red-600">{error.message}</p>;
  if (ok) return <p className="text-sm text-green-600">Operação registrada com sucesso.</p>;
  return null;
}

export default function MovementsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === Role.ADMIN || user?.role === Role.ESTOQUISTA;
  const [tab, setTab] = useState<Tab>('entrada');

  const { data: products } = useList<Option>('products', '/products');
  const { data: locations } = useList<Option>('locations', '/locations');
  const { data: suppliers } = useList<Option>('suppliers', '/suppliers');

  const tabs: { key: Tab; label: string; staffOnly?: boolean }[] = [
    { key: 'entrada', label: 'Entrada', staffOnly: true },
    { key: 'transferencia', label: 'Transferência', staffOnly: true },
    { key: 'baixa', label: 'Baixa em OS' },
    { key: 'devolucao', label: 'Devolução' },
    { key: 'historico', label: 'Histórico' },
  ];
  const visible = tabs.filter((t) => !t.staffOnly || isStaff);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-2 flex gap-1 flex-wrap">
        {visible.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              tab === t.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'entrada' && isStaff && (
        <EntryForm
          products={products ?? []}
          locations={locations ?? []}
          suppliers={suppliers ?? []}
        />
      )}
      {tab === 'transferencia' && isStaff && (
        <TransferForm products={products ?? []} locations={locations ?? []} />
      )}
      {tab === 'baixa' && <IssueForm products={products ?? []} locations={locations ?? []} />}
      {tab === 'devolucao' && <ReturnForm products={products ?? []} locations={locations ?? []} />}
      {tab === 'historico' && <HistoryList />}
    </div>
  );
}

function EntryForm({
  products,
  locations,
  suppliers,
}: {
  products: Option[];
  locations: Option[];
  suppliers: Option[];
}) {
  const [kind, setKind] = useState<'simples' | 'lote' | 'fracionada'>('simples');
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [packages, setPackages] = useState('1');
  const [meters, setMeters] = useState('');
  const [batch, setBatch] = useState('');

  const simple = useMovementMutation('/stock/entries');
  const lote = useMovementMutation('/stock/entries/serial-batch');
  const frac = useMovementMutation('/stock/entries/fractional');
  const active = kind === 'simples' ? simple : kind === 'lote' ? lote : frac;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = { productId, locationId, ...(supplierId ? { supplierId } : {}) };
    if (kind === 'simples') simple.mutate({ ...base, quantity: Number(quantity) });
    else if (kind === 'lote') lote.mutate({ ...base, items: parseBatch(batch) });
    else frac.mutate({ ...base, packages: Number(packages), metersPerPackage: Number(meters) });
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
    >
      <div className="md:col-span-3 flex gap-4 text-sm">
        {(['simples', 'lote', 'fracionada'] as const).map((k) => (
          <label key={k} className="flex items-center gap-1 capitalize">
            <input type="radio" checked={kind === k} onChange={() => setKind(k)} />
            {k === 'simples' ? 'Simples' : k === 'lote' ? 'Lote de seriais' : 'Fracionada (m)'}
          </label>
        ))}
      </div>
      <Select
        label="Produto"
        value={productId}
        onChange={setProductId}
        options={products}
        required
      />
      <Select
        label="Local destino"
        value={locationId}
        onChange={setLocationId}
        options={locations}
        required
      />
      <Select
        label="Fornecedor (opcional)"
        value={supplierId}
        onChange={setSupplierId}
        options={suppliers}
      />
      {kind === 'simples' && (
        <div>
          <label className={labelCls}>Quantidade</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className={inputCls}
          />
        </div>
      )}
      {kind === 'fracionada' && (
        <>
          <div>
            <label className={labelCls}>Pacotes (bobinas/caixas)</label>
            <input
              type="number"
              min={1}
              value={packages}
              onChange={(e) => setPackages(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Metros por pacote</label>
            <input
              type="number"
              min={1}
              value={meters}
              onChange={(e) => setMeters(e.target.value)}
              required
              className={inputCls}
            />
          </div>
        </>
      )}
      {kind === 'lote' && (
        <div className="md:col-span-3">
          <label className={labelCls}>Seriais (um por linha, formato: SERIAL ou SERIAL,MAC)</label>
          <textarea
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            required
            rows={5}
            placeholder={'SN001,AA:BB:CC:DD:EE:01\nSN002'}
            className={inputCls}
          />
        </div>
      )}
      <div className="md:col-span-3 space-y-2">
        <Feedback error={active.error as Error | null} ok={active.isSuccess} />
        <button
          type="submit"
          disabled={active.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {active.isPending ? 'Registrando...' : 'Registrar entrada'}
        </button>
      </div>
    </form>
  );
}

function TransferForm({ products, locations }: { products: Option[]; locations: Option[] }) {
  const [sourceLocationId, setSource] = useState('');
  const [targetLocationId, setTarget] = useState('');
  const [productId, setProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [serials, setSerials] = useState('');
  const m = useMovementMutation('/stock/transfers');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate({
          sourceLocationId,
          targetLocationId,
          productId,
          quantity: Number(quantity),
          ...(serials.trim() ? { serialNumbers: parseSerials(serials) } : {}),
        });
      }}
      className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
    >
      <Select
        label="Origem (Central)"
        value={sourceLocationId}
        onChange={setSource}
        options={locations}
        required
      />
      <Select
        label="Destino (veículo)"
        value={targetLocationId}
        onChange={setTarget}
        options={locations}
        required
      />
      <Select label="Produto" value={productId} onChange={setProduct} options={products} required />
      <div>
        <label className={labelCls}>Quantidade</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className={inputCls}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Seriais (opcional, separados por vírgula)</label>
        <input value={serials} onChange={(e) => setSerials(e.target.value)} className={inputCls} />
      </div>
      <div className="md:col-span-3 space-y-2">
        <Feedback error={m.error as Error | null} ok={m.isSuccess} />
        <button
          type="submit"
          disabled={m.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {m.isPending ? 'Transferindo...' : 'Transferir'}
        </button>
      </div>
    </form>
  );
}

function IssueForm({ products, locations }: { products: Option[]; locations: Option[] }) {
  const [sourceLocationId, setSource] = useState('');
  const [productId, setProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [osNumber, setOs] = useState('');
  const [serials, setSerials] = useState('');
  const m = useMovementMutation('/stock/issues');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate({
          sourceLocationId,
          productId,
          quantity: Number(quantity),
          osNumber,
          ...(serials.trim() ? { serialNumbers: parseSerials(serials) } : {}),
        });
      }}
      className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
    >
      <Select
        label="Origem"
        value={sourceLocationId}
        onChange={setSource}
        options={locations}
        required
      />
      <Select label="Produto" value={productId} onChange={setProduct} options={products} required />
      <div>
        <label className={labelCls}>Quantidade</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>OS / Cliente</label>
        <input
          value={osNumber}
          onChange={(e) => setOs(e.target.value)}
          required
          className={inputCls}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Seriais (opcional, separados por vírgula)</label>
        <input value={serials} onChange={(e) => setSerials(e.target.value)} className={inputCls} />
      </div>
      <div className="md:col-span-3 space-y-2">
        <Feedback error={m.error as Error | null} ok={m.isSuccess} />
        <button
          type="submit"
          disabled={m.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {m.isPending ? 'Baixando...' : 'Dar baixa'}
        </button>
      </div>
    </form>
  );
}

function ReturnForm({ products, locations }: { products: Option[]; locations: Option[] }) {
  const [sourceLocationId, setSource] = useState('');
  const [targetLocationId, setTarget] = useState('');
  const [productId, setProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState('AVAILABLE');
  const [serials, setSerials] = useState('');
  const m = useMovementMutation('/stock/returns');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate({
          sourceLocationId,
          targetLocationId,
          productId,
          quantity: Number(quantity),
          condition,
          ...(serials.trim() ? { serialNumbers: parseSerials(serials) } : {}),
        });
      }}
      className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
    >
      <Select
        label="Origem (veículo)"
        value={sourceLocationId}
        onChange={setSource}
        options={locations}
        required
      />
      <Select
        label="Destino (central)"
        value={targetLocationId}
        onChange={setTarget}
        options={locations}
        required
      />
      <Select label="Produto" value={productId} onChange={setProduct} options={products} required />
      <div>
        <label className={labelCls}>Quantidade</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Condição</label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className={inputCls}
        >
          <option value="AVAILABLE">Disponível</option>
          <option value="DEFECTIVE">Com defeito</option>
          <option value="MAINTENANCE">Manutenção</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Seriais (opcional)</label>
        <input value={serials} onChange={(e) => setSerials(e.target.value)} className={inputCls} />
      </div>
      <div className="md:col-span-3 space-y-2">
        <Feedback error={m.error as Error | null} ok={m.isSuccess} />
        <button
          type="submit"
          disabled={m.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {m.isPending ? 'Devolvendo...' : 'Devolver'}
        </button>
      </div>
    </form>
  );
}

function HistoryList() {
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const params = new URLSearchParams({
    ...(type ? { type } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  });
  const qs = params.toString();
  const { data, isLoading } = useQuery({
    queryKey: ['movements', type, from, to],
    queryFn: () => apiFetch<Movement[]>(`/stock/movements${qs ? `?${qs}` : ''}`),
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className={labelCls}>Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            <option value="">Todos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="TRANSFERENCIA">Transferência</option>
            <option value="BAIXA_OS">Baixa em OS</option>
            <option value="DEVOLUCAO">Devolução</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>De</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Até</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
      {isLoading ? (
        <p className="p-4 text-sm text-gray-500">Carregando...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-2 font-medium">Data</th>
              <th className="px-4 py-2 font-medium">Tipo</th>
              <th className="px-4 py-2 font-medium">Produto</th>
              <th className="px-4 py-2 font-medium">Qtd</th>
              <th className="px-4 py-2 font-medium">OS</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((mv) => (
              <tr key={mv.id} className="border-b border-gray-100">
                <td className="px-4 py-2">{new Date(mv.createdAt).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-2">{mv.type}</td>
                <td className="px-4 py-2">{mv.product.name}</td>
                <td className="px-4 py-2">{mv.quantity}</td>
                <td className="px-4 py-2">{mv.osNumber ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
