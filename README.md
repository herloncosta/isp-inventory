# ISP Inventory

Sistema de gestão e controle de estoque para provedores de internet (ISPs) de pequeno porte. Centraliza entradas de estoque, saídas para campo e devoluções, com rastreabilidade total do ciclo de vida dos materiais — do almoxarifado central ao carro do técnico.

## Funcionalidades

- **Autenticação JWT com RBAC** — perfis `ADMIN`, `ESTOQUISTA` e `TECNICO`
- **Cadastros base** — produtos/SKU, técnicos vinculados a veículos, fornecedores
- **Entradas de estoque** — manual, lote de seriais/MAC e insumos fracionados
- **Movimentações** — transferência Central → veículo, baixa em OS, devolução com status
- **Consultas e alertas** — saldo em tempo real por local e alerta de estoque mínimo
- **Auditoria imutável** — toda movimentação registra usuário, timestamp, tipo e quantidade

## Regras de negócio

| Regra | Descrição                                                    |
| ----- | ------------------------------------------------------------ |
| RN-01 | Unicidade de número de série e endereço MAC                  |
| RN-02 | Bloqueio de saldo negativo na origem (transação atômica)     |
| RN-03 | Ferramentas de alto valor rastreadas por comodato ao técnico |

## Stack

| Camada    | Tecnologia                                                       |
| --------- | ---------------------------------------------------------------- |
| Monorepo  | pnpm workspaces (`apps/api`, `apps/web`, `apps/shared`)          |
| Backend   | NestJS 11 + TypeScript (ESM)                                     |
| ORM       | Prisma 7 (`prisma-client` + driver adapter `@prisma/adapter-pg`) |
| Banco     | PostgreSQL 17 (Docker Compose)                                   |
| Frontend  | React 19 + Vite + TailwindCSS + React Query                      |
| Qualidade | Prettier + Vitest                                                |

## Estrutura

```
isp-inventory/
├── apps/
│   ├── api/        # NestJS — módulos por domínio (auth, products, technicians, suppliers, stock, dashboard)
│   ├── web/        # React — login, dashboard, produtos, estoque
│   └── shared/     # Tipos, enums e constantes compartilhados
├── docker-compose.yml
├── agents.md       # Especificação (SRS) + status do projeto
└── PLAN.md         # Plano de implementação por fases
```

## Quickstart

Pré-requisitos: Node ≥ 22.18, pnpm 10, Docker.

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir o PostgreSQL
pnpm db:up

# 3. Criar o banco e gerar o client Prisma
pnpm db:migrate

# 4. Popular usuários iniciais (senha: admin123)
pnpm db:seed
# admin@isp.com / estoquista@isp.com / tecnico@isp.com

# 5. Rodar API + Web em paralelo
pnpm dev
```

API em `http://localhost:3000` · Web em `http://localhost:5173`.

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

```bash
cp .env.example .env
# A API lê o .env a partir de apps/api — crie o link (necessário em clones frescos):
ln -s ../../.env apps/api/.env

DATABASE_URL="postgresql://isp:isp_password@localhost:5432/isp_inventory?schema=public"
JWT_SECRET="troque-em-producao"
PORT=3000
```

## Scripts

| Comando           | Descrição                               |
| ----------------- | --------------------------------------- |
| `pnpm dev`        | API + Web em modo desenvolvimento       |
| `pnpm build`      | Build de todos os pacotes               |
| `pnpm test`       | Testes do backend (Vitest)              |
| `pnpm lint`       | Checa formatação Prettier nos 3 pacotes |
| `pnpm lint:fix`   | Aplica formatação Prettier              |
| `pnpm db:up`      | Sobe o PostgreSQL via Docker            |
| `pnpm db:migrate` | Roda migrações Prisma                   |
| `pnpm db:seed`    | Popula dados iniciais                   |
| `pnpm db:studio`  | Abre o Prisma Studio                    |

## Testes

```bash
pnpm --filter api test           # roda uma vez
pnpm --filter api test:watch     # modo watch
pnpm --filter api test:coverage  # com cobertura
```

Regras de estoque puras (`canTransfer`, `findLowStock`, `hasDuplicateSerial`) vivem em `apps/api/src/modules/stock/stock.rules.ts` com cobertura em `stock.rules.spec.ts`.

## Workflow Git

- `develop` — integração; toda feature parte daqui.
- `main` — estável; recebe merge `--no-ff` da `develop` após validação (`prettier --check` + testes verdes).
- Commits em português no padrão `tipo: descrição` (`feat`, `fix`, `chore`, `docs`).

## Documentação

- `agents.md` — SRS completo, modelo de dados, stack e status do projeto (fonte de verdade).
- `PLAN.md` — plano de implementação por fases.

## Roadmap

Entrada em lote de seriais via UI, transferência/baixa/devolução no frontend, filtros avançados, testes e2e e CI/CD.
