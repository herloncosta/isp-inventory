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
- [x] Security: access (15min) + refresh (7d) com rotação single-use, lista de revogação (`revoked_tokens`), guard valida `typ`/`jti`; frontend guarda tokens só em memória com retry via refresh

### Fase 3 — Cadastros Base (RF-003, RF-004, RF-005)

- [ ] Migração: `Products`, `Technicians`, `Vehicles`, `Suppliers`
- [ ] CRUD produtos com categoria/unidade/estoque mínimo
- [ ] CRUD técnicos vinculados a veículos (StockLocations tipo VEHICLE)
- [ ] CRUD fornecedores (CNPJ, razão social, contato)

### Fase 4 — Entradas & Compras (RF-006, RF-007, RF-008)

- [ ] Migração: `StockMovements`, `SerialItems`
- [ ] Entrada manual vinculada a fornecedor
- [ ] Entrada em lote de seriais/MAC (RN-01: unicidade)
- [ ] Entrada de insumos fracionados (metros)

### Fase 5 — Movimentação (RF-009, RF-010, RF-011)

- [ ] Transferência Central → Veículo (RN-02: saldo negativo bloqueado)
- [ ] Baixa em OS (técnico ou estoquista)
- [ ] Devolução com status (Disponível/Defeito/Manutenção)
- [ ] Transações atômicas com `prisma.$transaction`

### Fase 6 — Consultas & Alertas (RF-012, RF-013)

- [ ] Dashboard: saldo por local em tempo real
- [ ] Alerta de estoque mínimo (query + endpoint)
- [ ] Filtros por local, produto, período

### Fase 7 — Frontend Core

- [ ] Layout + roteamento (React Router)
- [ ] Login + proteção de rotas por perfil
- [ ] Dashboard com cards de saldo e alertas
- [ ] Páginas: Produtos, Técnicos, Fornecedores, Estoque

### Fase 8 — Frontend Movimentações

- [ ] Formulário de entrada (simples + lote de seriais)
- [ ] Transferência entre locais
- [ ] Baixa em OS
- [ ] Devolução com seleção de status

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
