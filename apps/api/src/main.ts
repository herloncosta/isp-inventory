import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

/**
 * Origens que podem falar com a API com credencial. O vazio é o padrão: em
 * desenvolvimento o front chama na mesma origem via proxy do Vite, e CORS
 * aberto com `origin: true` + `credentials: true` refletia qualquer site.
 * Produção com domínio separado define CORS_ORIGINS=api.exemplo.com.
 */
function corsOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = corsOrigins();
  if (origins.length > 0) app.enableCors({ origin: origins, credentials: true });
  // crossOriginResourcePolicy desligado: em produção o front e a API podem
  // morar em domínios distintos e o padrão 'same-origin' bloquearia a resposta.
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
