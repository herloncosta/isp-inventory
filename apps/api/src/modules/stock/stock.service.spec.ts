import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { StockService } from './stock.service.js';

const prismaMock = {
  stockBalance: { findMany: vi.fn() },
  stockMovement: { findMany: vi.fn() },
  technicianLocationId: vi.fn(),
};

const admin = { sub: 'u-admin', role: 'ADMIN' };
const tecnico = { sub: 'u-tec', role: 'TECNICO' };

function makeService() {
  return new StockService(prismaMock as any);
}

describe('StockService.getMyBalances (RF-012)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('retorna saldos do local vinculado ao veículo do técnico', async () => {
    prismaMock.technicianLocationId.mockResolvedValue('carro1');
    prismaMock.stockBalance.findMany.mockResolvedValue([{ id: 'b1' }]);

    const result = await makeService().getMyBalances('u-tec');

    expect(prismaMock.stockBalance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { locationId: 'carro1' } }),
    );
    expect(result).toEqual([{ id: 'b1' }]);
  });

  it('inclui produto e local — a tela de saldo mostra os dois nomes', async () => {
    await makeService().getBalances();

    expect(prismaMock.stockBalance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { product: true, location: true } }),
    );
  });

  it('lança 404 quando técnico não tem vínculo', async () => {
    prismaMock.technicianLocationId.mockResolvedValue(null);
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
    await makeService().getMovements(admin, {
      type: 'BAIXA_OS',
      from: '2026-01-01',
      to: '2026-12-31',
    });

    expect(prismaMock.stockMovement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: 'BAIXA_OS',
          createdAt: expect.objectContaining({ gte: new Date('2026-01-01') }),
        }),
      }),
    );
  });

  it('inclui o produto — a UI do histórico renderiza movement.product.name', async () => {
    await makeService().getMovements(admin);

    expect(prismaMock.stockMovement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { product: true } }),
    );
  });

  it('força o TECNICO no próprio veículo, ignorando o locationId da query string', async () => {
    prismaMock.technicianLocationId.mockResolvedValue('carro1');

    await makeService().getMovements(tecnico, { locationId: 'central' });

    expect(prismaMock.technicianLocationId).toHaveBeenCalledWith('u-tec');
    expect(prismaMock.stockMovement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ sourceLocationId: 'carro1' }, { targetLocationId: 'carro1' }],
        }),
      }),
    );
  });

  it('devolve vazio quando o TECNICO não tem veículo — sem local não há histórico', async () => {
    prismaMock.technicianLocationId.mockResolvedValue(null);

    const result = await makeService().getMovements(tecnico);

    expect(result).toEqual([]);
    expect(prismaMock.stockMovement.findMany).not.toHaveBeenCalled();
  });
});
