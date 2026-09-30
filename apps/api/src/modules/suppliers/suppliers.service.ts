import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

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

  create(data: any) {
    return this.prisma.supplier.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.supplier.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.supplier.delete({ where: { id } });
  }
}
