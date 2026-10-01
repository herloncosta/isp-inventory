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

describe('AuthController (cookies httpOnly)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('login grava refresh em cookie httpOnly e omite do corpo', async () => {
    serviceMock.login.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      user: { id: 'u1' },
    });
    const res = mockRes();
    const body = await makeController().login({ email: 'a@isp.com', password: 'secret123' }, res);

    expect(res.cookie).toHaveBeenCalledWith(
      'isp_refresh_token',
      'r',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(body).toEqual({ accessToken: 'a', user: { id: 'u1' } });
    expect(body).not.toHaveProperty('refreshToken');
  });

  it('refresh sem cookie rejeita com 401', async () => {
    await expect(makeController().refresh({ cookies: {} } as any, mockRes())).rejects.toThrow(
      UnauthorizedException,
    );
    expect(serviceMock.refresh).not.toHaveBeenCalled();
  });

  it('refresh rotaciona o cookie', async () => {
    serviceMock.refresh.mockResolvedValue({ accessToken: 'a2', refreshToken: 'r2', user: {} });
    const res = mockRes();
    await makeController().refresh({ cookies: { isp_refresh_token: 'r1' } } as any, res);
    expect(serviceMock.refresh).toHaveBeenCalledWith('r1');
    expect(res.cookie).toHaveBeenCalledWith(
      'isp_refresh_token',
      'r2',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('logout revoga e limpa o cookie', async () => {
    const res = mockRes();
    await makeController().logout(
      'access-jti',
      { cookies: { isp_refresh_token: 'r' } } as any,
      res,
    );
    expect(serviceMock.logout).toHaveBeenCalledWith('access-jti', 'r');
    expect(res.clearCookie).toHaveBeenCalledWith('isp_refresh_token', { path: '/' });
  });
});
