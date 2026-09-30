export interface BalanceInput {
  quantity: number;
  minStock: number;
}

export function canTransfer(balance: number, quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0 && balance >= quantity;
}

export function findLowStock<T extends BalanceInput>(balances: T[]): T[] {
  return balances.filter((b) => b.quantity <= b.minStock);
}

export function hasDuplicateSerial(serials: string[]): boolean {
  return new Set(serials).size !== serials.length;
}
