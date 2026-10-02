import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { VehiclesService } from './vehicles.service.js';
import { CreateVehicleDto, UpdateVehicleDto } from './dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '@isp/shared';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  create(@Body() data: CreateVehicleDto) {
    return this.vehiclesService.create(data);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateVehicleDto) {
    return this.vehiclesService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.remove(id);
  }
}
