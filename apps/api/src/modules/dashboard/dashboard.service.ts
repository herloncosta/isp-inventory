import { Injectable } from '@nestjs/common';
import { Role } from '@isp/shared';
import { PrismaService } from '../prisma.service.js';

type Viewer = { sub: string; role: string };

function emptySummary() {
  return {
    totalProducts: 0,
    totalLocations: 0,
    totalMovements: 0,
    lowStockCount: 0,
    lowStock: [],
    recentMovements: [],
  };
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(viewer: Viewer) {
    if (viewer.role === Role.TECNICO) return this.technicianSummary(viewer.sub);

    const [totalProducts, totalLocations, totalMovements, lowStockItems, recentMovements] =
      await Promise.all([
        this.prisma.product.count(),
        this.prisma.stockLocation.count(),
        this.prisma.stockMovement.count(),
        this.prisma.stockBalance.findMany({
          where: {
            product: { minStock: { gt: 0 } },
          },
          include: { product: true },
        }),
        this.prisma.stockMovement.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { product: true },
        }),
      ]);

    const lowStock = lowStockItems.filter((b) => b.quantity <= b.product.minStock);

    return {
      totalProducts,
      totalLocations,
      totalMovements,
      lowStockCount: lowStock.length,
      lowStock,
      recentMovements,
    };
  }

  /**
   * Técnico enxerga o próprio veículo, não a empresa: sem este recorte um
   * login de campo devolvia totais, alertas e últimas movimentações de todos
   * os locais (RF-002).
   */
  private async technicianSummary(userId: string) {
    const locationId = await this.prisma.technicianLocationId(userId);
    if (!locationId) return emptySummary();

    const scope = { OR: [{ sourceLocationId: locationId }, { targetLocationId: locationId }] };
    const [balances, totalMovements, recentMovements] = await Promise.all([
      this.prisma.stockBalance.findMany({
        where: { locationId },
        include: { product: true },
      }),
      this.prisma.stockMovement.count({ where: scope }),
      this.prisma.stockMovement.findMany({
        where: scope,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { product: true },
      }),
    ]);

    const lowStock = balances.filter(
      (b) => b.product.minStock > 0 && b.quantity <= b.product.minStock,
    );

    return {
      totalProducts: new Set(balances.map((b) => b.productId)).size,
      totalLocations: 1,
      totalMovements,
      lowStockCount: lowStock.length,
      lowStock,
      recentMovements,
    };
  }
}
