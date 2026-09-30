export const API_BASE_URL = 'http://localhost:3000';

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  ESTOQUISTA: 'Estoquista',
  TECNICO: 'Técnico',
};

export const CATEGORY_LABELS: Record<string, string> = {
  ATIVO: 'Ativo de Rede',
  PASSIVO: 'Passivo de Rede',
  FERRAMENTA: 'Ferramenta',
};

export const UNIT_LABELS: Record<string, string> = {
  UNIDADE: 'Unidade',
  METRO: 'Metro',
  CAIXA: 'Caixa',
  PAR: 'Par',
};

export const MOVEMENT_LABELS: Record<string, string> = {
  ENTRADA: 'Entrada',
  TRANSFERENCIA: 'Transferência',
  BAIXA_OS: 'Baixa em OS',
  DEVOLUCAO: 'Devolução',
};
