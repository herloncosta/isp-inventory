import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';

const jwtMock = { verifyAsync: vi.fn() };
const prismaMock = { revokedToken: { findUnique: vi.fn() } };

function guard() {
  return new JwtAuthGuard(jwtMock as any, prismaMock as any);
}

function contextWith(headers: Record<string, string | undefined>) {
  const request: any = { headers };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getRequest: () => request,
  } as any;
}

describe('JwtAuthGuard (RF-001)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.revokedToken.findUnique.mockResolvedValue(null);
  });

  it('rejeita requisição sem token', async () => {
    await expect(guard().canActivate(contextWith({}))).rejects.toThrow(UnauthorizedException);
  });

  it('rejeita token inválido', async () => {
    jwtMock.verifyAsync.mockRejectedValue(new Error('bad token'));
    await expect(
      guard().canActivate(contextWith({ authorization: 'Bearer invalido' })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('anexa usuário e libera com access token válido', async () => {
    const user = { sub: 'u1', role: 'ADMIN', typ: 'access', jti: 'j1' };
    jwtMock.verifyAsync.mockResolvedValue(user);
    const ctx = contextWith({ authorization: 'Bearer valido' });
    await expect(guard().canActivate(ctx)).resolves.toBe(true);
    expect(ctx.getRequest().user).toEqual(user);
  });

  it('rejeita refresh token como credencial de acesso', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'refresh', jti: 'j2' });
    await expect(guard().canActivate(contextWith({ authorization: 'Bearer r' }))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejeita sessão revogada (logout)', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'access', jti: 'revoked' });
    prismaMock.revokedToken.findUnique.mockResolvedValue({ jti: 'revoked' });
    await expect(guard().canActivate(contextWith({ authorization: 'Bearer old' }))).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
