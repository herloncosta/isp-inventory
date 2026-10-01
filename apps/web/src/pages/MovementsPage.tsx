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

interface Balance {
  id: string;
  locationId: string;
  quantity: number;
  product: { id: string; unit: string };
}

/** a via: a duplicata carbonada que o técnico levaria como comprovante */
interface Via {
  operacao: string;
  os: string;
  item: string;
  qtd: string;
  condicao?: string;
  destino: string;
  /** carimbado no instante da confirmação: a via não pode reescrever a própria hora */
  quando: string;
}

type Tab = 'entrada' | 'transferencia' | 'baixa' | 'devolucao' | 'historico';

const CONDITION_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponível',
  DEFECTIVE: 'Com defeito',
  MAINTENANCE: 'Manutenção',
};

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

function useMovement(path: string) {
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

/** o número que decide: quanto há daquele item naquele local, agora */
function Available({
  balances,
  productId,
  locationId,
  state,
}: {
  balances: Balance[];
  productId: string;
  locationId: string;
  state: 'carregando' | 'erro' | 'pronto';
}) {
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

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] leading-snug text-ink-45">{hint}</p>}
    </div>
  );
}

function Pick({
  label,
  hint,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  required?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="field"
      >
        <option value="">Selecione</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Qty({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="field"
      />
    </Field>
  );
}

function Blank({
  label,
  hint,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="field"
      />
    </Field>
  );
}

/** selo de estado: quadrado, com marca — nunca só cor */
function Seal({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string, 'carbon' | 'defeito'][];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map(([v, text, tone]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            data-on={value === v}
            data-tone={tone}
            onClick={() => onChange(v)}
            className="seal"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Via({ via, stamp }: { via: Via | null; stamp: number }) {
  if (!via) return null;
  return (
    // a key troca a cada confirmação para a folha se imprimir de novo
    <div className="via" role="status" key={stamp}>
      <p className="label text-carbon">Via carbonada — registrada</p>
      <dl className="mt-2 space-y-1.5 text-sm">
        <ViaRow label="Operação" value={via.operacao} />
        <ViaRow label="OS" value={via.os || '—'} />
        <ViaRow label="Item" value={via.item} />
        <ViaRow label="Quantidade" value={via.qtd} />
        {via.condicao && <ViaRow label="Condição" value={via.condicao} />}
        <ViaRow label="Destino" value={via.destino} />
        <ViaRow label="Horário" value={via.quando} />
      </dl>
      <p className="mt-2.5 border-t border-rule pt-2 text-[11px] leading-snug text-ink-70">
        Auditoria imutável: o lançamento não pode ser apagado, só corrigido por nova movimentação.
      </p>
    </div>
  );
}

function horaAgora(): string {
  return new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ViaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="label w-24 shrink-0">{label}</dt>
      <span className="leader w-4 shrink-0" />
      <dd className="num min-w-0 flex-1 break-words text-ink">{value}</dd>
    </div>
  );
}

export default function MovementsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === Role.ADMIN || user?.role === Role.ESTOQUISTA;
  const [tab, setTab] = useState<Tab>(() => (user?.role === Role.TECNICO ? 'baixa' : 'entrada'));

  const { data: products } = useList<Option>('products', '/products');
  const { data: locations } = useList<Option>('locations', '/locations');
  const { data: suppliers } = useList<Option>('suppliers', '/suppliers');

  const balanceEndpoint = user?.role === Role.TECNICO ? '/stock/my-balances' : '/stock/balances';
  const {
    data: balances,
    isLoading: loadingBalances,
    error: balancesError,
  } = useQuery({
    queryKey: ['stock-balances', balanceEndpoint],
    queryFn: () => apiFetch<Balance[]>(balanceEndpoint),
  });
  const balanceState: 'carregando' | 'erro' | 'pronto' = balancesError
    ? 'erro'
    : loadingBalances
      ? 'carregando'
      : 'pronto';

  const productName = (id: string) => products?.find((p) => p.id === id)?.name ?? '—';
  const locationName = (id: string) => locations?.find((l) => l.id === id)?.name ?? '—';

  const tabs: { key: Tab; label: string; staffOnly?: boolean }[] = [
    { key: 'entrada', label: 'Entrada', staffOnly: true },
    { key: 'transferencia', label: 'Transferência', staffOnly: true },
    { key: 'baixa', label: 'Baixa em OS' },
    { key: 'devolucao', label: 'Devolução' },
    { key: 'historico', label: 'Histórico' },
  ];
  const visible = tabs.filter((t) => !t.staffOnly || isStaff);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rule-b flex gap-0 overflow-x-auto">
        {visible.map((t) => (
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
          products={products ?? []}
          locations={locations ?? []}
          suppliers={suppliers ?? []}
          productName={productName}
          locationName={locationName}
        />
      )}
      {tab === 'transferencia' && isStaff && (
        <TransferForm
          products={products ?? []}
          locations={locations ?? []}
          balances={balances ?? []}
          balanceState={balanceState}
          productName={productName}
          locationName={locationName}
        />
      )}
      {tab === 'baixa' && (
        <IssueForm
          products={products ?? []}
          locations={locations ?? []}
          balances={balances ?? []}
          balanceState={balanceState}
          productName={productName}
          locationName={locationName}
        />
      )}
      {tab === 'devolucao' && (
        <ReturnForm
          products={products ?? []}
          locations={locations ?? []}
          balances={balances ?? []}
          balanceState={balanceState}
          productName={productName}
          locationName={locationName}
        />
      )}
      {tab === 'historico' && <HistoryList products={products ?? []} locations={locations ?? []} />}
    </div>
  );
}

function Slip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="border-b border-ink pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
        {title}
      </h2>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <div className="border-t border-rule pt-4">
      <button type="submit" disabled={pending} className="stamp w-full sm:w-auto">
        {pending ? 'Registrando...' : children}
      </button>
    </div>
  );
}

function ErrorNote({ error }: { error: Error | null }) {
  if (!error) return null;
  return (
    <p className="border-l-2 border-red-carbon pl-3 text-sm text-red-carbon">
      {error.message} Verifique os dados e tente de novo.
    </p>
  );
}

function useVia() {
  const [via, setVia] = useState<Via | null>(null);
  const [stamp, setStamp] = useState(0);
  return {
    via,
    stamp,
    print: (v: Omit<Via, 'quando'>) => {
      setVia({ ...v, quando: horaAgora() });
      setStamp((n) => n + 1);
    },
  };
}

function EntryForm({
  products,
  locations,
  suppliers,
  productName,
  locationName,
}: {
  products: Option[];
  locations: Option[];
  suppliers: Option[];
  productName: (id: string) => string;
  locationName: (id: string) => string;
}) {
  const [kind, setKind] = useState<'simples' | 'lote' | 'fracionada'>('simples');
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [packages, setPackages] = useState('1');
  const [meters, setMeters] = useState('');
  const [batch, setBatch] = useState('');
  const { via, stamp, print } = useVia();

  const simple = useMovement('/stock/entries');
  const lote = useMovement('/stock/entries/serial-batch');
  const frac = useMovement('/stock/entries/fractional');
  const active = kind === 'simples' ? simple : kind === 'lote' ? lote : frac;

  const total =
    kind === 'fracionada' ? Number(packages || 0) * Number(meters || 0) : Number(quantity || 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = { productId, locationId, ...(supplierId ? { supplierId } : {}) };
    const payload =
      kind === 'simples'
        ? { ...base, quantity: Number(quantity) }
        : kind === 'lote'
          ? { ...base, items: parseBatch(batch) }
          : { ...base, packages: Number(packages), metersPerPackage: Number(meters) };
    active.mutate(payload, {
      onSuccess: () => {
        print({
          operacao:
            kind === 'lote'
              ? 'Entrada em lote'
              : kind === 'fracionada'
                ? 'Entrada fracionada'
                : 'Entrada',
          os: '',
          item: productName(productId),
          qtd: kind === 'lote' ? `${parseBatch(batch).length} seriais` : String(total),
          destino: locationName(locationId),
        });
        setBatch('');
      },
    });
  };

  return (
    <Slip title="Entrada de material no almoxarifado">
      <form onSubmit={submit} className="space-y-5">
        <Seal
          label="Tipo de entrada"
          value={kind}
          onChange={(v) => setKind(v as typeof kind)}
          options={[
            ['simples', 'Simples', 'carbon'],
            ['lote', 'Lote de seriais', 'carbon'],
            ['fracionada', 'Fracionada (metros)', 'carbon'],
          ]}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Pick
            label="Produto"
            value={productId}
            onChange={setProductId}
            options={products}
            required
          />
          <Pick
            label="Local de destino"
            value={locationId}
            onChange={setLocationId}
            options={locations}
            required
          />
        </div>

        {kind === 'simples' && <Qty label="Quantidade" value={quantity} onChange={setQuantity} />}

        {kind === 'fracionada' && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Qty label="Pacotes (bobinas ou caixas)" value={packages} onChange={setPackages} />
              <Qty label="Metros por pacote" value={meters} onChange={setMeters} />
            </div>
            <div className="border-b border-rule pb-4">
              <p className="label">Total em metros</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="num text-5xl font-medium leading-none text-ink">{total}</span>
                <span className="text-sm text-ink-70">metros</span>
              </p>
            </div>
          </>
        )}

        {kind === 'lote' && (
          <Field
            label="Seriais do lote"
            hint="Um por linha. Formato: SERIAL ou SERIAL,MAC. Serial e MAC não podem se repetir no sistema."
          >
            <textarea
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              required
              rows={6}
              placeholder={'SN001,AA:BB:CC:DD:EE:01\nSN002'}
              className="field resize-y leading-relaxed"
            />
          </Field>
        )}

        <Pick
          label="Fornecedor"
          hint="Obrigatório quando a compra vier de um fornecedor."
          value={supplierId}
          onChange={setSupplierId}
          options={suppliers}
        />

        <ErrorNote error={active.error as Error | null} />
        <Via via={via} stamp={stamp} />
        <Submit pending={active.isPending}>Registrar entrada</Submit>
      </form>
    </Slip>
  );
}

