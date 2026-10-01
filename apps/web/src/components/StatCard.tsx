interface StatCardProps {
  label: string;
  value: number;
  alert?: boolean;
}

/** Um número do painel: régua em baixo, algarismo tabular. */
export default function StatCard({ label, value, alert }: StatCardProps) {
  return (
    <div className="rule-b pb-2">
      <dt className="label">{label}</dt>
      <dd className={`num mt-0.5 text-3xl font-medium ${alert ? 'text-red-carbon' : 'text-ink'}`}>
        {value}
      </dd>
    </div>
  );
}
