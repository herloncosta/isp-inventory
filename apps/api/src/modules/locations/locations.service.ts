import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { throwPrismaError } from '../../common/prisma-errors.js';
import { CreateLocationDto, UpdateLocationDto } from './dto.js';

const MESSAGES = { duplicate: 'Local já cadastrado', reference: 'Veículo não encontrado' };

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.stockLocation.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const location = await this.prisma.stockLocation.findUnique({ where: { id } });
    if (!location) throw new NotFoundException('Local de estoque não encontrado');
    return location;
  }

  async create(data: CreateLocationDto) {
    try {
      return await this.prisma.stockLocation.create({ data });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async update(id: string, data: UpdateLocationDto) {
    await this.findOne(id);
    try {
      return await this.prisma.stockLocation.update({ where: { id }, data });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.stockLocation.delete({ where: { id } });
  }
}
