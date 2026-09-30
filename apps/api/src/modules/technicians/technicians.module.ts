import { Module } from '@nestjs/common';
import { TechniciansController } from './technicians.controller.js';
import { TechniciansService } from './technicians.service.js';

@Module({
  controllers: [TechniciansController],
  providers: [TechniciansService],
})
export class TechniciansModule {}
