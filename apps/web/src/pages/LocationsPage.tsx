import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import ConfirmAction from '../components/ConfirmAction';
import LocationFormModal, { type LocationRow } from '../components/locations/LocationFormModal';

const TYPE_LABELS: Record<string, string> = {
  CENTRAL: 'Almoxarifado central',
  VEHICLE: 'Veículo',
};

/**
 * Gestão de locais de estoque: criar, editar e excluir.
 *
 * **Excluir só é permitido com o local vazio** — sem saldo, sem equipamento
 * rastreado e sem histórico de movimentação. A regra vive na API; esta tela
 * apenas pede a confirmação e mostra o que estiver impedindo.
 */
export default function LocationsPage() {
  const [editing, setEditing] = useState<LocationRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<LocationRow | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['locations'],
    queryFn: () => apiFetch<LocationRow[]>('/locations'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch<unknown>(`/locations/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      const name = data?.find((l) => l.id === id)?.name ?? 'Local';
      setDeleting(null);
      setNotice(`${name} foi excluído. Nenhum item estava registrado nele.`);
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rule-b flex flex-wrap items-end justify-between gap-3 pb-3">
        <h1 className="text-lg font-bold uppercase tracking-[0.16em] text-ink">
          Locais de estoque
        </h1>
        <button onClick={() => setCreating(true)} className="stamp-ghost" aria-haspopup="dialog">
          Novo local
        </button>
      </div>

      <p className="mt-3 max-w-2xl text-sm text-ink-70">
        Um local só pode ser excluído quando não tem saldo, equipamento rastreado nem movimentação
        no histórico — caso contrário o registro de auditoria ficaria órfão.
      </p>

      {notice && (
        <p className="mt-4 border-l-2 border-carbon pl-3 text-sm text-carbon" role="status">
          {notice}
        </p>
      )}

      <div className="perf mt-6" />

      {isLoading ? (
        <p className="py-6 text-sm text-ink-70">Carregando...</p>
      ) : error ? (
        <p className="border-l-2 border-red-carbon py-2 pl-3 text-sm text-red-carbon">
          {(error as Error).message} Recarregue a página para tentar de novo.
        </p>
      ) : !data || data.length === 0 ? (
        <p className="py-8 text-sm text-ink-70">
          Nenhum local cadastrado. Crie o almoxarifado central para começar a receber material.
        </p>
      ) : (
        <div className="ledger-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td className="whitespace-nowrap">{TYPE_LABELS[l.type] ?? l.type}</td>
                  <td>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setEditing(l);
                          setNotice(null);
                        }}
                        className="stamp-ghost min-h-10 px-3 py-1"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setDeleting(l);
                          setNotice(null);
                        }}
                        className="stamp-ghost min-h-10 px-3 py-1 text-red-carbon"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && <LocationFormModal onClose={() => setCreating(false)} />}
      {editing && <LocationFormModal location={editing} onClose={() => setEditing(null)} />}

      {deleting && (
        <ConfirmAction
          title="Excluir local de estoque"
          destructive
          pending={remove.isPending}
          error={remove.error as Error | null}
          confirmLabel="Excluir"
          message={
            <>
              <strong>{deleting.name}</strong> será removido. Só é possível se não houver saldo,
              equipamento rastreado nem movimentação no histórico — se houver, a API recusa e
              explica o que está impedindo.
            </>
          }
          onCancel={() => setDeleting(null)}
          onConfirm={() => remove.mutate(deleting.id)}
        />
      )}
    </div>
  );
}
