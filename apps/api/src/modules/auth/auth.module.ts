import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { requireJwtSecret } from './auth.constants.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: requireJwtSecret(),
      // Prazo padrão curto: um sign esquecendo expiresIn vira access de 15min,
      // não um refresh de 7 dias.
      signOptions: { expiresIn: 15 * 60 },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
