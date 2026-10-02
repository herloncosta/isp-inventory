import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async getBalances(locationId?: string) {
    return this.prisma.stockBalance.findMany({
      where: locationId ? { locationId } : undefined,
      include: { product: true, location: true },
    });
  }

  async getMyBalances(userId: string) {
    const tech = await this.prisma.technician.findUnique({
      where: { userId },
      include: { vehicle: { include: { location: true } } },
    });
    const locationId = tech?.vehicle?.location?.id;
    if (!locationId) throw new NotFoundException('Técnico sem veículo ou local vinculado');
    return this.getBalances(locationId);
  }

  async getMovements(filters?: {
    locationId?: string;
    productId?: string;
    osNumber?: string;
    type?: string;
    from?: string;
    to?: string;
  }) {
    return this.prisma.stockMovement.findMany({
      where: {
        ...(filters?.locationId && {
          OR: [{ sourceLocationId: filters.locationId }, { targetLocationId: filters.locationId }],
        }),
        ...(filters?.productId && { productId: filters.productId }),
        ...(filters?.osNumber && { osNumber: filters.osNumber }),
        ...(filters?.type && { type: filters.type }),
        ...((filters?.from || filters?.to) && {
          createdAt: {
            ...(filters.from && { gte: new Date(filters.from) }),
            ...(filters.to && { lte: new Date(filters.to) }),
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { product: true },
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
}