function TransferForm({
  products,
  locations,
  balances,
  balanceState,
  productName,
  locationName,
}: {
  products: Option[];
  locations: Option[];
  balances: Balance[];
  balanceState: 'carregando' | 'erro' | 'pronto';
  productName: (id: string) => string;
  locationName: (id: string) => string;
}) {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [serials, setSerials] = useState('');
  const { via, stamp, print } = useVia();
  const m = useMovement('/stock/transfers');

  return (
    <Slip title="Transferência do almoxarifado central para o veículo">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate(
            {
              sourceLocationId: source,
              targetLocationId: target,
              productId,
              quantity: Number(quantity),
              ...(serials.trim() ? { serialNumbers: parseSerials(serials) } : {}),
            },
            {
              onSuccess: () =>
                print({
                  operacao: 'Transferência',
                  os: '',
                  item: productName(productId),
                  qtd: quantity,
                  destino: `${locationName(source)} → ${locationName(target)}`,
                }),
            },
          );
        }}
        className="space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Pick label="Origem" value={source} onChange={setSource} options={locations} required />
          <Pick
            label="Destino"
            hint="O saldo sai da origem e entra no destino na mesma transação: nunca dá saldo negativo."
            value={target}
            onChange={setTarget}
            options={locations}
            required
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Pick
            label="Produto"
            value={productId}
            onChange={setProductId}
            options={products}
            required
          />
          <Qty label="Quantidade" value={quantity} onChange={setQuantity} />
        </div>
        <Available
          balances={balances}
          productId={productId}
          locationId={source}
          state={balanceState}
        />
        <Blank
          label="Seriais (opcional)"
          hint="Separe por vírgula. Informe quando o item for equipamento rastreado."
          value={serials}
          onChange={setSerials}
          placeholder="SN001, SN002"
        />

        <ErrorNote error={m.error as Error | null} />
        <Via via={via} stamp={stamp} />
        <Submit pending={m.isPending}>Transferir</Submit>
      </form>
    </Slip>
  );
}

