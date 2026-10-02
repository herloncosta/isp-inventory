import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  getSummary(@CurrentUser() viewer: { sub: string; role: string }) {
    return this.dashboardService.getSummary(viewer);
  }
}
