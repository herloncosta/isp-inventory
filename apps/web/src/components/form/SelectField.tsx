import type { Option } from '../../types';
import Field from './Field';

interface SelectFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  required?: boolean;
}

export default function SelectField({
  label,
  hint,
  value,
  onChange,
  options,
  required,
}: SelectFieldProps) {
  return (
    <Field label={label} hint={hint}>
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
    </Field>
  );
}
