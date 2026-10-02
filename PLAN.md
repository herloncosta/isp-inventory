# ISP Inventory — Plano de Implementação

## Visão Geral

Sistema de gestão de estoque para ISPs de pequeno porte. Monorepo com NestJS (API), React (web) e pacote compartilhado de tipos.

## Stack

| Camada   | Tecnologia                                    |
| -------- | --------------------------------------------- |
| Monorepo | pnpm workspaces                               |
| Backend  | NestJS + TypeScript (ESM)                     |
| ORM      | Prisma 7.10.0 (prisma-client, driver adapter) |
| Banco    | PostgreSQL (Docker Compose)                   |
| Frontend | React + Vite + TailwindCSS + React Query      |
| Auth     | JWT + bcrypt                                  |

## Estrutura

```
isp-inventory/
├── apps/
│   ├── api/                    # NestJS + Prisma 7
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # 10 models
│   │   │   ├── migrations/     # 7 migrações
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── generated/      # Prisma client output
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # login, refresh, cookies httpOnly
│   │   │   │   ├── users/      # CRUD + desativação (sem DELETE)
│   │   │   │   ├── products/
│   │   │   │   ├── technicians/
│   │   │   │   ├── vehicles/
│   │   │   │   ├── suppliers/
│   │   │   │   ├── locations/  # CENTRAL/VEHICLE
│   │   │   │   ├── entries/    # manual, lote de seriais, fracionada
│   │   │   │   ├── movements/  # transfers, issues, returns
│   │   │   │   ├── stock/      # balances + stock.rules (regras puras)
│   │   │   │   └── dashboard/
│   │   │   ├── common/         # guards, decorators, prisma-errors
│   │   │   └── main.ts
│   │   ├── prisma.config.ts
│   │   └── vitest.config.ts
│   ├── web/                    # React + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── pages/          # 10 telas
│   │   │   ├── components/     # um componente por arquivo (form/, movements/, ...)
│   │   │   ├── features/       # tipos, constantes, hooks, parsers (sem JSX)
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   ├── public/fonts/       # Archivo + Azeret Mono self-hosted
│   │   ├── DESIGN.md
│   │   └── PRODUCT.md
│   └── shared/                 # Tipos, enums e rótulos em pt-BR
│       ├── src/
│       └── package.json
├── .github/workflows/ci.yml    # prettier + testes API + build web
├── docker-compose.yml
├── agents.md                   # SRS + status (fonte de verdade)
├── package.json
└── tsconfig.base.json
```

## Fases de Implementação

### Fase 1 — Scaffold Base

- [x] Root `package.json` com workspaces (pnpm)
- [x] `docker-compose.yml` com PostgreSQL
- [x] `tsconfig.base.json` compartilhado
- [x] `apps/shared` com tipos e enums iniciais
- [x] `apps/api` — NestJS + Prisma 7 + `prisma.config.ts`
- [x] `apps/web` — Vite + React + TailwindCSS + React Query

### Fase 2 — Auth & RBAC (RF-001, RF-002)

- [x] Migração: `Users` table
- [x] Módulo auth: login, JWT, bcrypt
- [x] Guards: `RolesGuard`, `JwtAuthGuard`
- [x] Decorator `@Roles(Role.ADMIN, Role.ESTOQUISTA)`
- [x] Seed: usuários admin/estoquista/tecnico
- [x] Módulo users: CRUD mínimo ADMIN-only (provisionamento de contas)
- [x] Security: access (15min) + refresh (7d, rotação single-use) em cookie httpOnly/SameSite=Lax, nenhum token no corpo da resposta nem em localStorage; lista de revogação (`revoked_tokens`), guard lê o cookie (header Bearer ainda aceito) e valida `typ`/`jti`; `GET /auth/me` para o boot da SPA não girar refresh a cada reload

### Fase 3 — Cadastros Base (RF-003, RF-004, RF-005)

