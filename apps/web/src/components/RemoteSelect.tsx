import { useList } from '../hooks/useCrud';

interface RemoteSelectProps {
  source: { queryKey: string; endpoint: string };
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}

/** Select populado por um endpoint existente — evita pedir UUID colado no campo. */
export default function RemoteSelect({ source, value, onChange, required }: RemoteSelectProps) {
  const { data } = useList<{ id: string; name?: string; plate?: string }>(
    source.queryKey,
    source.endpoint,
  );

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="field"
    >
      <option value="">Selecione</option>
      {data?.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name ?? o.plate ?? o.id}
        </option>
      ))}
    </select>
  );
}
