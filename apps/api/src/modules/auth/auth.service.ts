import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service.js';

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
  jti: string;
  typ: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    // Conta desativada não entra: a senha pode estar certa e o acesso negado.
    if (!user.active) {
      throw new UnauthorizedException('Usuário desativado. Fale com o administrador.');
    }
    const tokens = await this.issuePair(user);
    return {
      ...tokens,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyToken(refreshToken, 'refresh');
    await this.revoke(payload.jti, REFRESH_TTL_SECONDS);
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    // Sem isto, a aba de um usuário desativado ficaria renovando token em laço.
    if (!user.active) {
      throw new UnauthorizedException('Usuário desativado. Fale com o administrador.');
    }
    const tokens = await this.issuePair(user);
    return {
      ...tokens,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async logout(accessJti: string, refreshToken?: string) {
    await this.revoke(accessJti, ACCESS_TTL_SECONDS);
    if (refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken);
        if (payload.typ === 'refresh') await this.revoke(payload.jti, REFRESH_TTL_SECONDS);
      } catch {
        return;
      }
    }
  }

  private async issuePair(user: { id: string; email: string; role: string; name: string }) {
    const base = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...base, jti: randomUUID(), typ: 'access' },
        { expiresIn: ACCESS_TTL_SECONDS },
      ),
      this.jwtService.signAsync(
        { ...base, jti: randomUUID(), typ: 'refresh' },
        { expiresIn: REFRESH_TTL_SECONDS },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async verifyToken(token: string, typ: 'access' | 'refresh'): Promise<TokenPayload> {
    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
    if (payload.typ !== typ) throw new UnauthorizedException('Tipo de token inválido');
    const revoked = await this.prisma.revokedToken.findUnique({ where: { jti: payload.jti } });
    if (revoked) throw new UnauthorizedException('Token revogado');
    return payload;
  }

  private async revoke(jti: string, ttlSeconds: number) {
    await this.prisma.revokedToken.upsert({
      where: { jti },
      update: {},
      create: { jti, expiresAt: new Date(Date.now() + ttlSeconds * 1000) },
    });
    await this.prisma.revokedToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  }
}
