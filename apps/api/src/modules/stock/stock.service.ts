import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@isp/shared';
import { PrismaService } from '../prisma.service.js';

/** Quem está perguntando: o escopo do TECNICO sai daqui, nunca da query string. */
type Viewer = { sub: string; role: string };

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
    const locationId = await this.prisma.technicianLocationId(userId);
    if (!locationId) throw new NotFoundException('Técnico sem veículo ou local vinculado');
    return this.getBalances(locationId);
  }

  async getMovements(
    viewer: Viewer,
    filters?: {
      locationId?: string;
      productId?: string;
      osNumber?: string;
      type?: string;
      from?: string;
      to?: string;
    },
  ) {
    let locationId = filters?.locationId;
    if (viewer.role === Role.TECNICO) {
      const own = await this.prisma.technicianLocationId(viewer.sub);
      // Técnico sem veículo próprio não tem histórico a ver — e, principalmente,
      // não pode cair num filtro sem local e ler o movimento da empresa inteira.
      if (!own) return [];
      locationId = own;
    }

    return this.prisma.stockMovement.findMany({
      where: {
        ...(locationId && {
          OR: [{ sourceLocationId: locationId }, { targetLocationId: locationId }],
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
