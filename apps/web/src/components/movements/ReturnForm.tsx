import { useState } from 'react';
import { CONDITION_LABELS } from '../../features/movements/constants';
import { parseSerials } from '../../features/movements/parse';
import type { MovementFormProps } from '../../features/movements/types';
import { useMovement } from '../../features/movements/useMovement';
import { useVia } from '../../features/movements/useVia';
import ErrorNote from '../form/ErrorNote';
import NumberField from '../form/NumberField';
import SealField from '../form/SealField';
import SelectField from '../form/SelectField';
import StampSubmit from '../form/StampSubmit';
import TextField from '../form/TextField';
import Available from './Available';
import Slip from './Slip';
import Via from './Via';

/** Devolução ao almoxarifado central, com a condição do material. */
export default function ReturnForm({
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
        <SealField
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
          <SelectField
            label="Produto"
            value={productId}
            onChange={setProductId}
            options={products}
            required
          />
          <NumberField label="Quantidade" value={quantity} onChange={setQuantity} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Sai do local"
            value={source}
            onChange={setSource}
            options={locations}
            required
          />
          <SelectField
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

        <TextField
          label="Seriais devolvidos (opcional)"
          value={serials}
          onChange={setSerials}
          placeholder="SN001, SN002"
        />

        <ErrorNote error={m.error as Error | null} />
        <Via via={via} stamp={stamp} />
        <StampSubmit pending={m.isPending}>Devolver</StampSubmit>
      </form>
    </Slip>
  );
}
