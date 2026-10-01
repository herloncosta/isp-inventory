/** Item de uma lista do catálogo, já rotulado para o select. */
export interface Option {
  id: string;
  name: string;
}

/**
 * Rótulo de um registro de catálogo. Nem todo domínio tem `name`: fornecedor
 * tem `razaoSocial`, veículo tem `plate`. Sem esta regra o select abre com
 * opções em branco — e um select vazio parece um cadastro quebrado.
 */
export function toOptions(rows: Array<Record<string, unknown>> | undefined): Option[] {
  return (rows ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? row.razaoSocial ?? row.plate ?? row.id),
  }));
}