function IssueForm({
  products,
  locations,
  balances,
  balanceState,
  productName,
  locationName,
}: {
  products: Option[];
  locations: Option[];
  balances: Balance[];
  balanceState: 'carregando' | 'erro' | 'pronto';
  productName: (id: string) => string;
  locationName: (id: string) => string;
}) {
  const [source, setSource] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [os, setOs] = useState('');
  const [serials, setSerials] = useState('');
  const { via, stamp, print } = useVia();
  const m = useMovement('/stock/issues');

  return (
    <Slip title="Baixa de material usado em ordem de serviço">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate(
            {
              sourceLocationId: source,
              productId,
              quantity: Number(quantity),
              osNumber: os,
              ...(serials.trim() ? { serialNumbers: parseSerials(serials) } : {}),
            },
            {
              onSuccess: () =>
                print({
                  operacao: 'Baixa em OS',
                  os,
                  item: productName(productId),
                  qtd: quantity,
                  destino: locationName(source),
                }),
            },
          );
        }}
        className="space-y-5"
      >
        <Blank
          label="OS / Cliente"
          hint="O número da ordem de serviço fica preso ao item."
          value={os}
          onChange={setOs}
          placeholder="OS-4471"
          required
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Pick
            label="Produto"
            value={productId}
            onChange={setProductId}
            options={products}
            required
          />
          <Qty label="Quantidade" value={quantity} onChange={setQuantity} />
        </div>
        <Pick
          label="Sai do local"
          value={source}
          onChange={setSource}
          options={locations}
          required
        />
        <Available
          balances={balances}
          productId={productId}
          locationId={source}
          state={balanceState}
        />
        <Blank
          label="Seriais usados (opcional)"
          hint="Separe por vírgula. O serial entra em uso e guarda esta OS."
          value={serials}
          onChange={setSerials}
          placeholder="SN001, SN002"
        />

        <ErrorNote error={m.error as Error | null} />
        <Via via={via} stamp={stamp} />
        <Submit pending={m.isPending}>Dar baixa</Submit>
      </form>
    </Slip>
  );
}

