import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async getBalances(locationId?: string) {
    return this.prisma.stockBalance.findMany({
      where: locationId ? { locationId } : undefined,
      include: { product: true },
    });
  }

  async getMovements(filters?: { locationId?: string; productId?: string; osNumber?: string }) {
    return this.prisma.stockMovement.findMany({
      where: {
        ...(filters?.locationId && {
          OR: [{ sourceLocationId: filters.locationId }, { targetLocationId: filters.locationId }],
        }),
        ...(filters?.productId && { productId: filters.productId }),
        ...(filters?.osNumber && { osNumber: filters.osNumber }),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getSerialItems(filters?: { locationId?: string; status?: string; productId?: string }) {
    return this.prisma.serialItem.findMany({
      where: {
        ...(filters?.locationId && { currentLocationId: filters.locationId }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.productId && { productId: filters.productId }),
      },
      include: { product: true },
    });
  }

  async createMovement(data: {
    sourceLocationId?: string;
    targetLocationId?: string;
    productId: string;
    quantity: number;
    osNumber?: string;
    type: string;
    createdBy: string;
  }) {
    if (data.quantity <= 0) throw new BadRequestException('Quantidade deve ser positiva');

    return this.prisma.$transaction(async (tx) => {
      if (data.sourceLocationId) {
        const balance = await tx.stockBalance.findUnique({
          where: {
            locationId_productId: {
              locationId: data.sourceLocationId,
              productId: data.productId,
            },
          },
        });
        if (!balance || balance.quantity < data.quantity) {
          throw new BadRequestException('Saldo insuficiente no local de origem');
        }
        await tx.stockBalance.update({
          where: { id: balance.id },
          data: { quantity: { decrement: data.quantity } },
        });
      }

      if (data.targetLocationId) {
        await tx.stockBalance.upsert({
          where: {
            locationId_productId: {
              locationId: data.targetLocationId,
              productId: data.productId,
            },
          },
          update: { quantity: { increment: data.quantity } },
          create: {
            locationId: data.targetLocationId,
            productId: data.productId,
            quantity: data.quantity,
          },
        });
      }

      return tx.stockMovement.create({ data });
    });
  }

  async createSerialItem(data: {
    productId: string;
    serialNumber: string;
    macAddress?: string;
    currentLocationId: string;
  }) {
    const existing = await this.prisma.serialItem.findFirst({
      where: {
        OR: [
          { serialNumber: data.serialNumber },
          ...(data.macAddress ? [{ macAddress: data.macAddress }] : []),
        ],
      },
    });
    if (existing) throw new BadRequestException('Serial ou MAC já cadastrado');

    return this.prisma.serialItem.create({ data });
  }
}
