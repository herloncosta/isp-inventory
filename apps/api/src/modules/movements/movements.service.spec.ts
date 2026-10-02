import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Role } from '@isp/shared';
import { MovementsService } from './movements.service.js';

const txMock = {
  stockBalance: { findUnique: vi.fn(), update: vi.fn(), upsert: vi.fn() },
  serialItem: { findMany: vi.fn(), updateMany: vi.fn() },
  stockMovement: { create: vi.fn() },
};
const prismaMock = {
  $transaction: vi.fn((cb: any) => cb(txMock)),
  technicianLocationId: vi.fn(),
};

function makeService() {
  return new MovementsService(prismaMock as any);
}

describe('MovementsService.transfer (RF-009)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock));
    txMock.stockBalance.findUnique.mockResolvedValue({ id: 'b1', quantity: 10 });
    txMock.serialItem.findMany.mockResolvedValue([]);
    txMock.stockMovement.create.mockResolvedValue({ id: 'm1' });
  });

  it('transfere saldo entre locais (RN-02)', async () => {
    await makeService().transfer({
      sourceLocationId: 'central',
      targetLocationId: 'carro1',
      productId: 'p1',
      quantity: 4,
      createdBy: 'u1',
      role: Role.ESTOQUISTA,
    });

    expect(txMock.stockBalance.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantity: { decrement: 4 } } }),
    );
    expect(txMock.stockBalance.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { quantity: { increment: 4 } } }),
    );
    expect(txMock.stockMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'TRANSFERENCIA' }) }),
    );
  });

  it('bloqueia saldo insuficiente', async () => {
    txMock.stockBalance.findUnique.mockResolvedValue({ id: 'b1', quantity: 2 });
    await expect(
      makeService().transfer({
        sourceLocationId: 'central',
        targetLocationId: 'carro1',
        productId: 'p1',
        quantity: 5,
        createdBy: 'u1',
        role: Role.ESTOQUISTA,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejeita origem igual ao destino', async () => {
    await expect(
      makeService().transfer({
        sourceLocationId: 'l',
        targetLocationId: 'l',
        productId: 'p1',
        quantity: 1,
        createdBy: 'u1',
        role: Role.ESTOQUISTA,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('move seriais AVAILABLE da origem para o destino', async () => {
    txMock.serialItem.findMany.mockResolvedValue([
      { serialNumber: 'SN1', productId: 'p1', currentLocationId: 'central', status: 'AVAILABLE' },
    ]);
    await makeService().transfer({
      sourceLocationId: 'central',
      targetLocationId: 'carro1',
      productId: 'p1',
      quantity: 1,
      serialNumbers: ['SN1'],
      createdBy: 'u1',
      role: Role.ESTOQUISTA,
    });
    expect(txMock.serialItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { currentLocationId: 'carro1' } }),
    );
  });

  it('rejeita serial de outro local', async () => {
    txMock.serialItem.findMany.mockResolvedValue([
      { serialNumber: 'SN1', productId: 'p1', currentLocationId: 'outro', status: 'AVAILABLE' },
    ]);
    await expect(
      makeService().transfer({
        sourceLocationId: 'central',
        targetLocationId: 'carro1',
        productId: 'p1',
        quantity: 1,
        serialNumbers: ['SN1'],
        createdBy: 'u1',
        role: Role.ESTOQUISTA,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('MovementsService.issue (RF-010)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock));
    txMock.stockBalance.findUnique.mockResolvedValue({ id: 'b1', quantity: 10 });
    txMock.stockMovement.create.mockResolvedValue({ id: 'm2' });
  });

  it('baixa em OS marca serial IN_USE com número da OS', async () => {
    txMock.serialItem.findMany.mockResolvedValue([
      { serialNumber: 'SN1', productId: 'p1', currentLocationId: 'carro1', status: 'AVAILABLE' },
    ]);
    await makeService().issue({
      sourceLocationId: 'carro1',
      productId: 'p1',
      quantity: 1,
      osNumber: 'OS-123',
      serialNumbers: ['SN1'],
      createdBy: 'u1',
      role: Role.ESTOQUISTA,
    });
    expect(txMock.serialItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'IN_USE', osNumber: 'OS-123' } }),
    );
    expect(txMock.stockMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'BAIXA_OS', osNumber: 'OS-123' }),
      }),
    );
  });

  it('rejeita divergência entre quantidade e seriais', async () => {
    await expect(
      makeService().issue({
        sourceLocationId: 'carro1',
        productId: 'p1',
        quantity: 2,
        osNumber: 'OS-1',
        serialNumbers: ['SN1'],
        createdBy: 'u1',
        role: Role.ESTOQUISTA,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('MovementsService.return (RF-011)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock));
    txMock.stockBalance.findUnique.mockResolvedValue({ id: 'b1', quantity: 5 });
    txMock.stockMovement.create.mockResolvedValue({ id: 'm3' });
  });

  it('devolução com defeito atualiza status e retorna ao central', async () => {
    txMock.serialItem.findMany.mockResolvedValue([
      { serialNumber: 'SN1', productId: 'p1', currentLocationId: 'carro1', status: 'IN_USE' },
    ]);
    await makeService().return({
      sourceLocationId: 'carro1',
      targetLocationId: 'central',
      productId: 'p1',
      quantity: 1,
      condition: 'DEFECTIVE' as any,
      serialNumbers: ['SN1'],
      createdBy: 'u1',
      role: Role.ESTOQUISTA,
    });
    expect(txMock.serialItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'DEFECTIVE', currentLocationId: 'central' } }),
    );
    expect(txMock.stockMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'DEVOLUCAO' }) }),
    );
  });
});

describe('MovementsService escopo do TECNICO (RF-002)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock));
    txMock.stockBalance.findUnique.mockResolvedValue({ id: 'b1', quantity: 10 });
    txMock.stockMovement.create.mockResolvedValue({ id: 'm4' });
  });

  it('deixa o técnico dar baixa no estoque do próprio veículo', async () => {
    prismaMock.technicianLocationId.mockResolvedValue('carro1');

    await makeService().issue({
      sourceLocationId: 'carro1',
      productId: 'p1',
      quantity: 1,
      osNumber: 'OS-9',
      role: Role.TECNICO,
      createdBy: 'u-tec',
    });

    expect(txMock.stockMovement.create).toHaveBeenCalled();
  });

  it('recusa técnico debitando da Central', async () => {
    prismaMock.technicianLocationId.mockResolvedValue('carro1');

    await expect(
      makeService().issue({
        sourceLocationId: 'central',
        productId: 'p1',
        quantity: 1,
        osNumber: 'OS-9',
        role: Role.TECNICO,
        createdBy: 'u-tec',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('recusa técnico sem veículo vinculado — sem local, não há estoque a movimentar', async () => {
    prismaMock.technicianLocationId.mockResolvedValue(null);

    await expect(
      makeService().return({
        sourceLocationId: 'central',
        targetLocationId: 'carro1',
        productId: 'p1',
        quantity: 1,
        condition: 'AVAILABLE' as any,
        role: Role.TECNICO,
        createdBy: 'u-tec',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('deixa ESTOQUISTA debitar de qualquer local', async () => {
    await makeService().issue({
      sourceLocationId: 'central',
      productId: 'p1',
      quantity: 1,
      osNumber: 'OS-9',
      role: Role.ESTOQUISTA,
      createdBy: 'u-estoquista',
    });

    expect(prismaMock.technicianLocationId).not.toHaveBeenCalled();
    expect(txMock.stockMovement.create).toHaveBeenCalled();
  });
});
