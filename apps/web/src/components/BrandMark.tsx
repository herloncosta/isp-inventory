/**
 * Marca do ISP Inventory — a gota de fibra descendo até o equipamento.
 * Desenhada no traço do mundo (traço único, sem preenchimento de formato),
 * legível de 24px a 40px. Substitua por um logo real quando existir.
 */
export default function BrandMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none">
      <rect x="6" y="18" width="20" height="8" stroke="currentColor" strokeWidth="2" />
      <path d="M26 3c0 6-2 10-4 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="18" r="2.4" fill="currentColor" />
    </svg>
  );
}
