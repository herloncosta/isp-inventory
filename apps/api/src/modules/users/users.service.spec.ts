import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@isp/shared';
import { UsersService } from './users.service.js';

const prismaMock = { user: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() } };

function makeService() {
  return new UsersService(prismaMock as any);
}

describe('UsersService (RF-002)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('create persiste hash (nunca a senha pura) e retorna campos seguros', async () => {
    prismaMock.user.create.mockImplementation(({ data, select }: any) =>
      Promise.resolve({ id: 'u1', name: data.name, email: data.email, role: data.role }),
    );

    const result = await makeService().create({
      name: 'Estoquista',
      email: 'est@isp.com',
      password: 'secret123',
      role: Role.ESTOQUISTA,
    });

    const storedHash = prismaMock.user.create.mock.calls[0][0].data.passwordHash;
    expect(storedHash).not.toBe('secret123');
    expect(await bcrypt.compare('secret123', storedHash)).toBe(true);
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('create rejeita e-mail duplicado (P2002)', async () => {
    prismaMock.user.create.mockRejectedValue({ code: 'P2002' });
    await expect(
      makeService().create({
        name: 'X',
        email: 'dup@isp.com',
        password: 'secret123',
        role: Role.TECNICO,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('findOne lança 404 para id inexistente', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(makeService().findOne('nope')).rejects.toThrow(NotFoundException);
  });
});
