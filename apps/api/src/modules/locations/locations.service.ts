import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { throwPrismaError } from '../../common/prisma-errors.js';
import { CreateLocationDto, UpdateLocationDto } from './dto.js';

const MESSAGES = { duplicate: 'Local já cadastrado', reference: 'Veículo não encontrado' };

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.stockLocation.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const location = await this.prisma.stockLocation.findUnique({ where: { id } });
    if (!location) throw new NotFoundException('Local de estoque não encontrado');
    return location;
  }

  async create(data: CreateLocationDto) {
    try {
      return await this.prisma.stockLocation.create({ data });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  async update(id: string, data: UpdateLocationDto) {
    await this.findOne(id);
    try {
      return await this.prisma.stockLocation.update({ where: { id }, data });
    } catch (e) {
      throwPrismaError(e, MESSAGES);
    }
  }

  /**
   * Só exclui local sem nenhum item registrado: sem saldo, sem equipamento
   * rastreado e **sem histórico de movimentação**. O histórico importa porque
   * `stock_movements` não tem chave estrangeira para o local — apagar um local
   * usado deixaria o log de auditoria apontando para um id que não existe mais.
   */
  async remove(id: string) {
    await this.findOne(id);

    const [balances, serials, movements] = await Promise.all([
      this.prisma.stockBalance.count({ where: { locationId: id } }),
      this.prisma.serialItem.count({ where: { currentLocationId: id } }),
      this.prisma.stockMovement.count({
        where: { OR: [{ sourceLocationId: id }, { targetLocationId: id }] },
      }),
    ]);

    const reasons: string[] = [];
    if (balances > 0) reasons.push(`${balances} ${balances === 1 ? 'saldo' : 'saldos'} de produto`);
    if (serials > 0)
      reasons.push(
        `${serials} ${serials === 1 ? 'equipamento rastreado' : 'equipamentos rastreados'}`,
      );
    if (movements > 0)
      reasons.push(
        `${movements} ${movements === 1 ? 'movimentação no histórico' : 'movimentações no histórico'}`,
      );

    if (reasons.length > 0) {
      throw new ConflictException(
        `Não é possível excluir: o local tem ${reasons.join(', ')}. ` +
          'Transfira ou devolva o material antes de excluí-lo.',
      );
    }

    try {
      return await this.prisma.stockLocation.delete({ where: { id } });
    } catch (e) {
      // rede de segurança para qualquer referência que não tenhamos contado
      throwPrismaError(e, { ...MESSAGES, reference: 'Local tem itens vinculados' });
    }
  }
}
