import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto.js';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './auth.constants.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Access e refresh viajam nos dois cookies httpOnly: nenhum token é legível por
 * script, e nenhum é devolvido no corpo da resposta. `sameSite: 'lax'` impede
 * que uma página de terceiro site faça um POST autenticado por cookie.
 */
function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
  res.cookie(ACCESS_COOKIE, accessToken, { ...base, maxAge: ACCESS_MAX_AGE_MS });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...base, maxAge: REFRESH_MAX_AGE_MS });
}

function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.login(
      dto.email,
      dto.password,
    );
    setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

  /**
   * Quem está autenticado agora. É o que o boot da SPA chama: enquanto o cookie
   * de access vive, recarregar a página não gira o refresh token.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: { sub: string; name: string; email: string; role: string }) {
    return { user: { id: user.sub, name: user.name, email: user.email, role: user.role } };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) throw new UnauthorizedException('Sessão expirada');
    const {
      accessToken,
      refreshToken: rotated,
      user,
    } = await this.authService.refresh(refreshToken);
    setAuthCookies(res, accessToken, rotated);
    return { user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser('jti') jti: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(jti, req.cookies?.[REFRESH_COOKIE]);
    clearAuthCookies(res);
  }
}