function ReturnForm({
  products,
  locations,
  balances,
  balanceState,
  productName,
  locationName,
}: {
  products: Option[];
  locations: Option[];
  balances: Balance[];
  balanceState: 'carregando' | 'erro' | 'pronto';
  productName: (id: string) => string;
  locationName: (id: string) => string;
}) {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState('AVAILABLE');
  const [serials, setSerials] = useState('');
  const { via, stamp, print } = useVia();
  const m = useMovement('/stock/returns');

  return (
    <Slip title="Devolução de material ao almoxarifado central">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate(
            {
              sourceLocationId: source,
              targetLocationId: target,
              productId,
              quantity: Number(quantity),
              condition,
              ...(serials.trim() ? { serialNumbers: parseSerials(serials) } : {}),
            },
            {
              onSuccess: () =>
                print({
                  operacao: `Devolução — ${CONDITION_LABELS[condition]}`,
                  os: '',
                  item: productName(productId),
                  qtd: quantity,
                  condicao: CONDITION_LABELS[condition],
                  destino: locationName(target),
                }),
            },
          );
        }}
        className="space-y-5"
      >
        <Seal
          label="Condição do material"
          value={condition}
          onChange={setCondition}
          options={[
            ['AVAILABLE', 'Disponível', 'carbon'],
            ['DEFECTIVE', 'Com defeito', 'defeito'],
            ['MAINTENANCE', 'Manutenção', 'defeito'],
          ]}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Pick
            label="Produto"
            value={productId}
            onChange={setProductId}
            options={products}
            required
          />
          <Qty label="Quantidade" value={quantity} onChange={setQuantity} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Pick
            label="Sai do local"
            value={source}
            onChange={setSource}
            options={locations}
            required
          />
          <Pick
            label="Entra no local"
            value={target}
            onChange={setTarget}
            options={locations}
            required
          />
        </div>
        <Available
          balances={balances}
          productId={productId}
          locationId={source}
          state={balanceState}
        />
        <Blank
          label="Seriais devolvidos (opcional)"
          value={serials}
          onChange={setSerials}
          placeholder="SN001, SN002"
        />

        <ErrorNote error={m.error as Error | null} />
        <Via via={via} stamp={stamp} />
        <Submit pending={m.isPending}>Devolver</Submit>
      </form>
    </Slip>
  );
}

function HistoryList({ products, locations }: { products: Option[]; locations: Option[] }) {
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [os, setOs] = useState('');

  const params = new URLSearchParams({
    ...(type ? { type } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(productId ? { productId } : {}),
    ...(locationId ? { locationId } : {}),
    ...(os.trim() ? { osNumber: os.trim() } : {}),
  });
  const qs = params.toString();
  const { data, isLoading, error } = useQuery({
    queryKey: ['movements', type, from, to, productId, locationId, os],
    queryFn: () => apiFetch<Movement[]>(`/stock/movements${qs ? `?${qs}` : ''}`),
  });

  return (
    <section>
      <h2 className="border-b border-ink pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
        Histórico de movimentações
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Tipo">
          <select value={type} onChange={(e) => setType(e.target.value)} className="field">
            <option value="">Todos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="TRANSFERENCIA">Transferência</option>
            <option value="BAIXA_OS">Baixa em OS</option>
            <option value="DEVOLUCAO">Devolução</option>
          </select>
        </Field>
        <Pick label="Produto" value={productId} onChange={setProductId} options={products} />
        <Pick
          label="Local (origem ou destino)"
          value={locationId}
          onChange={setLocationId}
          options={locations}
        />
        <Blank label="OS / Cliente" value={os} onChange={setOs} placeholder="Filtrar por OS" />
        <Field label="De">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="field"
          />
        </Field>
        <Field label="Até">
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field" />
        </Field>
      </div>

      <div className="perf mt-6" />

      {isLoading ? (
        <p className="py-6 text-sm text-ink-70">Carregando...</p>
      ) : error ? (
        <ErrorNote error={error as Error} />
      ) : !data || data.length === 0 ? (
        <p className="py-6 text-sm text-ink-70">Nenhuma movimentação com esses filtros.</p>
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
              {data.map((mv) => (
                <tr key={mv.id}>
                  <td className="num whitespace-nowrap text-ink-70">
                    {new Date(mv.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="whitespace-nowrap">{mv.type}</td>
                  <td>{mv.product.name}</td>
                  <td className="num text-right">{mv.quantity}</td>
                  <td className="num text-ink-70">{mv.osNumber ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
