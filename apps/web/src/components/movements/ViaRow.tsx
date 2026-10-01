interface ViaRowProps {
  label: string;
  value: string;
}

/** Uma linha da via: rótulo, guia pontilhada e o valor preenchido. */
export default function ViaRow({ label, value }: ViaRowProps) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="label w-24 shrink-0">{label}</dt>
      <span className="leader w-4 shrink-0" />
      <dd className="num min-w-0 flex-1 break-words text-ink">{value}</dd>
    </div>
  );
}
