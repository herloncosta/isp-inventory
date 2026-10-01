import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Popup do talão, sobre `<dialog>` nativo: o navegador entrega foco preso,
 * Escape e ::backdrop de graça — nada de armadilha de foco feita à mão.
 * O `<dialog>` também não deve ser renderizado fechado, senão o showModal()
 * do próximo abrir não encontra elemento.
 */
export default function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] border-2 border-ink bg-paper p-0 text-ink backdrop:bg-[rgba(22,24,29,0.55)]"
      // Escape fecha: o evento não muda o estado do React sozinho
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // clique fora do conteúdo, no fundo do próprio dialog
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-ink px-4 py-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink">{title}</h2>
        <button type="button" onClick={onClose} className="stamp-ghost min-h-10 px-3 py-1">
          Fechar
        </button>
      </div>
      <div className="max-h-[75dvh] overflow-y-auto px-4 py-4">{children}</div>
    </dialog>
  );
}
