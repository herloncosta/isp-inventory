import Field from './Field';

interface NumberFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}

export default function NumberField({ label, hint, value, onChange }: NumberFieldProps) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="field"
      />
    </Field>
  );
}
