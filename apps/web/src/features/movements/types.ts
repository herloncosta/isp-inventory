import type { Option } from '../../types';

export type Tab = 'entrada' | 'transferencia' | 'baixa' | 'devolucao' | 'historico';

/** `carregando` e `erro` existem para o saldo nunca afirmar "zerado" sobre um erro. */
export type BalanceState = 'carregando' | 'erro' | 'pronto';

export interface Movement {
  id: string;
  type: string;
  quantity: number;
  osNumber?: string | null;
  createdAt: string;
  product: { name: string };
}

export interface Balance {
  id: string;
  locationId: string;
  quantity: number;
  product: { id: string; unit: string };
}

/** a via: a duplicata carbonada que o técnico levaria como comprovante */
export interface Via {
  operacao: string;
  os: string;
  item: string;
  qtd: string;
  condicao?: string;
  destino: string;
  /** carimbado no instante da confirmação: a via não pode reescrever a própria hora */
  quando: string;
}

/**_props comuns às operações que debitam um local_ */
export interface MovementFormProps {
  products: Option[];
  locations: Option[];
  balances: Balance[];
  balanceState: BalanceState;
  productName: (id: string) => string;
  locationName: (id: string) => string;
}

export interface EntryFormProps {
  products: Option[];
  locations: Option[];
  suppliers: Option[];
  productName: (id: string) => string;
  locationName: (id: string) => string;
}
