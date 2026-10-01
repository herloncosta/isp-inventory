import { BadRequestException, Injectable } from '@nestjs/common';
import { MovementType, SerialStatus } from '@isp/shared';
import { PrismaService } from '../prisma.service.js';
import { CreateIssueDto, CreateReturnDto, CreateTransferDto } from './dto.js';

interface Tx {
  stockBalance: {
    findUnique: (args: any) => Promise<{ id: string; quantity: number } | null>;
    update: (args: any) => Promise<unknown>;
    upsert: (args: any) => Promise<unknown>;
  };
  serialItem: {
    findMany: (
      args: any,
    ) => Promise<
      { serialNumber: string; productId: string; currentLocationId: string; status: string }[]
    >;
    updateMany: (args: any) => Promise<unknown>;
  };
  stockMovement: { create: (args: any) => Promise<unknown> };
}

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) {}

  async transfer(dto: CreateTransferDto & { createdBy: string }) {
    if (dto.sourceLocationId === dto.targetLocationId) {
      throw new BadRequestException('Origem e destino devem ser diferentes');
    }
    this.checkSerialCount(dto.quantity, dto.serialNumbers);
    return this.prisma.$transaction(async (tx) => {
      await this.debit(tx as unknown as Tx, dto.sourceLocationId, dto.productId, dto.quantity);
      if (dto.serialNumbers) {
        await this.checkSerials(tx as unknown as Tx, dto, SerialStatus.AVAILABLE);
        await (tx as unknown as Tx).serialItem.updateMany({
          where: { serialNumber: { in: dto.serialNumbers } },
          data: { currentLocationId: dto.targetLocationId },
        });
      }
      await this.credit(tx as unknown as Tx, dto.targetLocationId, dto.productId, dto.quantity);
      return (tx as unknown as Tx).stockMovement.create({
        data: {
          sourceLocationId: dto.sourceLocationId,
          targetLocationId: dto.targetLocationId,
          productId: dto.productId,
          quantity: dto.quantity,
          type: MovementType.TRANSFERENCIA,
          createdBy: dto.createdBy,
        },
      });
    });
  }

  async issue(dto: CreateIssueDto & { createdBy: string }) {
    this.checkSerialCount(dto.quantity, dto.serialNumbers);
    return this.prisma.$transaction(async (tx) => {
      await this.debit(tx as unknown as Tx, dto.sourceLocationId, dto.productId, dto.quantity);
      if (dto.serialNumbers) {
        await this.checkSerials(tx as unknown as Tx, dto, SerialStatus.AVAILABLE);
        await (tx as unknown as Tx).serialItem.updateMany({
          where: { serialNumber: { in: dto.serialNumbers } },
          data: { status: SerialStatus.IN_USE, osNumber: dto.osNumber },
        });
      }
      return (tx as unknown as Tx).stockMovement.create({
        data: {
          sourceLocationId: dto.sourceLocationId,
          targetLocationId: null,
          productId: dto.productId,
          quantity: dto.quantity,
          osNumber: dto.osNumber,
          type: MovementType.BAIXA_OS,
          createdBy: dto.createdBy,
        },
      });
    });
  }

  async return(dto: CreateReturnDto & { createdBy: string }) {
    if (dto.sourceLocationId === dto.targetLocationId) {
      throw new BadRequestException('Origem e destino devem ser diferentes');
    }
    this.checkSerialCount(dto.quantity, dto.serialNumbers);
    return this.prisma.$transaction(async (tx) => {
      await this.debit(tx as unknown as Tx, dto.sourceLocationId, dto.productId, dto.quantity);
      if (dto.serialNumbers) {
        await this.checkSerials(tx as unknown as Tx, dto, null);
        await (tx as unknown as Tx).serialItem.updateMany({
          where: { serialNumber: { in: dto.serialNumbers } },
          data: { status: dto.condition, currentLocationId: dto.targetLocationId },
        });
      }
      await this.credit(tx as unknown as Tx, dto.targetLocationId, dto.productId, dto.quantity);
      return (tx as unknown as Tx).stockMovement.create({
        data: {
          sourceLocationId: dto.sourceLocationId,
          targetLocationId: dto.targetLocationId,
          productId: dto.productId,
          quantity: dto.quantity,
          type: MovementType.DEVOLUCAO,
          createdBy: dto.createdBy,
        },
      });
    });
  }

  private checkSerialCount(quantity: number, serials?: string[]) {
    if (serials && serials.length !== quantity) {
      throw new BadRequestException('Quantidade de seriais deve igualar a quantidade');
    }
  }

  private async debit(tx: Tx, locationId: string, productId: string, quantity: number) {
    const balance = await tx.stockBalance.findUnique({
      where: { locationId_productId: { locationId, productId } },
    });
    if (!balance || balance.quantity < quantity) {
      throw new BadRequestException('Saldo insuficiente no local de origem');
    }
    await tx.stockBalance.update({
      where: { id: balance.id },
      data: { quantity: { decrement: quantity } },
    });
  }

  private async credit(tx: Tx, locationId: string, productId: string, quantity: number) {
    await tx.stockBalance.upsert({
      where: { locationId_productId: { locationId, productId } },
      update: { quantity: { increment: quantity } },
      create: { locationId, productId, quantity },
    });
  }

  private async checkSerials(
    tx: Tx,
    dto: { productId: string; sourceLocationId: string; serialNumbers?: string[] },
    requiredStatus: string | null,
  ) {
    const serials = dto.serialNumbers ?? [];
    const found = await tx.serialItem.findMany({ where: { serialNumber: { in: serials } } });
    const foundSet = new Set(found.map((s) => s.serialNumber));
    const missing = serials.filter((s) => !foundSet.has(s));
    if (missing.length > 0)
      throw new BadRequestException(`Seriais não encontrados: ${missing.join(', ')}`);
    const invalid = found.filter(
      (s) =>
        s.productId !== dto.productId ||
        s.currentLocationId !== dto.sourceLocationId ||
        (requiredStatus !== null && s.status !== requiredStatus),
    );
    if (invalid.length > 0) {
      throw new BadRequestException(
        `Seriais indisponíveis na origem: ${invalid.map((s) => s.serialNumber).join(', ')}`,
      );
    }
  }
}
