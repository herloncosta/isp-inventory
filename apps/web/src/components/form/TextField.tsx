import Field from './Field';

interface TextFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

export default function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: TextFieldProps) {
  return (
    <Field label={label} hint={hint}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="field"
      />
    </Field>
  );
}
