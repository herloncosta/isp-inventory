import type { UserRow } from './UserStatus';
import ErrorNote from '../form/ErrorNote';
import Modal from '../Modal';

interface ConfirmStatusProps {
  user: UserRow;
  pending: boolean;
  error: Error | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirmação de desativar/reativar, porque a ação corta o acesso de alguém.
 * A ação destrutiva fica depois da linha de perfuração, longe do botão de
 * cancelar — nada de "desativar" a dois dedos de "confirmar".
 */
export default function ConfirmStatus({
  user,
  pending,
  error,
  onCancel,
  onConfirm,
}: ConfirmStatusProps) {
  const activating = !user.active;

  return (
    <Modal open title={activating ? 'Reativar usuário' : 'Desativar usuário'} onClose={onCancel}>
      <p className="text-sm leading-relaxed text-ink">
        {activating ? (
          <>
            <strong>{user.name}</strong> volta a conseguir entrar no sistema.
          </>
        ) : (
          <>
            <strong>{user.name}</strong> deixa de conseguir entrar na hora. Os lançamentos que ele
            registrou continuam com o nome dele — nada do histórico é apagado.
          </>
        )}
      </p>

      <div className="my-5 perf" />

      <ErrorNote error={error} recovery="" />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className={`stamp ${activating ? '' : 'border-red-carbon bg-red-carbon hover:bg-red-carbon'}`}
        >
          {pending ? 'Salvando...' : activating ? 'Reativar' : 'Desativar'}
        </button>
        <button type="button" onClick={onCancel} disabled={pending} className="stamp-ghost">
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