- [x] Migração: `Products`, `Technicians`, `Vehicles`, `Suppliers`
- [x] CRUD produtos com categoria/unidade/estoque mínimo (DTOs com enums, 409 em SKU duplicado)
- [x] CRUD técnicos vinculados a veículos + módulo Vehicles (P2003 → 400 em veículo inexistente)
- [x] CRUD fornecedores (CNPJ, razão social, contato; 409 em CNPJ duplicado)

### Fase 4 — Entradas & Compras (RF-006, RF-007, RF-008)

- [x] Migração: `StockMovements`, `SerialItems` (+ `supplier_id`, `revoked_tokens`)
- [x] Módulo Locations (CENTRAL/VEHICLE) — pré-requisito das movimentações
- [x] Entrada manual vinculada a fornecedor (`POST /stock/entries`)
- [x] Entrada em lote de seriais/MAC (`POST /stock/entries/serial-batch`, fail-fast 409, RN-01)
- [x] Entrada de insumos fracionados (`POST /stock/entries/fractional`, pacotes × metros)

### Fase 5 — Movimentação (RF-009, RF-010, RF-011)

- [x] Transferência Central → Veículo (`POST /stock/transfers`, RN-02, move seriais AVAILABLE)
- [x] Baixa em OS (`POST /stock/issues`, serial vira IN_USE + osNumber)
- [x] Devolução com status (`POST /stock/returns`, AVAILABLE/DEFECTIVE/MAINTENANCE, osNumber preservada)
- [x] Transações atômicas com `prisma.$transaction`

### Fase 6 — Consultas & Alertas (RF-012, RF-013)

- [x] Dashboard: saldo por local em tempo real (`GET /dashboard`, `GET /stock/balances`)
- [x] Alerta de estoque mínimo (query + endpoint, `lowStock` no dashboard)
- [x] Vínculo local↔veículo (`vehicleId` em StockLocation) + `GET /stock/my-balances` (técnico vê próprio carro)
- [x] Filtros em movimentações: `type`, `from`, `to` + índice em `created_at` (RNF-004)
- [x] Filtros por local, produto, OS e período (API + UI no histórico)

### Fase 7 — Frontend Core

- [x] Layout + roteamento (React Router)
- [x] Login + proteção de rotas por perfil
- [x] Dashboard com cards de saldo e alertas
- [x] Páginas: Produtos, Técnicos, Fornecedores, Estoque (+ Veículos, Locais, Usuários)

### Fase 8 — Frontend Movimentações

- [x] Formulário de entrada (simples + lote de seriais + fracionada)
- [x] Transferência entre locais
- [x] Baixa em OS
- [x] Devolução com seleção de status
- [x] Histórico com filtros avançados

### Fase 9 — Qualidade & CI

- [x] Testes unitários backend (Vitest, 94 testes / 14 arquivos)
- [x] CI (GitHub Actions: prettier + testes API + build web)
- [ ] Testes e2e

### Fase 10 — Gestão de Usuários (RF-014, RN-04)

- [x] `users.active` + `users.deactivated_at` (migração aditiva, sem tocar em dados)
- [x] `PATCH /users/:id` edita campos; senha só é trocada quando vem preenchida
- [x] `PATCH /users/:id/status` desativa e reativa — **sem `DELETE /users`**
- [x] Login, refresh e `JwtAuthGuard` recusam conta desativada
- [x] Travas: não desativar a si mesmo, nem o último administrador ativo
- [x] Front: tabela com estado, editar em popup, desativar com confirmação

### Fase 11 — Gestão de Locais (RF-015, RN-05)

- [x] `remove` conta saldo, equipamento rastreado e histórico antes de excluir
- [x] Recusa com 409 nomeando **o que** impede, não um erro genérico
- [x] Histórico entra na conta: `stock_movements` não tem FK para o local
- [x] `ConfirmAction` genérico (extraído do popup de desativar usuário)
- [x] Front: LocationsPage com criar, editar e excluir com confirmação

## Segurança — Redução de Superfície de Ataque

