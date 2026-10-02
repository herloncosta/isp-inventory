import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { MovementType, Role, SerialStatus } from '@isp/shared';
import { PrismaService } from '../prisma.service.js';
import { CreateIssueDto, CreateReturnDto, CreateTransferDto } from './dto.js';

/** Quem assina a movimentação: o papel decide o que pode ser debitado. */
type Actor = { createdBy: string; role: Role };

interface Tx {
  stockBalance: {
    updateMany: (args: any) => Promise<{ count: number }>;
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

  async transfer(dto: CreateTransferDto & Actor) {
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

  async issue(dto: CreateIssueDto & Actor) {
    await this.assertOwnVehicleSource(dto);
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

  async return(dto: CreateReturnDto & Actor) {
    await this.assertOwnVehicleSource(dto);
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

  /**
   * Técnico só opera no estoque do próprio veículo. Sem esta trava um login de
   * campo debitava da Central ou do carro de outro técnico (RF-002).
   */
  private async assertOwnVehicleSource(dto: Actor & { sourceLocationId: string }) {
    if (dto.role !== Role.TECNICO) return;
    const own = await this.prisma.technicianLocationId(dto.createdBy);
    if (!own || own !== dto.sourceLocationId) {
      throw new ForbiddenException('Técnico só movimenta o estoque do próprio veículo');
    }
  }

  private checkSerialCount(quantity: number, serials?: string[]) {
    if (serials && serials.length !== quantity) {
      throw new BadRequestException('Quantidade de seriais deve igualar a quantidade');
    }
  }

  /**
   * RN-02: o saldo só é conferido e debitado numa única instrução. O par
   * `findUnique` + `update` deixava duas transações concorrentes lerem o mesmo
   * saldo, ambas passarem na checagem e ambos os débitos se aplicarem — saldo
   * negativo. `updateMany` com `gte` trava a linha e só decrementa se ainda houver.
   */
  private async debit(tx: Tx, locationId: string, productId: string, quantity: number) {
    const debited = await tx.stockBalance.updateMany({
      where: { locationId, productId, quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } },
    });
    if (debited.count === 0) {
      throw new BadRequestException('Saldo insuficiente no local de origem');
    }
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
