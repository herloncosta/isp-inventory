import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LocationType } from '@isp/shared';
import { apiFetch } from '../../lib/api';
import { useList } from '../../hooks/useCrud';
import RemoteSelect from '../RemoteSelect';
import SelectField from '../form/SelectField';
import StampSubmit from '../form/StampSubmit';
import TextField from '../form/TextField';
import ErrorNote from '../form/ErrorNote';
import Modal from '../Modal';

export interface LocationRow {
  id: string;
  name: string;
  type: string;
  vehicleId: string | null;
}

interface LocationFormModalProps {
  /** ausente = criação */
  location?: LocationRow;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  CENTRAL: 'Almoxarifado central',
  VEHICLE: 'Veículo',
};

const EMPTY = { name: '', type: LocationType.CENTRAL as string, vehicleId: '' };

/** Criar e editar local de estoque. Veículo é opcional em central e típico em veículo. */
export default function LocationFormModal({ location, onClose }: LocationFormModalProps) {
  const editing = Boolean(location);
  const [form, setForm] = useState(
    location
      ? { name: location.name, type: location.type, vehicleId: location.vehicleId ?? '' }
      : EMPTY,
  );
  const queryClient = useQueryClient();
  const { data: vehicles } = useList<Record<string, unknown>>('vehicles', '/vehicles');

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editing
        ? apiFetch<unknown>(`/locations/${location!.id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          })
        : apiFetch<unknown>('/locations', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      {
        name: form.name,
        type: form.type,
        ...(form.vehicleId ? { vehicleId: form.vehicleId } : {}),
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open
      title={editing ? `Editar ${location!.name}` : 'Novo local de estoque'}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-5">
        <TextField
          label="Nome"
          hint={form.type === LocationType.VEHICLE ? 'Ex.: Carro 01' : 'Ex.: Almoxarifado Central'}
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          required
        />

        <SelectField
          label="Tipo"
          value={form.type}
          onChange={(v) => setForm({ ...form, type: v })}
          options={Object.values(LocationType).map((t) => ({ id: t, name: TYPE_LABELS[t] ?? t }))}
          required
        />

        <div>
          <p className="label">Veículo vinculado (opcional)</p>
          <div className="mt-1.5">
            <RemoteSelect
              source={{ queryKey: 'vehicles', endpoint: '/vehicles' }}
              value={form.vehicleId}
              onChange={(v) => setForm({ ...form, vehicleId: v })}
            />
          </div>
          <p className="mt-1 text-[11px] leading-snug text-ink-45">
            Um local do tipo Veículo aponta para o carro que responde por ele. Cada veículo tem no
            máximo um local.
          </p>
        </div>

        <ErrorNote error={mutation.error as Error | null} recovery="" />
        <StampSubmit pending={mutation.isPending}>
          {editing ? 'Salvar alterações' : 'Criar local'}
        </StampSubmit>
      </form>
    </Modal>
  );
}
