import { useState } from 'react';
import { parseSerials } from '../../features/movements/parse';
import type { MovementFormProps } from '../../features/movements/types';
import { useMovement } from '../../features/movements/useMovement';
import { useVia } from '../../features/movements/useVia';
import ErrorNote from '../form/ErrorNote';
import NumberField from '../form/NumberField';
import SelectField from '../form/SelectField';
import StampSubmit from '../form/StampSubmit';
import TextField from '../form/TextField';
import Available from './Available';
import Slip from './Slip';
import Via from './Via';

/** Baixa de material consumido em uma ordem de serviço. */
export default function IssueForm({
  products,
  locations,
  balances,
  balanceState,
  productName,
  locationName,
}: MovementFormProps) {
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
        <TextField
          label="OS / Cliente"
          hint="O número da ordem de serviço fica preso ao item."
          value={os}
          onChange={setOs}
          placeholder="OS-4471"
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Produto"
            value={productId}
            onChange={setProductId}
            options={products}
            required
          />
          <NumberField label="Quantidade" value={quantity} onChange={setQuantity} />
        </div>

        <SelectField
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

        <TextField
          label="Seriais usados (opcional)"
          hint="Separe por vírgula. O serial entra em uso e guarda esta OS."
          value={serials}
          onChange={setSerials}
          placeholder="SN001, SN002"
        />

        <ErrorNote error={m.error as Error | null} />
        <Via via={via} stamp={stamp} />
        <StampSubmit pending={m.isPending}>Dar baixa</StampSubmit>
      </form>
    </Slip>
  );
}
