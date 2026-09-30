import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
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
}
