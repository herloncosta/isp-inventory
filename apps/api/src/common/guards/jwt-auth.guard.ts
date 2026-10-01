import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../modules/prisma.service.js';
import { ACCESS_COOKIE } from '../../modules/auth/auth.constants.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Token não fornecido');
    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (payload.typ !== 'access') throw new UnauthorizedException('Tipo de token inválido');
      const revoked = await this.prisma.revokedToken.findUnique({ where: { jti: payload.jti } });
      if (revoked) throw new UnauthorizedException('Token revogado');
      request.user = payload;
      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Token inválido');
    }
  }

  /** cookie httpOnly primeiro (SPA); header Bearer continua válido para CLI e testes. */
  private extractToken(request: any): string | null {
    const fromCookie = request.cookies?.[ACCESS_COOKIE];
    if (fromCookie) return fromCookie;
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
