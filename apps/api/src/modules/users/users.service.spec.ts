import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@isp/shared';
import { UsersService } from './users.service.js';

const prismaMock = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
};

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

  it('a listagem devolve active e deactivatedAt, para a tela mostrar o estado', async () => {
    await makeService().findAll();
    expect(prismaMock.user.findMany.mock.calls[0][0].select).toMatchObject({
      active: true,
      deactivatedAt: true,
    });
  });
});

describe('UsersService.update (editar sem perder o resto)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.user.update.mockResolvedValue({ id: 'u1' });
  });

  it('não envia passwordHash quando a senha não vem preenchida', async () => {
    await makeService().update('u1', { name: 'Novo nome' });

    const data = prismaMock.user.update.mock.calls[0][0].data;
    expect(data).toEqual({ name: 'Novo nome' });
    expect(data).not.toHaveProperty('passwordHash');
  });

  it('troca o hash quando a senha vem preenchida', async () => {
    await makeService().update('u1', { password: 'novaSenha1' });

    const data = prismaMock.user.update.mock.calls[0][0].data;
    expect(data.passwordHash).not.toBe('novaSenha1');
    expect(await bcrypt.compare('novaSenha1', data.passwordHash)).toBe(true);
  });

  it('update em id inexistente lança 404', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(makeService().update('nope', { name: 'X' })).rejects.toThrow(NotFoundException);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('update rejeita e-mail duplicado (P2002)', async () => {
    prismaMock.user.update.mockRejectedValue({ code: 'P2002' });
    await expect(makeService().update('u1', { email: 'dup@isp.com' })).rejects.toThrow(
      ConflictException,
    );
  });
});

describe('UsersService.setStatus (desativar, nunca excluir)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', role: 'TECNICO', active: true });
    prismaMock.user.update.mockResolvedValue({ id: 'u1', active: false });
  });

  it('desativa carimbando deactivatedAt e sem apagar a linha', async () => {
    await makeService().setStatus('u1', false, 'admin-1');

    const args = prismaMock.user.update.mock.calls[0][0];
    expect(args.data.active).toBe(false);
    expect(args.data.deactivatedAt).toBeInstanceOf(Date);
    // desativar é update, nunca delete
    expect(prismaMock.user.update).toHaveBeenCalled();
    expect((prismaMock.user as any).delete).toBeUndefined();
  });

  it('reativar limpa deactivatedAt', async () => {
    await makeService().setStatus('u1', true, 'admin-1');
    expect(prismaMock.user.update.mock.calls[0][0].data).toMatchObject({
      active: true,
      deactivatedAt: null,
    });
  });

  it('recusa desativar a própria conta', async () => {
    await expect(makeService().setStatus('u1', false, 'u1')).rejects.toThrow(BadRequestException);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('recusa desativar o único administrador ativo', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', role: 'ADMIN', active: true });
    prismaMock.user.count.mockResolvedValue(0);

    await expect(makeService().setStatus('u1', false, 'outro')).rejects.toThrow(
      BadRequestException,
    );
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('libera desativar administrador quando existe outro ativo', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', role: 'ADMIN', active: true });
    prismaMock.user.count.mockResolvedValue(1);

    await expect(makeService().setStatus('u1', false, 'outro')).resolves.toBeDefined();
  });

  it('setStatus em id inexistente lança 404', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(makeService().setStatus('nope', false, 'admin-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
