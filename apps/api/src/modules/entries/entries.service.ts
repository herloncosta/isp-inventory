import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { MovementType, SerialStatus } from '@isp/shared';
import { PrismaService } from '../prisma.service.js';
import { throwPrismaError } from '../../common/prisma-errors.js';
import { CreateEntryDto, CreateFractionalEntryDto, CreateSerialBatchDto } from './dto.js';

const MESSAGES = { duplicate: 'Serial ou MAC já cadastrado', reference: 'Referência inexistente' };

interface EntryInput {
  productId: string;
  locationId: string;
  quantity: number;
  supplierId?: string;
  createdBy: string;
}

@Injectable()
export class EntriesService {
  constructor(private prisma: PrismaService) {}

  async createEntry(input: EntryInput) {
    if (input.quantity <= 0) throw new BadRequestException('Quantidade deve ser positiva');
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.stockBalance.upsert({
          where: {
            locationId_productId: { locationId: input.locationId, productId: input.productId },
          },
          update: { quantity: { increment: input.quantity } },
          create: {
            locationId: input.locationId,
            productId: input.productId,
            quantity: input.quantity,
          },
        });
        return tx.stockMovement.create({
          data: {
            sourceLocationId: null,
            targetLocationId: input.locationId,
            productId: input.productId,
            quantity: input.quantity,
            type: MovementType.ENTRADA,
            supplierId: input.supplierId,
            createdBy: input.createdBy,
          },
        });
      });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async createSerialBatch(dto: CreateSerialBatchDto & { createdBy: string }) {
    const serials = dto.items.map((i) => i.serialNumber);
    const macs = dto.items.map((i) => i.macAddress).filter((m): m is string => !!m);
    const intraDup = serials.length !== new Set(serials).size || macs.length !== new Set(macs).size;
    if (intraDup) throw new ConflictException('Seriais ou MACs duplicados no lote');

    const conflicts = await this.prisma.serialItem.findMany({
      where: {
        OR: [
          { serialNumber: { in: serials } },
          ...(macs.length ? [{ macAddress: { in: macs } }] : []),
        ],
      },
      select: { serialNumber: true, macAddress: true },
    });
    if (conflicts.length > 0) {
      const taken = conflicts.map((c) => c.serialNumber).join(', ');
      throw new ConflictException(`Já cadastrados: ${taken}`);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.serialItem.createMany({
          data: dto.items.map((i) => ({
            productId: dto.productId,
            serialNumber: i.serialNumber,
            macAddress: i.macAddress,
            currentLocationId: dto.locationId,
            status: SerialStatus.AVAILABLE,
          })),
        });
        await tx.stockBalance.upsert({
          where: { locationId_productId: { locationId: dto.locationId, productId: dto.productId } },
          update: { quantity: { increment: dto.items.length } },
          create: {
            locationId: dto.locationId,
            productId: dto.productId,
            quantity: dto.items.length,
          },
        });
        return tx.stockMovement.create({
          data: {
            sourceLocationId: null,
            targetLocationId: dto.locationId,
            productId: dto.productId,
            quantity: dto.items.length,
            type: MovementType.ENTRADA,
            supplierId: dto.supplierId,
            createdBy: dto.createdBy,
          },
        });
      });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async createFractionalEntry(dto: CreateFractionalEntryDto & { createdBy: string }) {
    return this.createEntry({
      productId: dto.productId,
      locationId: dto.locationId,
      supplierId: dto.supplierId,
      quantity: dto.packages * dto.metersPerPackage,
      createdBy: dto.createdBy,
    });
  }
}

export type { CreateEntryDto };
