import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { VehiclesModule } from './modules/vehicles/vehicles.module.js';
import { LocationsModule } from './modules/locations/locations.module.js';
import { EntriesModule } from './modules/entries/entries.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { TechniciansModule } from './modules/technicians/technicians.module.js';
import { SuppliersModule } from './modules/suppliers/suppliers.module.js';
import { StockModule } from './modules/stock/stock.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    LocationsModule,
    EntriesModule,
    ProductsModule,
    TechniciansModule,
    SuppliersModule,
    StockModule,
    DashboardModule,
  ],
})
export class AppModule {}
