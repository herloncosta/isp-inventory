import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { TechniciansModule } from './modules/technicians/technicians.module.js';
import { SuppliersModule } from './modules/suppliers/suppliers.module.js';
import { StockModule } from './modules/stock/stock.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProductsModule,
    TechniciansModule,
    SuppliersModule,
    StockModule,
    DashboardModule,
  ],
})
export class AppModule {}
