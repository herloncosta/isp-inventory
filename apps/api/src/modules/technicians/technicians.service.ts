import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { throwPrismaError } from '../../common/prisma-errors.js';
import { CreateTechnicianDto, UpdateTechnicianDto } from './dto.js';

const MESSAGES = {
  duplicate: 'Técnico já vinculado a este usuário',
  reference: 'Veículo não encontrado',
};

@Injectable()
export class TechniciansService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.technician.findMany({ include: { vehicle: true } });
  }

  async findOne(id: string) {
    const tech = await this.prisma.technician.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!tech) throw new NotFoundException('Técnico não encontrado');
    return tech;
  }

  async create(data: CreateTechnicianDto) {
    try {
      return await this.prisma.technician.create({ data });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async update(id: string, data: UpdateTechnicianDto) {
    await this.findOne(id);
    try {
      return await this.prisma.technician.update({ where: { id }, data });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.technician.delete({ where: { id } });
  }
}
