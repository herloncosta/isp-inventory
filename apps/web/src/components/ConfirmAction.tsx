import ErrorNote from './form/ErrorNote';
import Modal from './Modal';

interface ConfirmActionProps {
  title: string;
  /** o que vai acontecer, em uma frase ou duas */
  message: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** ação que corta acesso ou apaga dado: vai em vermelho, e nunca ao lado do cancelamento */
  destructive?: boolean;
  pending: boolean;
  error: Error | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmação antes de uma ação que não se desfaz. O botão de confirmação fica
 * depois da linha de perfuração, longe do Cancelar — nada de "excluir" a dois
 * dedos de "confirmar".
 */
export default function ConfirmAction({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  destructive,
  pending,
  error,
  onConfirm,
  onCancel,
}: ConfirmActionProps) {
  return (
    <Modal open title={title} onClose={onCancel}>
      <div className="text-sm leading-relaxed text-ink">{message}</div>

      <div className="my-5 perf" />

      <ErrorNote error={error} recovery="" />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className={`stamp ${destructive ? 'border-red-carbon bg-red-carbon hover:bg-red-carbon' : ''}`}
        >
          {pending ? 'Salvando...' : confirmLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={pending} className="stamp-ghost">
          {cancelLabel}
        </button>
      </div>
    </Modal>
  );
}
