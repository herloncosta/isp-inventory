import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { TechniciansService } from './technicians.service.js';
import { CreateTechnicianDto, UpdateTechnicianDto } from './dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '@isp/shared';

@Controller('technicians')
export class TechniciansController {
  constructor(private techniciansService: TechniciansService) {}

  @Get()
  findAll() {
    return this.techniciansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciansService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  create(@Body() data: CreateTechnicianDto) {
    return this.techniciansService.create(data);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateTechnicianDto) {
    return this.techniciansService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciansService.remove(id);
  }
}
