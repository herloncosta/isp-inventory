import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { SuppliersService } from './suppliers.service.js';
import { CreateSupplierDto, UpdateSupplierDto } from './dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '@isp/shared';

@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  create(@Body() data: CreateSupplierDto) {
    return this.suppliersService.create(data);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateSupplierDto) {
    return this.suppliersService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.remove(id);
  }
}
