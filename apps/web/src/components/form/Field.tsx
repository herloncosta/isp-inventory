interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

/** Rótulo impresso do formulário: versalete condensado, com a dica abaixo. */
export default function Field({ label, hint, children }: FieldProps) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] leading-snug text-ink-45">{hint}</p>}
    </div>
  );
}
