import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { throwPrismaError } from '../../common/prisma-errors.js';
import { CreateSupplierDto, UpdateSupplierDto } from './dto.js';

const MESSAGES = { duplicate: 'CNPJ já cadastrado', reference: 'Referência inexistente' };

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.supplier.findMany({ orderBy: { razaoSocial: 'asc' } });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Fornecedor não encontrado');
    return supplier;
  }

  async create(data: CreateSupplierDto) {
    try {
      return await this.prisma.supplier.create({ data });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async update(id: string, data: UpdateSupplierDto) {
    await this.findOne(id);
    try {
      return await this.prisma.supplier.update({ where: { id }, data });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.supplier.delete({ where: { id } });
  }
}
