# ISP Inventory

Sistema de gestão e controle de estoque para provedores de internet (ISPs) de pequeno porte. Centraliza entradas de estoque, saídas para campo e devoluções, com rastreabilidade total do ciclo de vida dos materiais — do almoxarifado central ao carro do técnico.

![Tela de login do ISP Inventory](preview.png)

## Funcionalidades

- **Autenticação JWT com RBAC** — perfis `ADMIN`, `ESTOQUISTA` e `TECNICO`
- **Cadastros base** — produtos/SKU, técnicos vinculados a veículos, fornecedores
- **Entradas de estoque** — manual, lote de seriais/MAC e insumos fracionados
- **Movimentações** — transferência Central → veículo, baixa em OS, devolução com status
- **Consultas e alertas** — saldo em tempo real por local e alerta de estoque mínimo
- **Auditoria imutável** — toda movimentação registra usuário, timestamp, tipo e quantidade, e a confirmação sai como uma via impressa
- **Gestão de usuários** — criar, editar e desativar; usuário nunca é excluído, porque o log de auditoria aponta para ele
- **Gestão de locais** — criar, editar e excluir, com exclusão bloqueada enquanto houver saldo, equipamento ou histórico
- **Feito para o carro** — interface desenhada para celular, sob sol, com uma mão só

## Regras de negócio

| Regra | Descrição                                                                |
| ----- | ------------------------------------------------------------------------ |
| RN-01 | Unicidade de número de série e endereço MAC                              |
| RN-02 | Bloqueio de saldo negativo na origem (transação atômica)                 |
| RN-03 | Ferramentas de alto valor rastreadas por comodato ao técnico             |
| RN-04 | Usuário nunca é excluído: desativar tira o acesso e preserva o histórico |
| RN-05 | Local só é excluído se estiver vazio, e a API diz o que impede           |

## Stack

| Camada     | Tecnologia                                                             |
| ---------- | ---------------------------------------------------------------------- |
| Monorepo   | pnpm workspaces (`apps/api`, `apps/web`, `apps/shared`)                |
| Backend    | NestJS 11 + TypeScript (ESM)                                           |
| ORM        | Prisma 7 (`prisma-client` + driver adapter `@prisma/adapter-pg`)       |
| Banco      | PostgreSQL 17 (Docker Compose)                                         |
| Frontend   | React 19 + Vite 6 + TailwindCSS 3 + React Query 5 + React Router 7     |
| Tipografia | Archivo e Azeret Mono self-hosted (SIL OFL) — ver `apps/web/DESIGN.md` |
| Qualidade  | Prettier + Vitest + GitHub Actions                                     |

## Estrutura

```
isp-inventory/
├── apps/
│   ├── api/        # NestJS — módulos por domínio (auth, users, products, technicians,
│   │               #   vehicles, suppliers, locations, entries, movements, stock, dashboard)
│   ├── web/        # React — 10 telas, um componente por arquivo
│   │   ├── src/components/   # form/, movements/ e os componentes do shell
│   │   ├── src/features/     # tipos, constantes, hooks e parsers (sem JSX)
│   │   ├── public/fonts/     # Archivo e Azeret Mono self-hosted
│   │   ├── DESIGN.md         # sistema visual: tokens, tipografia, componentes
│   │   └── PRODUCT.md        # fatos de produto: usuários, restrições, terminologia
│   └── shared/     # Tipos, enums e rótulos em pt-BR
├── .github/workflows/ci.yml
├── docker-compose.yml
├── agents.md       # Especificação (SRS) + status do projeto
├── preview.png
└── PLAN.md         # Plano de implementação por fases
```

**Organização do front:** um componente por arquivo em `components/` e `pages/`.
O que não é componente (tipos, constantes, hooks, parsers) vai para `features/`.
A regra está registrada em `agents.md`.

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

Abra **`http://localhost:5173`**. A API roda na 3000, mas você não precisa acessá-la
no navegador: o front fala com ela pela própria origem (ver a seção seguinte).

## API na mesma origem

O front chama a API em `/api/*`, e o proxy do Vite (`apps/web/vite.config.ts`) encaminha para `http://localhost:3000`. Isso é requisito do login: com o token em cookie, uma chamada de outra origem depende da política de cookie do navegador e a sessão simplesmente não volta. Na mesma origem não existe CORS e o cookie é de primeira parte.

Para apontar a outro host (produção, por exemplo), defina `VITE_API_URL` com a raiz da API, ex.: `VITE_API_URL=https://api.exemplo.com`. Sem essa variável, vale `/api`.

E, do lado da API, `CORS_ORIGINS` com as origens liberadas (lista separada por vírgula). Sem ela a API não emite CORS nenhum — é o padrão, e é o que basta enquanto front e API compartilham origem.

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

Verificação de tipos (o Vitest não checa tipos):

```bash
pnpm --filter api typecheck
```

## Testes

```bash
pnpm --filter api test           # roda uma vez
pnpm --filter api test:watch     # modo watch
pnpm --filter api test:coverage  # com cobertura
```

Regras de estoque puras (`canTransfer`, `findLowStock`, `hasDuplicateSerial`) vivem em `apps/api/src/modules/stock/stock.rules.ts` com cobertura em `stock.rules.spec.ts`.

O backend tem 94 testes em 14 arquivos. O front **não tem runner de teste**: a verificação da interface é o `typecheck` do build, o Prettier, o detector de antipadrões e a inspeção em navegador. Colocar Vitest no `web` é uma decisão de stack ainda não tomada. A CI (`.github/workflows/ci.yml`) roda Prettier, testes da API e build da web em todo push e pull request para `main` e `develop`.

## Sessão

Login e refresh guardam access (15min) e refresh (7d) em **cookies httpOnly**, nenhum dos dois devolvido no corpo da resposta. O `GET /auth/me` devolve o usuário autenticado; o browser envia os cookies sozinho, então nenhum token é legível por JavaScript. Recarregar a página não gira o refresh token.

## Workflow Git

- `develop` — integração; toda feature parte daqui.
- `main` — estável; recebe merge `--no-ff` da `develop` após validação (`prettier --check` + testes verdes).
- Commits em português no padrão `tipo: descrição` (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`).

## Documentação

- `agents.md` — SRS completo, modelo de dados, stack, convenções e status do projeto (fonte de verdade).
- `apps/web/DESIGN.md` — sistema visual: paleta, tipografia, componentes e o que não se faz.
- `apps/web/PRODUCT.md` — usuários, restrições de uso e terminologia do domínio.
- `PLAN.md` — plano de implementação por fases.

## Roadmap

Entregue: entrada em lote de seriais pela interface, transferência, baixa em OS e
devolução com status, filtros avançados no histórico e CI/CD.

Falta: **testes e2e** (exige decidir o runner: Playwright ou Cypress) e **testes de
componente no front** (idem, exige Vitest + jsdom no pacote `web`).
