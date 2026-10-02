import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service.js';
import { CreateUserDto, UpdateUserDto } from './dto.js';

const safeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  deactivatedAt: true,
  createdAt: true,
};

/** Erro de e-mail duplicado do Prisma (P2002) → 409. */
function isUniqueViolation(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'code' in e && e.code === 'P2002';
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: safeSelect, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: safeSelect });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async create(dto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash: await bcrypt.hash(dto.password, 10),
          role: dto.role,
        },
        select: safeSelect,
      });
    } catch (e) {
      if (isUniqueViolation(e)) throw new ConflictException('E-mail já cadastrado');
      throw e;
    }
  }

  /**
   * Edição de campos. A senha só é trocada quando vem preenchida — um PATCH
   * com senha vazia não pode apagar o hash existente.
   */
  async update(id: string, dto: UpdateUserDto) {
    const current = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, active: true },
    });
    if (!current) throw new NotFoundException('Usuário não encontrado');

    // Rebaixar o último admin ativo trancava a porta: restaria ninguém para
    // reativar contas ou promover outro administrador. `dto.role !== current.role`
    // já cobre a troca para qualquer cargo que não seja ADMIN.
    const demotesAdmin =
      current.role === 'ADMIN' &&
      current.active &&
      dto.role !== undefined &&
      dto.role !== current.role;
    if (demotesAdmin) await this.assertNotLastActiveAdmin(id);

    // Senha ou cargo novos sobem tokenVersion e derrubam as sessões abertas —
    // inclusive a de quem fez a edição. A SPA manda pro login no 401 seguinte.
    const rotatesSessions =
      Boolean(dto.password) || (dto.role !== undefined && dto.role !== current.role);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.role !== undefined && { role: dto.role }),
          ...(dto.password && { passwordHash: await bcrypt.hash(dto.password, 10) }),
          ...(rotatesSessions && { tokenVersion: { increment: 1 } }),
        },
        select: safeSelect,
      });
    } catch (e) {
      if (isUniqueViolation(e)) throw new ConflictException('E-mail já cadastrado');
      throw e;
    }
  }

  private async assertNotLastActiveAdmin(id: string) {
    const others = await this.prisma.user.count({
      where: { role: 'ADMIN', active: true, id: { not: id } },
    });
    if (others > 0) return;
    throw new BadRequestException(
      'Este é o único administrador ativo. Promova ou ative outro antes.',
    );
  }

  /**
   * Desativa (ou reativa) sem apagar a linha: o histórico de auditoria aponta
   * para o usuário, então excluí-lo quebraria a proveniência dos lançamentos.
   */
  async setStatus(id: string, active: boolean, actingUserId: string) {
    if (!active && id === actingUserId) {
      throw new BadRequestException(
        'Você não pode desativar a própria conta: ficaria sem ninguém para reativá-la.',
      );
    }
    const current = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, active: true },
    });
    if (!current) throw new NotFoundException('Usuário não encontrado');

    // Não deixa o último administrador ativo ficar sem substituto
    if (current.role === 'ADMIN' && current.active && !active) {
      await this.assertNotLastActiveAdmin(id);
    }

    return this.prisma.user.update({
      where: { id },
      data: { active, deactivatedAt: active ? null : new Date() },
      select: safeSelect,
    });
  }
}
