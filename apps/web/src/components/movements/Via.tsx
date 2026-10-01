import type { Via as ViaData } from '../../features/movements/types';
import ViaRow from './ViaRow';

interface ViaProps {
  via: ViaData | null;
  stamp: number;
}

/**
 * A via carbonada — o momento único do produto. A key troca a cada confirmação
 * para a folha se imprimir de novo.
 */
export default function Via({ via, stamp }: ViaProps) {
  if (!via) return null;
  return (
    <div className="via" role="status" key={stamp}>
      <p className="label text-carbon">Via carbonada — registrada</p>
      <dl className="mt-2 space-y-1.5 text-sm">
        <ViaRow label="Operação" value={via.operacao} />
        <ViaRow label="OS" value={via.os || '—'} />
        <ViaRow label="Item" value={via.item} />
        <ViaRow label="Quantidade" value={via.qtd} />
        {via.condicao && <ViaRow label="Condição" value={via.condicao} />}
        <ViaRow label="Destino" value={via.destino} />
        <ViaRow label="Horário" value={via.quando} />
      </dl>
      <p className="mt-2.5 border-t border-rule pt-2 text-[11px] leading-snug text-ink-70">
        Auditoria imutável: o lançamento não pode ser apagado, só corrigido por nova movimentação.
      </p>
    </div>
  );
}
