import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { EntriesService } from './entries.service.js';

const txMock = {
  stockBalance: { upsert: vi.fn() },
  stockMovement: { create: vi.fn() },
  serialItem: { createMany: vi.fn() },
};
const prismaMock = {
  $transaction: vi.fn((cb: any) => cb(txMock)),
  serialItem: { findMany: vi.fn() },
};

function makeService() {
  return new EntriesService(prismaMock as any);
}

describe('EntriesService.createEntry (RF-006)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('credita saldo e registra movimento de ENTRADA com fornecedor', async () => {
    txMock.stockMovement.create.mockResolvedValue({ id: 'm1' });
    const result = await makeService().createEntry({
      productId: 'p1',
      locationId: 'l1',
      quantity: 10,
      supplierId: 's1',
      createdBy: 'u1',
    });

    expect(txMock.stockBalance.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { quantity: { increment: 10 } } }),
    );
    expect(txMock.stockMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sourceLocationId: null,
          targetLocationId: 'l1',
          quantity: 10,
          type: 'ENTRADA',
          supplierId: 's1',
        }),
      }),
    );
    expect(result).toEqual({ id: 'm1' });
  });

  it('rejeita quantidade não positiva', async () => {
    await expect(
      makeService().createEntry({ productId: 'p', locationId: 'l', quantity: 0, createdBy: 'u' }),
    ).rejects.toThrow(BadRequestException);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('mapeia referência inexistente (P2003) para 400', async () => {
    prismaMock.$transaction.mockRejectedValueOnce({ code: 'P2003' });
    await expect(
      makeService().createEntry({
        productId: 'ghost',
        locationId: 'l',
        quantity: 1,
        createdBy: 'u',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('EntriesService.createSerialBatch (RF-007)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock));
    prismaMock.serialItem.findMany.mockResolvedValue([]);
    txMock.stockMovement.create.mockResolvedValue({ id: 'm2' });
  });

  const batch = {
    productId: 'p1',
    locationId: 'l1',
    createdBy: 'u1',
    items: [
      { serialNumber: 'SN1', macAddress: 'AA:01' },
      { serialNumber: 'SN2', macAddress: 'AA:02' },
    ],
  };

  it('cria seriais, credita saldo pela contagem e registra movimento', async () => {
    await makeService().createSerialBatch(batch);

    expect(txMock.serialItem.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([expect.objectContaining({ status: 'AVAILABLE' })]),
      }),
    );
    expect(txMock.stockBalance.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { quantity: { increment: 2 } } }),
    );
    expect(txMock.stockMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ quantity: 2 }) }),
    );
  });

  it('rejeita duplicados dentro do próprio lote sem tocar o banco', async () => {
    await expect(
      makeService().createSerialBatch({
        ...batch,
        items: [{ serialNumber: 'SN1' }, { serialNumber: 'SN1' }],
      }),
    ).rejects.toThrow(ConflictException);
    expect(prismaMock.serialItem.findMany).not.toHaveBeenCalled();
  });

  it('rejeita seriais já cadastrados (409)', async () => {
    prismaMock.serialItem.findMany.mockResolvedValue([{ serialNumber: 'SN1', macAddress: null }]);
    await expect(makeService().createSerialBatch(batch)).rejects.toThrow(ConflictException);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});

describe('EntriesService.createFractionalEntry (RF-008)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock));
    txMock.stockMovement.create.mockResolvedValue({ id: 'm3' });
  });

  it('converte pacotes em metros (2 x 100 = 200)', async () => {
    await makeService().createFractionalEntry({
      productId: 'p-cabo',
      locationId: 'l1',
      packages: 2,
      metersPerPackage: 100,
      createdBy: 'u1',
    });

    expect(txMock.stockMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ quantity: 200 }) }),
    );
    expect(txMock.stockBalance.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { quantity: { increment: 200 } } }),
    );
  });
});
