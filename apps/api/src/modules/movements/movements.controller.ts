import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MovementsService } from './movements.service.js';
import { CreateIssueDto, CreateReturnDto, CreateTransferDto } from './dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '@isp/shared';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MovementsController {
  constructor(private movementsService: MovementsService) {}

  @Post('transfers')
  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  transfer(@Body() dto: CreateTransferDto, @CurrentUser('sub') userId: string) {
    return this.movementsService.transfer({ ...dto, createdBy: userId });
  }

  @Post('issues')
  @Roles(Role.ADMIN, Role.ESTOQUISTA, Role.TECNICO)
  issue(@Body() dto: CreateIssueDto, @CurrentUser('sub') userId: string) {
    return this.movementsService.issue({ ...dto, createdBy: userId });
  }

  @Post('returns')
  @Roles(Role.ADMIN, Role.ESTOQUISTA, Role.TECNICO)
  ret(@Body() dto: CreateReturnDto, @CurrentUser('sub') userId: string) {
    return this.movementsService.return({ ...dto, createdBy: userId });
  }
}
