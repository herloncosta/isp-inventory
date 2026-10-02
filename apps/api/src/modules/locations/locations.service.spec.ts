import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { LocationType } from '@isp/shared';
import { LocationsService } from './locations.service.js';

const prismaMock = {
  stockLocation: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  stockBalance: { count: vi.fn() },
  serialItem: { count: vi.fn() },
  stockMovement: { count: vi.fn() },
};

function makeService() {
  return new LocationsService(prismaMock as any);
}

/** local vazio por padrão: é o único caso em que a exclusão é permitida */
function emptyLocation() {
  prismaMock.stockBalance.count.mockResolvedValue(0);
  prismaMock.serialItem.count.mockResolvedValue(0);
  prismaMock.stockMovement.count.mockResolvedValue(0);
}

describe('LocationsService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.stockLocation.findUnique.mockResolvedValue({
      id: 'l1',
      name: 'Central',
      type: 'CENTRAL',
    });
  });

  it('create persiste o local', async () => {
    prismaMock.stockLocation.create.mockResolvedValue({
      id: 'l1',
      name: 'Central',
      type: 'CENTRAL',
    });
    const result = await makeService().create({ name: 'Central', type: LocationType.CENTRAL });
    expect(result).toMatchObject({ name: 'Central' });
  });

  it('findOne lança 404 para id inexistente', async () => {
    prismaMock.stockLocation.findUnique.mockResolvedValue(null);
    await expect(makeService().findOne('nope')).rejects.toThrow(NotFoundException);
  });
});

describe('LocationsService.remove (só exclui local sem item registrado)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.stockLocation.findUnique.mockResolvedValue({
      id: 'l1',
      name: 'Central',
      type: 'CENTRAL',
    });
    emptyLocation();
  });

  it('exclui quando não há saldo, equipamento nem histórico', async () => {
    prismaMock.stockLocation.delete.mockResolvedValue({ id: 'l1' });

    await expect(makeService().remove('l1')).resolves.toEqual({ id: 'l1' });
    expect(prismaMock.stockLocation.delete).toHaveBeenCalledWith({ where: { id: 'l1' } });
  });

  it('recusa quando há saldo, e a mensagem diz quanto', async () => {
    prismaMock.stockBalance.count.mockResolvedValue(3);

    await expect(makeService().remove('l1')).rejects.toThrow(ConflictException);
    await expect(makeService().remove('l1')).rejects.toThrow(/3 saldos de produto/);
    expect(prismaMock.stockLocation.delete).not.toHaveBeenCalled();
  });

  it('recusa quando há equipamento rastreado no local', async () => {
    prismaMock.serialItem.count.mockResolvedValue(1);

    await expect(makeService().remove('l1')).rejects.toThrow(/1 equipamento rastreado/);
    expect(prismaMock.stockLocation.delete).not.toHaveBeenCalled();
  });

  it('recusa quando há movimentação no histórico, mesmo sem saldo hoje', async () => {
    prismaMock.stockMovement.count.mockResolvedValue(2);

    await expect(makeService().remove('l1')).rejects.toThrow(/2 movimentações no histórico/);
    expect(prismaMock.stockLocation.delete).not.toHaveBeenCalled();
  });

  it('consulta histórico como origem e como destino', async () => {
    prismaMock.stockMovement.count.mockResolvedValue(1);
    await makeService()
      .remove('l1')
      .catch(() => {});

    expect(prismaMock.stockMovement.count).toHaveBeenCalledWith({
      where: { OR: [{ sourceLocationId: 'l1' }, { targetLocationId: 'l1' }] },
    });
  });

  it('acumula os motivos quando mais de um impede', async () => {
    prismaMock.stockBalance.count.mockResolvedValue(2);
    prismaMock.stockMovement.count.mockResolvedValue(4);

    await expect(makeService().remove('l1')).rejects.toThrow(/2 saldos de produto/);
    await expect(makeService().remove('l1')).rejects.toThrow(/4 movimentações no histórico/);
  });

  it('remove em id inexistente lança 404 antes de contar', async () => {
    prismaMock.stockLocation.findUnique.mockResolvedValue(null);
    await expect(makeService().remove('nope')).rejects.toThrow(NotFoundException);
    expect(prismaMock.stockBalance.count).not.toHaveBeenCalled();
  });

  it('traduz P2003 em mensagem de item vinculado', async () => {
    prismaMock.stockLocation.delete.mockRejectedValue({ code: 'P2003' });
    await expect(makeService().remove('l1')).rejects.toThrow(BadRequestException);
  });
});
