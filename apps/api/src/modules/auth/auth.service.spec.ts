import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';

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
};

describe('AuthService.login (RF-001)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
    expect(result.user).toEqual(storedUser);
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
});

describe('AuthService.refresh (rotação)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('revoga o refresh usado e emite novo par', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'refresh', jti: 'old-jti' });
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

  it('rejeita refresh já utilizado (revogado)', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'refresh', jti: 'used-jti' });
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
