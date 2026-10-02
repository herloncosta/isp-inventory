import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './modules/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { VehiclesModule } from './modules/vehicles/vehicles.module.js';
import { LocationsModule } from './modules/locations/locations.module.js';
import { EntriesModule } from './modules/entries/entries.module.js';
import { MovementsModule } from './modules/movements/movements.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { TechniciansModule } from './modules/technicians/technicians.module.js';
import { SuppliersModule } from './modules/suppliers/suppliers.module.js';
import { StockModule } from './modules/stock/stock.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';

@Module({
  imports: [
    // ponytail: contador por IP em memória — zera no restart e não é compartilhado
    // entre instâncias; se um dia rodar em N réplicas, trocar por ThrottlerStorage
    // em Redis.
    ThrottlerModule.forRoot({ throttlers: [{ name: 'default', ttl: 60_000, limit: 300 }] }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    LocationsModule,
    EntriesModule,
    MovementsModule,
    ProductsModule,
    TechniciansModule,
    SuppliersModule,
    StockModule,
    DashboardModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
