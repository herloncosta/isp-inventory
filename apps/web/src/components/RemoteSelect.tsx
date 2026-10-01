import { useList } from '../hooks/useCrud';
import { toOptions } from '../features/options';

interface RemoteSelectProps {
  source: { queryKey: string; endpoint: string };
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}

/** Select populado por um endpoint existente — evita pedir UUID colado no campo. */
export default function RemoteSelect({ source, value, onChange, required }: RemoteSelectProps) {
  const { data } = useList<Record<string, unknown>>(source.queryKey, source.endpoint);
  const options = toOptions(data);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="field"
    >
      <option value="">Selecione</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
