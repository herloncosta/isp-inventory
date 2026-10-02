interface ErrorNoteProps {
  error: Error | null;
  /**
   * Frase de recuperação. Passe `''` para omitir: recusa de regra de negócio já
   * diz o que fazer, e sugerir "tente de novo" seria mandar a pessoa repetir
   * um erro que não muda.
   */
  recovery?: string;
}

const GENERIC = 'Verifique os dados e tente de novo.';

/** Erro de API nomeando o problema e a recuperação. */
export default function ErrorNote({ error, recovery }: ErrorNoteProps) {
  if (!error) return null;
  const hint = recovery === '' ? null : (recovery ?? GENERIC);
  return (
    <p className="border-l-2 border-red-carbon pl-3 text-sm text-red-carbon">
      {error.message}
      {hint ? ` ${hint}` : ''}
    </p>
  );
}
