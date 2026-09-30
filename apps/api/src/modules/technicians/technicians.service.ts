import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class TechniciansService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.technician.findMany({ include: { vehicle: true } });
  }

  async findOne(id: string) {
    const tech = await this.prisma.technician.findUnique({ where: { id }, include: { vehicle: true } });
    if (!tech) throw new NotFoundException('Técnico não encontrado');
    return tech;
  }

  create(data: any) {
    return this.prisma.technician.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.technician.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.technician.delete({ where: { id } });
  }
}
