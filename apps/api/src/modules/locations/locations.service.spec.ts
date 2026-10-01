import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
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
};

function makeService() {
  return new LocationsService(prismaMock as any);
}

describe('LocationsService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