Auditoria de código de 2026-10-02. Cada item é implementado em um commit próprio, com testes verdes antes do commit.

### Crítico

- [x] **S1** Remover `POST /stock/movements` e `POST /stock/serials` — `@Body() data: any` sem DTO permite mass assignment (`type`, `createdAt`, `id`) e cunhagem de saldo sem passar pelas entradas; nenhuma das duas é usada pelo front
- [x] **S2** `JWT_SECRET` obrigatório no boot — `?? 'dev-secret'` em `auth.module.ts` assina token forjável se a variável faltar em produção

### Alto

- [x] **S3** Rate limit em `/auth/login` (`@nestjs/throttler`) — sem trava de força bruta
- [x] **S4** Escopo do `TECNICO` conforme RF-002 — `@Roles` em `GET /stock/balances`, `GET /stock/serials`, `GET /stock/movements` e `GET /dashboard`; `POST /stock/issues`/`returns` só aceitam origem do veículo do próprio técnico
- [x] **S5** RN-02 atômica — `debit` faz `findUnique` + `update` em transações separadas lógicamente; `updateMany` com `quantity: { gte }` condicional
- [ ] **S6** CORS por allowlist (`CORS_ORIGINS`) em vez de `origin: true` com credenciais + `helmet` (security headers)

### Médio

- [ ] **S7** Guards globais (`APP_GUARD`) + decorator `@Public()` — autenticação passa a ser fail-closed por padrão
- [ ] **S8** `tokenVersion` em `User` — troca de senha/cargo desativa as sessões existentes no ato; trava de último admin ativo também no `update` de cargo
- [ ] **S9** Cookie de refresh com `path: '/auth'` (não viaja em toda requisição) e `secure` não dependente só de `NODE_ENV`
- [ ] **S10** Login com timing uniforme (hash dummy quando o usuário não existe) + log de tentativa negada
- [ ] **S11** `ValidationPipe` com `forbidNonWhitelisted` e `@Param('id')` validado como UUID (P2023 deixa de virar 500)
- [ ] **S12** Política de senha: `MinLength(8)`

### Baixo

- [ ] **S13** `take` nas listagens (`balances`, `serials`) + CNPJ com formato `\d{14}`
- [ ] **S14** Infra dev amarrada em `127.0.0.1` (Postgres no compose, host do Vite)
- [ ] **S15** CI com gate `pnpm audit --prod` e dependências vulneráveis atualizadas

## Regras de Negócio

| RN                                  | Onde               | Como                                                                        |
| ----------------------------------- | ------------------ | --------------------------------------------------------------------------- |
| **RN-01** (serial/MAC único)        | `SerialItems`      | `@@unique([serialNumber])`, `@@unique([macAddress])` + validação no service |
| **RN-02** (sem saldo negativo)      | `StockService`     | Transação: check saldo → debita source → credita target, tudo atômico       |
| **RN-03** (ferramentas rastreáveis) | `SerialItems`      | Ferramentas de alto valor ganham `SerialItem` vinculado ao técnico          |
| **RN-04** (usuário nunca excluído)  | `UsersService`     | `active`/`deactivated_at` + travas (si mesmo, último admin); só `PATCH`     |
| **RN-05** (local só se vazio)       | `LocationsService` | `remove` conta saldo, seriais e histórico; 409 nomeando o que impede        |

## Prisma 7 — Configuração

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

```ts
// Uso com driver adapter
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

## Requisitos Não Funcionais

- [x] RNF-001: NestJS com Modular Architecture
- [x] RNF-002: PostgreSQL + Prisma ORM
- [x] RNF-003: SPA React + Vite + TailwindCSS + React Query
- [ ] RNF-004: < 200ms para consultas de saldo/dashboard (sem medição/benchmark)
- [x] RNF-005: Auditoria imutável (user_id, timestamp, tipo, quantidade/seriais)
- [x] RNF-006: Tokens em cookie httpOnly/SameSite=Lax, rotação single-use + `revoked_tokens`
