import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductCategory, Technology, Unit } from '@isp/shared';
import { ProductsService } from './products.service.js';

const prismaMock = {
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

function makeService() {
  return new ProductsService(prismaMock as any);
}

const dto = {
  name: 'ONU FiberHome',
  sku: 'ONU-FH-001',
  category: ProductCategory.ATIVO,
  technology: Technology.FIBRA,
  unit: Unit.UNIDADE,
  minStock: 5,
};

describe('ProductsService (RF-003)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('create persiste o produto', async () => {
    prismaMock.product.create.mockResolvedValue({ id: 'p1', ...dto });
    const result = await makeService().create(dto);
    expect(result).toMatchObject({ sku: 'ONU-FH-001' });
  });

  it('create rejeita SKU duplicado (P2002)', async () => {
    prismaMock.product.create.mockRejectedValue({ code: 'P2002' });
    await expect(makeService().create(dto)).rejects.toThrow(ConflictException);
  });

  it('findOne lança 404 para id inexistente', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    await expect(makeService().findOne('nope')).rejects.toThrow(NotFoundException);
  });

  it('update e remove verificam existência antes', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    await expect(makeService().update('nope', { name: 'X' })).rejects.toThrow(NotFoundException);
    await expect(makeService().remove('nope')).rejects.toThrow(NotFoundException);
  });
});
