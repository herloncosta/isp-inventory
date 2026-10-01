import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller.js';

const serviceMock = {
  login: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
};

function makeController() {
  return new AuthController(serviceMock as any);
}

function mockRes() {
  return { cookie: vi.fn(), clearCookie: vi.fn() } as any;
}

const cookieFor = (res: any, name: string) => res.cookie.mock.calls.find(([n]) => n === name)?.[2];

describe('AuthController (access e refresh em cookie httpOnly)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('login grava access e refresh em cookie httpOnly e não devolve token no corpo', async () => {
    serviceMock.login.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      user: { id: 'u1', role: 'ADMIN' },
    });
    const res = mockRes();
    const body = await makeController().login({ email: 'a@isp.com', password: 'secret123' }, res);

    expect(res.cookie).toHaveBeenCalledWith(
      'isp_access_token',
      'a',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'isp_refresh_token',
      'r',
      expect.objectContaining({ httpOnly: true }),
    );
    // nenhum token pode ser lido por script: nada de token no corpo
    expect(body).toEqual({ user: { id: 'u1', role: 'ADMIN' } });
    expect(JSON.stringify(body)).not.toContain('a');
  });

  it('o access cookie vive 15min e o refresh 7d, ambos sameSite lax', async () => {
    serviceMock.login.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      user: { id: 'u1' },
    });
    const res = mockRes();
    await makeController().login({ email: 'a@isp.com', password: 'secret123' }, res);

    expect(cookieFor(res, 'isp_access_token')).toMatchObject({
      maxAge: 15 * 60 * 1000,
      sameSite: 'lax',
    });
    expect(cookieFor(res, 'isp_refresh_token')).toMatchObject({
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });
  });

  it('me devolve o usuário autenticado sem tocar em token', () => {
    const body = makeController().me({
      sub: 'u1',
      name: 'Admin',
      email: 'admin@isp.com',
      role: 'ADMIN',
    } as any);

    expect(body).toEqual({
      user: { id: 'u1', name: 'Admin', email: 'admin@isp.com', role: 'ADMIN' },
    });
  });

  it('refresh sem cookie rejeita com 401', async () => {
    await expect(makeController().refresh({ cookies: {} } as any, mockRes())).rejects.toThrow(
      UnauthorizedException,
    );
    expect(serviceMock.refresh).not.toHaveBeenCalled();
  });

  it('refresh rotaciona os dois cookies', async () => {
    serviceMock.refresh.mockResolvedValue({
      accessToken: 'a2',
      refreshToken: 'r2',
      user: { id: 'u1' },
    });
    const res = mockRes();
    const body = await makeController().refresh(
      { cookies: { isp_refresh_token: 'r1' } } as any,
      res,
    );

    expect(serviceMock.refresh).toHaveBeenCalledWith('r1');
    expect(res.cookie).toHaveBeenCalledWith(
      'isp_access_token',
      'a2',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'isp_refresh_token',
      'r2',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(body).toEqual({ user: { id: 'u1' } });
  });

  it('logout revoga e limpa os dois cookies', async () => {
    const res = mockRes();
    await makeController().logout(
      'access-jti',
      { cookies: { isp_refresh_token: 'r' } } as any,
      res,
    );

    expect(serviceMock.logout).toHaveBeenCalledWith('access-jti', 'r');
    expect(res.clearCookie).toHaveBeenCalledWith('isp_access_token', { path: '/' });
    expect(res.clearCookie).toHaveBeenCalledWith('isp_refresh_token', { path: '/' });
  });
});
