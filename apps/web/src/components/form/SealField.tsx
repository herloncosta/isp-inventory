export type SealTone = 'carbon' | 'defeito';
export type SealOption = [value: string, label: string, tone: SealTone];

interface SealFieldProps {
  label: string;
  value: string;
  options: SealOption[];
  onChange: (v: string) => void;
}

/**
 * Selo de estado: quadrado, com a marca impressa — nunca só cor. O tom é por
 * opção, então "Disponível" não carimba vermelho.
 */
export default function SealField({ label, value, options, onChange }: SealFieldProps) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map(([v, text, tone]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            data-on={value === v}
            data-tone={tone}
            onClick={() => onChange(v)}
            className="seal"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
