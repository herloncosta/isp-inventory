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
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── generated/      # Prisma client output
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── products/
│   │   │   │   ├── technicians/
│   │   │   │   ├── suppliers/
│   │   │   │   ├── stock/
│   │   │   │   └── dashboard/
│   │   │   ├── common/
│   │   │   └── main.ts
│   │   ├── prisma.config.ts
│   │   └── package.json
│   ├── web/                    # React + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── package.json
│   └── shared/                 # Tipos, DTOs, constantes
│       ├── src/
│       └── package.json
├── docker-compose.yml
├── package.json
└── tsconfig.base.json
```

## Fases de Implementação

### Fase 1 — Scaffold Base

- [ ] Root `package.json` com workspaces (pnpm)
- [ ] `docker-compose.yml` com PostgreSQL
- [ ] `tsconfig.base.json` compartilhado
- [ ] `apps/shared` com tipos e enums iniciais
- [ ] `apps/api` — NestJS + Prisma 7 + `prisma.config.ts`
- [ ] `apps/web` — Vite + React + TailwindCSS + React Query

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

- [x] Testes unitários backend (Vitest, 64 testes)
- [x] CI (GitHub Actions: prettier + testes API + build web)
- [ ] Testes e2e

## Regras de Negócio

| RN                                  | Onde           | Como                                                                        |
| ----------------------------------- | -------------- | --------------------------------------------------------------------------- |
| **RN-01** (serial/MAC único)        | `SerialItems`  | `@@unique([serialNumber])`, `@@unique([macAddress])` + validação no service |
| **RN-02** (sem saldo negativo)      | `StockService` | Transação: check saldo → debita source → credita target, tudo atômico       |
| **RN-03** (ferramentas rastreáveis) | `SerialItems`  | Ferramentas de alto valor ganham `SerialItem` vinculado ao técnico          |

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

- [ ] RNF-001: NestJS com Modular Architecture
- [ ] RNF-002: PostgreSQL + Prisma ORM
- [ ] RNF-003: SPA React + Vite + TailwindCSS + React Query
- [ ] RNF-004: < 200ms para consultas de saldo/dashboard
- [ ] RNF-005: Auditoria imutável (user_id, timestamp, tipo, quantidade/seriais)
