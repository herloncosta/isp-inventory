import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service.js';

const prismaMock = {
  vehicle: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

function makeService() {
  return new VehiclesService(prismaMock as any);
}

const dto = { plate: 'ABC1D23', model: 'Fiorino' };

describe('VehiclesService (RF-004)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('create persiste o veículo', async () => {
    prismaMock.vehicle.create.mockResolvedValue({ id: 'v1', ...dto });
    const result = await makeService().create(dto);
    expect(result).toMatchObject({ plate: 'ABC1D23' });
  });

  it('create rejeita placa duplicada (P2002)', async () => {
    prismaMock.vehicle.create.mockRejectedValue({ code: 'P2002' });
    await expect(makeService().create(dto)).rejects.toThrow(ConflictException);
  });

  it('findOne lança 404 para id inexistente', async () => {
    prismaMock.vehicle.findUnique.mockResolvedValue(null);
    await expect(makeService().findOne('nope')).rejects.toThrow(NotFoundException);
  });
});
