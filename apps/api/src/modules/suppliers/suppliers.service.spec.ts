import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SuppliersService } from './suppliers.service.js';

const prismaMock = {
  supplier: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

function makeService() {
  return new SuppliersService(prismaMock as any);
}

const dto = { cnpj: '12.345.678/0001-90', razaoSocial: 'Fibra SA', contato: 'contato@fibra.sa' };

describe('SuppliersService (RF-005)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('create persiste o fornecedor', async () => {
    prismaMock.supplier.create.mockResolvedValue({ id: 's1', ...dto });
    const result = await makeService().create(dto);
    expect(result).toMatchObject({ cnpj: dto.cnpj });
  });

  it('create rejeita CNPJ duplicado (P2002)', async () => {
    prismaMock.supplier.create.mockRejectedValue({ code: 'P2002' });
    await expect(makeService().create(dto)).rejects.toThrow(ConflictException);
  });

  it('findOne lança 404 para id inexistente', async () => {
    prismaMock.supplier.findUnique.mockResolvedValue(null);
    await expect(makeService().findOne('nope')).rejects.toThrow(NotFoundException);
  });
});
