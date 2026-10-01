import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { throwPrismaError } from '../../common/prisma-errors.js';
import { CreateVehicleDto, UpdateVehicleDto } from './dto.js';

const MESSAGES = { duplicate: 'Placa já cadastrada', reference: 'Referência inexistente' };

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.vehicle.findMany({ orderBy: { plate: 'asc' } });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    return vehicle;
  }

  async create(data: CreateVehicleDto) {
    try {
      return await this.prisma.vehicle.create({ data });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async update(id: string, data: UpdateVehicleDto) {
    await this.findOne(id);
    try {
      return await this.prisma.vehicle.update({ where: { id }, data });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
