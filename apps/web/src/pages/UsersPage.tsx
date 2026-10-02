import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ROLE_LABELS } from '@isp/shared';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import UserStatus, { type UserRow } from '../components/users/UserStatus';
import UserFormModal from '../components/users/UserFormModal';
import ConfirmStatus from '../components/users/ConfirmStatus';

/**
 * Gestão de usuários: criar, editar e desativar. **Nunca excluir** — o log de
 * auditoria aponta para o usuário, e apagar a linha quebraria a proveniência dos
 * lançamentos. Por isso a ação é "desativar", e ela some com o acesso sem
 * tocar no histórico.
 */
export default function UsersPage() {
  const { user: me } = useAuth();
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<UserRow | null>(null);

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<UserRow[]>('/users'),
  });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; active: boolean }) =>
      apiFetch<UserRow>(`/users/${v.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ active: v.active }),
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setConfirming(null);
      setNotice(
        updated.active
          ? `${updated.name} foi reativado e já pode entrar.`
          : `${updated.name} foi desativado. O histórico dos lançamentos dele continua intacto.`,
      );
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rule-b flex flex-wrap items-end justify-between gap-3 pb-3">
        <h1 className="text-lg font-bold uppercase tracking-[0.16em] text-ink">Usuários</h1>
        <button onClick={() => setCreating(true)} className="stamp-ghost" aria-haspopup="dialog">
          Novo usuário
        </button>
      </div>

      <p className="mt-3 max-w-2xl text-sm text-ink-70">
        Usuário não é excluído: todo log de auditoria aponta para ele. Desativar tira o acesso
        imediatamente e preserva o histórico.
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
          Nenhum usuário cadastrado. Use “Novo usuário” para o primeiro.
        </p>
      ) : (
        <div className="ledger-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td className="num">{u.email}</td>
                  <td className="whitespace-nowrap">{ROLE_LABELS[u.role] ?? u.role}</td>
                  <td>
                    <UserStatus user={u} />
                  </td>
                  <td>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setEditing(u);
                          setNotice(null);
                        }}
                        className="stamp-ghost min-h-10 px-3 py-1"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirming(u)}
                        disabled={u.id === me?.id}
                        title={
                          u.id === me?.id ? 'Você não pode desativar a própria conta' : undefined
                        }
                        className="stamp-ghost min-h-10 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {u.active ? 'Desativar' : 'Reativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && <UserFormModal onClose={() => setCreating(false)} />}
      {editing && <UserFormModal user={editing} onClose={() => setEditing(null)} />}

      {confirming && (
        <ConfirmStatus
          user={confirming}
          pending={setStatus.isPending}
          error={setStatus.error as Error | null}
          onCancel={() => setConfirming(null)}
          onConfirm={() => setStatus.mutate({ id: confirming.id, active: !confirming.active })}
        />
      )}
    </div>
  );
}
