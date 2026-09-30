import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '@isp/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
  constructor(private stockService: StockService) {}

  @Get('balances')
  getBalances(@Query('locationId') locationId?: string) {
    return this.stockService.getBalances(locationId);
  }

  @Get('movements')
  getMovements(
    @Query('locationId') locationId?: string,
    @Query('productId') productId?: string,
    @Query('osNumber') osNumber?: string,
  ) {
    return this.stockService.getMovements({ locationId, productId, osNumber });
  }

  @Get('serials')
  getSerials(
    @Query('locationId') locationId?: string,
    @Query('status') status?: string,
    @Query('productId') productId?: string,
  ) {
    return this.stockService.getSerialItems({ locationId, status, productId });
  }

  @Post('movements')
  @Roles(Role.ADMIN, Role.ESTOQUISTA, Role.TECNICO)
  createMovement(@Body() data: any, @CurrentUser('sub') userId: string) {
    return this.stockService.createMovement({ ...data, createdBy: userId });
  }

  @Post('serials')
  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  createSerial(@Body() data: any) {
    return this.stockService.createSerialItem(data);
  }
}
