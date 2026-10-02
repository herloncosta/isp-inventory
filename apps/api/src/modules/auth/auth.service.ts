import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service.js';

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * Hash de um valor descartável, no mesmo custo (10) dos hashes reais. Comparado
 * contra ele quando o e-mail não existe, para que a resposta do login não diga,
 * pelo tempo, se a conta existe.
 */
const DUMMY_HASH = '$2b$10$p7TjZnfQDOgKSJNymoC80eMoTpGoF5EXsiRA5xpWeD3gqkW39ZYEm';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
  jti: string;
  typ: 'access' | 'refresh';
  /** Versão do usuário quando o token nasceu; divergiu, a sessão já morreu. */
  tv: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // O compare roda sempre, mesmo sem usuário na base: um e-mail inexistente
    // respondendo mais rápido que uma senha errada deixava quem atacava
    // descobrir contas medindo o tempo da resposta.
    const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !passwordOk) {
      this.warnDenied(email, user ? 'senha incorreta' : 'conta inexistente');
      throw new UnauthorizedException('Credenciais inválidas');
    }
    // Conta desativada não entra: a senha pode estar certa e o acesso negado.
    if (!user.active) {
      this.warnDenied(email, 'conta desativada');
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
    // Refresh antigo depois de trocar senha ou cargo não pode virar sessão nova.
    if (payload.tv !== user.tokenVersion) throw new UnauthorizedException('Sessão expirada');
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

  private async issuePair(user: {
    id: string;
    email: string;
    role: string;
    name: string;
    tokenVersion: number;
  }) {
    const base = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tv: user.tokenVersion,
    };
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

  /**
   * Tentativa negada é a trilha que sobra quando alguém tenta enumerar contas
   * ou reutilizar vazamento. O e-mail vem do corpo da requisição, então as
   * quebras de linha saem: sem isso, um e-mail com `\n` forjaria uma linha.
   */
  private warnDenied(email: string, motivo: string) {
    this.logger.warn(`login negado: ${email.replace(/[\r\n]+/g, ' ')} (${motivo})`);
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
