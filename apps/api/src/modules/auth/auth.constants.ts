/**
 * Nomes dos cookies de sessão. Vivem fora do controller porque o guard de
 * autenticação também precisa do nome — importar de lá criaria um ciclo.
 */
export const ACCESS_COOKIE = 'isp_access_token';
export const REFRESH_COOKIE = 'isp_refresh_token';

/**
 * Sem segredo não há sessão: o fallback antigo (`'dev-secret'`) assinava token
 * que qualquer pessoa forjava, e só aparecia em produção — onde ninguém roda
 * os testes. Falhar no boot é mais barato que descobrir depois.
 */
export function requireJwtSecret(env: NodeJS.ProcessEnv = process.env): string {
  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET não definido. Copie .env.example para .env (e crie o link ' +
        'apps/api/.env) antes de subir a API.',
    );
  }
  return secret;
}
