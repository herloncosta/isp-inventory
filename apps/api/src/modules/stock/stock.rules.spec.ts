import { describe, expect, it } from 'vitest';
import { canTransfer, findLowStock, hasDuplicateSerial } from './stock.rules.js';

describe('canTransfer (RN-02)', () => {
  it('permite transferência quando há saldo suficiente', () => {
    expect(canTransfer(10, 5)).toBe(true);
  });

  it('bloqueia transferência acima do saldo', () => {
    expect(canTransfer(3, 5)).toBe(false);
  });

  it('bloqueia quantidade não positiva', () => {
    expect(canTransfer(10, 0)).toBe(false);
    expect(canTransfer(10, -2)).toBe(false);
  });
});

describe('findLowStock (RF-013)', () => {
  it('retorna apenas itens no ou abaixo do mínimo', () => {
    const balances = [
      { quantity: 2, minStock: 5 },
      { quantity: 5, minStock: 5 },
      { quantity: 10, minStock: 5 },
    ];
    expect(findLowStock(balances)).toHaveLength(2);
  });

  it('retorna vazio quando tudo está acima do mínimo', () => {
    expect(findLowStock([{ quantity: 10, minStock: 5 }])).toHaveLength(0);
  });
});

describe('hasDuplicateSerial (RN-01)', () => {
  it('detecta serial duplicado', () => {
    expect(hasDuplicateSerial(['A1', 'A2', 'A1'])).toBe(true);
  });

  it('retorna falso sem duplicados', () => {
    expect(hasDuplicateSerial(['A1', 'A2', 'A3'])).toBe(false);
  });
});
