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

/** Transferência do almoxarifado central para o veículo do técnico. */
export default function TransferForm({
  products,
  locations,
  balances,
  balanceState,
  productName,
  locationName,
}: MovementFormProps) {
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
          <SelectField
            label="Origem"
            value={source}
            onChange={setSource}
            options={locations}
            required
          />
          <SelectField
            label="Destino"
            hint="O saldo sai da origem e entra no destino na mesma transação: nunca dá saldo negativo."
            value={target}
            onChange={setTarget}
            options={locations}
            required
          />
        </div>

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

        <Available
          balances={balances}
          productId={productId}
          locationId={source}
          state={balanceState}
        />

        <TextField
          label="Seriais (opcional)"
          hint="Separe por vírgula. Informe quando o item for equipamento rastreado."
          value={serials}
          onChange={setSerials}
          placeholder="SN001, SN002"
        />

        <ErrorNote error={m.error as Error | null} />
        <Via via={via} stamp={stamp} />
        <StampSubmit pending={m.isPending}>Transferir</StampSubmit>
      </form>
    </Slip>
  );
}
