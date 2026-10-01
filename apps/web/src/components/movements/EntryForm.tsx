import { useState } from 'react';
import { parseBatch } from '../../features/movements/parse';
import type { EntryFormProps } from '../../features/movements/types';
import { useMovement } from '../../features/movements/useMovement';
import { useVia } from '../../features/movements/useVia';
import ErrorNote from '../form/ErrorNote';
import Field from '../form/Field';
import NumberField from '../form/NumberField';
import SealField from '../form/SealField';
import SelectField from '../form/SelectField';
import StampSubmit from '../form/StampSubmit';
import Slip from './Slip';
import Via from './Via';

type EntryKind = 'simples' | 'lote' | 'fracionada';

const OPERACAO: Record<EntryKind, string> = {
  simples: 'Entrada',
  lote: 'Entrada em lote',
  fracionada: 'Entrada fracionada',
};

/** Entrada no almoxarifado: simples, em lote de seriais ou fracionada em metros. */
export default function EntryForm({
  products,
  locations,
  suppliers,
  productName,
  locationName,
}: EntryFormProps) {
  const [kind, setKind] = useState<EntryKind>('simples');
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
          operacao: OPERACAO[kind],
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
        <SealField
          label="Tipo de entrada"
          value={kind}
          onChange={(v) => setKind(v as EntryKind)}
          options={[
            ['simples', 'Simples', 'carbon'],
            ['lote', 'Lote de seriais', 'carbon'],
            ['fracionada', 'Fracionada (metros)', 'carbon'],
          ]}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Produto"
            value={productId}
            onChange={setProductId}
            options={products}
            required
          />
          <SelectField
            label="Local de destino"
            value={locationId}
            onChange={setLocationId}
            options={locations}
            required
          />
        </div>

        {kind === 'simples' && (
          <NumberField label="Quantidade" value={quantity} onChange={setQuantity} />
        )}

        {kind === 'fracionada' && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                label="Pacotes (bobinas ou caixas)"
                value={packages}
                onChange={setPackages}
              />
              <NumberField label="Metros por pacote" value={meters} onChange={setMeters} />
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

        <SelectField
          label="Fornecedor"
          hint="Obrigatório quando a compra vier de um fornecedor."
          value={supplierId}
          onChange={setSupplierId}
          options={suppliers}
        />

        <ErrorNote error={active.error as Error | null} />
        <Via via={via} stamp={stamp} />
        <StampSubmit pending={active.isPending}>Registrar entrada</StampSubmit>
      </form>
    </Slip>
  );
}
