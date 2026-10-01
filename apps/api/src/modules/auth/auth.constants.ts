/**
 * Nomes dos cookies de sessão. Vivem fora do controller porque o guard de
 * autenticação também precisa do nome — importar de lá criaria um ciclo.
 */
export const ACCESS_COOKIE = 'isp_access_token';
export const REFRESH_COOKIE = 'isp_refresh_token';
