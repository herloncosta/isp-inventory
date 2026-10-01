interface StampSubmitProps {
  pending: boolean;
  children: React.ReactNode;
}

/** A ação primária do talão, separada do resto do formulário por uma régua. */
export default function StampSubmit({ pending, children }: StampSubmitProps) {
  return (
    <div className="border-t border-rule pt-4">
      <button type="submit" disabled={pending} className="stamp w-full sm:w-auto">
        {pending ? 'Registrando...' : children}
      </button>
    </div>
  );
}
