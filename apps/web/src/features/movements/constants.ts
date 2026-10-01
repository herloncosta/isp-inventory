import type { Tab } from './types';

export const CONDITION_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponível',
  DEFECTIVE: 'Com defeito',
  MAINTENANCE: 'Manutenção',
};

export const MOVEMENT_TABS: { key: Tab; label: string; staffOnly?: boolean }[] = [
  { key: 'entrada', label: 'Entrada', staffOnly: true },
  { key: 'transferencia', label: 'Transferência', staffOnly: true },
  { key: 'baixa', label: 'Baixa em OS' },
  { key: 'devolucao', label: 'Devolução' },
  { key: 'historico', label: 'Histórico' },
];
