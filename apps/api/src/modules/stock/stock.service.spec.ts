import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { StockService } from './stock.service.js';

const prismaMock = {
  stockBalance: { findMany: vi.fn() },
  technician: { findUnique: vi.fn() },
  stockMovement: { findMany: vi.fn() },
};

function makeService() {
  return new StockService(prismaMock as any);
}

describe('StockService.getMyBalances (RF-012)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('retorna saldos do local vinculado ao veículo do técnico', async () => {
    prismaMock.technician.findUnique.mockResolvedValue({
      id: 't1',
      vehicle: { id: 'v1', location: { id: 'carro1' } },
    });
    prismaMock.stockBalance.findMany.mockResolvedValue([{ id: 'b1' }]);

    const result = await makeService().getMyBalances('u-tec');

    expect(prismaMock.stockBalance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { locationId: 'carro1' } }),
    );
    expect(result).toEqual([{ id: 'b1' }]);
  });

  it('lança 404 quando técnico não tem vínculo', async () => {
    prismaMock.technician.findUnique.mockResolvedValue({ id: 't1', vehicle: null });
    await expect(makeService().getMyBalances('u-tec')).rejects.toThrow(NotFoundException);
    expect(prismaMock.stockBalance.findMany).not.toHaveBeenCalled();
  });
});

describe('StockService.getMovements (filtros)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.stockMovement.findMany.mockResolvedValue([]);
  });

  it('aplica filtros de tipo e período', async () => {
    await makeService().getMovements({ type: 'BAIXA_OS', from: '2026-01-01', to: '2026-12-31' });

    expect(prismaMock.stockMovement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: 'BAIXA_OS',
          createdAt: expect.objectContaining({ gte: new Date('2026-01-01') }),
        }),
      }),
    );
  });
});
