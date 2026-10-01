import { BadRequestException, ConflictException } from '@nestjs/common';

export function throwPrismaError(
  e: unknown,
  messages: { duplicate: string; reference: string },
): never {
  if (typeof e === 'object' && e !== null && 'code' in e) {
    if (e.code === 'P2002') throw new ConflictException(messages.duplicate);
    if (e.code === 'P2003') throw new BadRequestException(messages.reference);
  }
  throw e;
}
