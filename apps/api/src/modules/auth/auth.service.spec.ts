import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';

// `vi.spyOn` não pega em import ESM: o mock embrulha o compare real e registra
// as chamadas num array comum, que `vi.resetAllMocks` não zera.
const { compareCalls } = vi.hoisted(() => ({ compareCalls: [] as string[] }));

vi.mock('bcryptjs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('bcryptjs')>();
  return {
    ...actual,
    compare: (password: string, hash: string) => {
      compareCalls.push(hash);
      return actual.compare(password, hash);
    },
  };
});

const prismaMock = {
  user: { findUnique: vi.fn() },
  revokedToken: { findUnique: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
};
const jwtMock = { signAsync: vi.fn(), verifyAsync: vi.fn() };

function makeService() {
  return new AuthService(prismaMock as any, jwtMock as any);
}

const storedUser = {
  id: 'u1',
  name: 'Admin',
  email: 'admin@isp.com',
  role: 'ADMIN',
  active: true,
  tokenVersion: 0,
};

describe('AuthService.login (RF-001)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    compareCalls.length = 0;
  });

  it('recusa login de usuário desativado, mesmo com a senha certa', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'tec@isp.com',
      name: 'Técnico',
      role: 'TECNICO',
      passwordHash: await bcrypt.hash('admin123', 10),
      active: false,
    });

    await expect(makeService().login('tec@isp.com', 'admin123')).rejects.toThrow(/desativado/i);
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
  });

  it('refresh de conta desativada não emite token novo', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'refresh', jti: 'j1', tv: 0 });
    prismaMock.revokedToken.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue({ ...storedUser, active: false });

    await expect(makeService().refresh('refresh-valido')).rejects.toThrow(/desativado/i);
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
  });

  it('retorna par de tokens e usuário com credenciais válidas', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...storedUser,
      passwordHash: await bcrypt.hash('secret123', 4),
    });
    jwtMock.signAsync.mockResolvedValueOnce('access').mockResolvedValueOnce('refresh');

    const result = await makeService().login('admin@isp.com', 'secret123');

    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
    // a resposta traz só campos seguros: `active` e `passwordHash` ficam de fora
    expect(result.user).toEqual({
      id: 'u1',
      name: 'Admin',
      email: 'admin@isp.com',
      role: 'ADMIN',
    });
  });

  it('rejeita e-mail desconhecido', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(makeService().login('x@isp.com', 'secret123')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejeita senha incorreta', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...storedUser,
      passwordHash: await bcrypt.hash('correta', 4),
    });
    await expect(makeService().login('admin@isp.com', 'errada')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('e-mail inexistente também roda o compare, para não vazar por timing', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(makeService().login('nao-existe@isp.com', 'qualquer')).rejects.toThrow(
      UnauthorizedException,
    );

    // roda o mesmo compare, contra um hash bcrypt do mesmo custo (10)
    expect(compareCalls).toHaveLength(1);
    expect(compareCalls[0]).toMatch(/^\$2b\$10\$/);
  });

  it('tentativa negada vira log de warn, sem deixar quebrar linha pelo e-mail', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const warn = vi.spyOn(Logger.prototype, 'warn');

    await expect(
      makeService().login('fulano@isp.com\nfalso-log: admin@isp.com', 'x'),
    ).rejects.toThrow(UnauthorizedException);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('fulano@isp.com falso-log:'));
    expect(warn.mock.calls[0][0]).not.toContain('\n');
    warn.mockRestore();
  });
});

describe('AuthService.refresh (rotação)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('revoga o refresh usado e emite novo par', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'refresh', jti: 'old-jti', tv: 0 });
    prismaMock.revokedToken.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue({
      ...storedUser,
      passwordHash: 'irrelevante',
    });
    jwtMock.signAsync.mockResolvedValueOnce('access2').mockResolvedValueOnce('refresh2');

    const result = await makeService().refresh('old-refresh');

    expect(prismaMock.revokedToken.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { jti: 'old-jti' } }),
    );
    expect(result.accessToken).toBe('access2');
    expect(result.refreshToken).toBe('refresh2');
  });

  it('rejeita refresh emitido antes da troca de senha ou cargo', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'refresh', jti: 'old-jti', tv: 0 });
    prismaMock.revokedToken.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue({ ...storedUser, tokenVersion: 1 });

    await expect(makeService().refresh('old-refresh')).rejects.toThrow(/Sessão expirada/);
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
  });

  it('rejeita refresh já utilizado (revogado)', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'refresh', jti: 'used-jti', tv: 0 });
    prismaMock.revokedToken.findUnique.mockResolvedValue({ jti: 'used-jti' });
    await expect(makeService().refresh('used-refresh')).rejects.toThrow(UnauthorizedException);
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
  });

  it('rejeita access token na rota de refresh', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'access', jti: 'a-jti' });
    await expect(makeService().refresh('access-token')).rejects.toThrow(UnauthorizedException);
  });
});

describe('AuthService.logout (revogação)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('revoga sessão e refresh', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ typ: 'refresh', jti: 'r-jti' });
    await makeService().logout('access-jti', 'refresh-token');
    const jtis = prismaMock.revokedToken.upsert.mock.calls.map((c: any) => c[0].where.jti);
    expect(jtis).toContain('access-jti');
    expect(jtis).toContain('r-jti');
  });
});
