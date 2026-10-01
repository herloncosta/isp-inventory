interface ErrorNoteProps {
  error: Error | null;
}

/** Erro de API nomeando o problema e a recuperação. */
export default function ErrorNote({ error }: ErrorNoteProps) {
  if (!error) return null;
  return (
    <p className="border-l-2 border-red-carbon pl-3 text-sm text-red-carbon">
      {error.message} Verifique os dados e tente de novo.
    </p>
  );
}
