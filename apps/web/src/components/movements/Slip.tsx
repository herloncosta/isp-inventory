interface SlipProps {
  title: string;
  children: React.ReactNode;
}

/** Uma folha do talão: o cabeçalho impresso e o formulário embaixo. */
export default function Slip({ title, children }: SlipProps) {
  return (
    <section>
      <h2 className="border-b border-ink pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
        {title}
      </h2>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}
