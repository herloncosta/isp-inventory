import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto, UpdateProductDto } from './dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '@isp/shared';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  create(@Body() data: CreateProductDto) {
    return this.productsService.create(data);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateProductDto) {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
