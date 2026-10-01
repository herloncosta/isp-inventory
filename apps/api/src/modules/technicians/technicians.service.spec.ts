import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { TechniciansService } from './technicians.service.js';

const prismaMock = {
  technician: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

function makeService() {
  return new TechniciansService(prismaMock as any);
}

const dto = { name: 'Carlos', userId: 'u-tec', vehicleId: 'v1' };

describe('TechniciansService (RF-004)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('create vincula técnico ao veículo', async () => {
    prismaMock.technician.create.mockResolvedValue({ id: 't1', ...dto });
    const result = await makeService().create(dto);
    expect(result).toMatchObject({ vehicleId: 'v1' });
  });

  it('create rejeita usuário já vinculado (P2002)', async () => {
    prismaMock.technician.create.mockRejectedValue({ code: 'P2002' });
    await expect(makeService().create(dto)).rejects.toThrow(ConflictException);
  });

  it('create rejeita veículo inexistente (P2003)', async () => {
    prismaMock.technician.create.mockRejectedValue({ code: 'P2003' });
    await expect(makeService().create({ ...dto, vehicleId: 'ghost' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('findOne lança 404 para id inexistente', async () => {
    prismaMock.technician.findUnique.mockResolvedValue(null);
    await expect(makeService().findOne('nope')).rejects.toThrow(NotFoundException);
  });
});
