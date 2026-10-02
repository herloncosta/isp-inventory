import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * O JwtAuthGuard é global: tudo é privado por padrão e só o que marcar aqui
 * abre mão da sessão. Sem este decorator, esquecer `@UseGuards` em um controller
 * novo nascia um endpoint público sem ninguém perceber.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
