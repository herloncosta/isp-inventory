import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { throwPrismaError } from '../../common/prisma-errors.js';
import { CreateProductDto, UpdateProductDto } from './dto.js';

const MESSAGES = { duplicate: 'SKU já cadastrado', reference: 'Referência inexistente' };

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async create(data: CreateProductDto) {
    try {
      return await this.prisma.product.create({ data });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async update(id: string, data: UpdateProductDto) {
    await this.findOne(id);
    try {
      return await this.prisma.product.update({ where: { id }, data });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
