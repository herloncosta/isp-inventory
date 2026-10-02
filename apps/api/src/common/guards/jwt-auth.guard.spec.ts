import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';

const jwtMock = { verifyAsync: vi.fn() };
const reflectorMock = { getAllAndOverride: vi.fn() };
const prismaMock = {
  revokedToken: { findUnique: vi.fn() },
  user: { findUnique: vi.fn() },
};

function guard() {
  return new JwtAuthGuard(reflectorMock as any, jwtMock as any, prismaMock as any);
}

function contextWith(
  headers: Record<string, string | undefined>,
  cookies: Record<string, string> = {},
) {
  const request: any = { headers, cookies };
  return {
    getHandler: () => () => {},
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
    getRequest: () => request,
  } as any;
}

describe('JwtAuthGuard (RF-001)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    prismaMock.revokedToken.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue({ active: true });
  });

  it('libera rota marcada como pública sem nem olhar o token', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(true);
    await expect(guard().canActivate(contextWith({}))).resolves.toBe(true);
    expect(jwtMock.verifyAsync).not.toHaveBeenCalled();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
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

  it('rejeita usuário desativado, mesmo com token válido e não revogado', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'access', jti: 'j12' });
    prismaMock.user.findUnique.mockResolvedValue({ active: false });
    await expect(
      guard().canActivate(contextWith({}, { isp_access_token: 'valido' })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejeita usuário que não existe mais', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'access', jti: 'j13' });
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(
      guard().canActivate(contextWith({ authorization: 'Bearer valido' })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejeita sessão revogada (logout)', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'access', jti: 'revoked' });
    prismaMock.revokedToken.findUnique.mockResolvedValue({ jti: 'revoked' });
    await expect(guard().canActivate(contextWith({ authorization: 'Bearer old' }))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('libera pelo access cookie — a SPA não manda header', async () => {
    const user = { sub: 'u1', role: 'TECNICO', typ: 'access', jti: 'j9' };
    jwtMock.verifyAsync.mockResolvedValue(user);
    const ctx = contextWith({}, { isp_access_token: 'do-cookie' });
    await expect(guard().canActivate(ctx)).resolves.toBe(true);
    expect(jwtMock.verifyAsync).toHaveBeenCalledWith('do-cookie');
    expect(ctx.getRequest().user).toEqual(user);
  });

  it('o cookie tem precedência sobre o header', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'access', jti: 'j10' });
    await guard().canActivate(
      contextWith({ authorization: 'Bearer do-header' }, { isp_access_token: 'do-cookie' }),
    );
    expect(jwtMock.verifyAsync).toHaveBeenCalledWith('do-cookie');
  });

  it('rejeita refresh token vindo do cookie de access', async () => {
    jwtMock.verifyAsync.mockResolvedValue({ sub: 'u1', typ: 'refresh', jti: 'j11' });
    await expect(
      guard().canActivate(contextWith({}, { isp_access_token: 'refresh-embutido' })),
    ).rejects.toThrow(UnauthorizedException);
  });
});
