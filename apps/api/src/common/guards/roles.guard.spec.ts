import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '@isp/shared';
import { RolesGuard } from './roles.guard.js';

const reflectorMock = { getAllAndOverride: vi.fn() };

function contextWith(user: any) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as any;
}

describe('RolesGuard (RF-002)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  function guard() {
    return new RolesGuard(reflectorMock as any);
  }

  it('libera quando a rota não exige perfil', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);
    expect(guard().canActivate(contextWith(null))).toBe(true);
  });

  it('libera quando o perfil do usuário está entre os exigidos', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.ESTOQUISTA]);
    expect(guard().canActivate(contextWith({ role: Role.ESTOQUISTA }))).toBe(true);
  });

  it('nega com 403 quando o perfil não é permitido', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    expect(() => guard().canActivate(contextWith({ role: Role.TECNICO }))).toThrow(
      ForbiddenException,
    );
  });

  it('nega com 403 quando não há usuário autenticado', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    expect(() => guard().canActivate(contextWith(null))).toThrow(ForbiddenException);
  });
});
