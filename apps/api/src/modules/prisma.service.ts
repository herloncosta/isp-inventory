import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Local do veículo onde o técnico trabalha. É a chave de todo escopo do
   * perfil TECNICO: quem não tem vínculo não enxerga estoque nenhum.
   */
  async technicianLocationId(userId: string): Promise<string | null> {
    const technician = await this.technician.findUnique({
      where: { userId },
      include: { vehicle: { include: { location: true } } },
    });
    return technician?.vehicle?.location?.id ?? null;
  }
}
