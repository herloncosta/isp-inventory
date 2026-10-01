# ISP Inventory — SRS

> **Sistema de Gestão e Controle de Estoque Telecom**
> Versão: 0.1.0 | Última atualização: 2026-09-30

---

## 1. Visão Geral e Escopo

### 1.1 Objetivos

Prover um sistema simples, performático e confiável para gerenciamento de insumos e ativos de provedores de internet (ISPs) de pequeno porte. O sistema centraliza o controle de entradas de estoque, saídas para campo e devoluções, garantindo a rastreabilidade total do ciclo de vida dos materiais.

### 1.2 Tipos de Materiais Suportados

| Categoria                 | Tipo                                       | Exemplo                                                              | Tipo de Controle                               |
| ------------------------- | ------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------- |
| Ativos de Rede            | Equipamento eletrônico com serial/MAC      | ONU/ONT, Roteador Wi-Fi, Rádio Enlace, OLT                           | Rastreamento por Número de Série / MAC Address |
| Passivos de Rede          | Insumos sem inteligência eletrônica        | Cabo Drop, Fibra Aérea, Splitter, Conector Fast, Cabo UTP, Caixa NAP | Rastreamento por Unidade / Metros / Caixas     |
| Ferramentas e Utilitários | Instrumental de trabalho e consumo pontual | Máquina de Fusão, OTDR, Cleaver, Alicete Crimpador, Fita Isolante    | Rastreamento por Patrimônio / Unidade          |

---

## 2. Requisitos Funcionais (RF)

### Módulo 1: Autenticação e Perfis de Acesso (RBAC)

| ID     | Requisito                                                                                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RF-001 | **Autenticação**: login via e-mail e senha com JWT access (15min) + refresh (7d, rotação single-use), `POST /auth/refresh`, `POST /auth/logout` e lista de revogação (`revoked_tokens`).               |
| RF-002 | **Perfis de Usuário**: ADMIN (acesso total), ESTOQUISTA (entradas, saídas, movimentações, inventário), TECNICO (visualização de materiais alocados no próprio carro/almoxarifado móvel e requisições). |

### Módulo 2: Gestão de Cadastros Base

| ID     | Requisito                                                                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RF-003 | **Cadastro de Produtos/SKU**: Nome, Categoria (Ativo/Passivo/Ferramenta), Tecnologia (Fibra/UTP/Rádio), Unidade de Medida (Unidade, Metro, Caixa, Par) e Estoque Mínimo para alerta. |
| RF-004 | **Cadastro de Técnicos e Veículos**: Técnicos de campo vinculados a um almoxarifado móvel (veículo/veículo de serviço).                                                              |
| RF-005 | **Cadastro de Fornecedores**: CNPJ, Razão Social e Contato.                                                                                                                          |

### Módulo 3: Entradas e Compras de Materiais

| ID     | Requisito                                                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| RF-006 | **Registrar Entrada de Materiais**: Entrada manual de estoque vinculada a uma compra/fornecedor.                                          |
| RF-007 | **Lote de Equipamentos Ativos**: Na entrada de ativos, permitir a bipagem/inserção em lote de múltiplos Números de Série e Endereços MAC. |
| RF-008 | **Entrada de Insumos Fracionados**: Permitir dar entrada de bobinas/caixas de cabos em metros.                                            |

### Módulo 4: Movimentação de Estoque e Atribuição

| ID     | Requisito                                                                                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-009 | **Transferência para Estoque Técnico (Almoxarifado Móvel)**: O estoquista deve conseguir transferir materiais do Almoxarifado Central para o veículo do técnico.                                         |
| RF-010 | **Baixa em Ordem de Serviço (OS)**: O técnico ou estoquista deve dar baixa em materiais utilizados em instalações, manutenções ou implantações, informando o número da OS/Cliente.                       |
| RF-011 | **Devolução de Materiais**: Materiais não utilizados ou retirados de clientes (ex: ONU recolhida em cancelamento) retornam ao estoque central com status de "Disponível", "Com Defeito" ou "Manutenção". |

### Módulo 5: Consultas e Alertas

| ID     | Requisito                                                                                                                                            |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-012 | **Consulta de Estoque em Tempo Real**: Visualização do saldo de materiais por local (Almoxarifado Central e Carros dos Técnicos).                    |
| RF-013 | **Alerta de Estoque Mínimo**: Notificar na dashboard quando um insumo crítico (ex: conectores fast ou cabos drop) atingir o saldo mínimo estipulado. |

---

## 3. Requisitos Não Funcionais (RNF)

| ID      | Requisito                                                                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RNF-001 | **Arquitetura Backend**: TypeScript + NestJS, Modular Architecture e Clean Architecture.                                                                                                   |
| RNF-002 | **Banco de Dados e ORM**: PostgreSQL com Prisma ORM (v7).                                                                                                                                  |
| RNF-003 | **Frontend**: SPA responsiva em React (TypeScript) + Vite + TailwindCSS + React Query (TanStack Query).                                                                                    |
| RNF-004 | **Desempenho**: Tempo de resposta de leitura da dashboard e consultas de saldo de estoque não deve ultrapassar 200ms.                                                                      |
| RNF-005 | **Auditoria e Logs**: Toda movimentação de estoque (entrada, saída, transferência) deve registrar imutavelmente o user_id, timestamp, tipo_movimentacao e quantidade/seriais.              |
| RNF-006 | **Segurança de tokens**: access (memória, 15min) + refresh em cookie httpOnly/SameSite=Lax (7d, rotação single-use); revogação em `revoked_tokens`; nunca em localStorage. |

---

## 4. Modelo de Dados Relacional (PostgreSQL)

```
[Users] (id, name, email, password_hash, role, created_at)
  │
  ├───< [StockLocations] (id, name, type: CENTRAL/VEHICLE, responsible_user_id)
  │         │
  │         ├───< [StockBalances] (id, location_id, product_id, quantity)
  │         │
  │         └───< [StockMovements] (id, source_location_id, target_location_id, product_id, qty, OS_number, created_by)
  │
[Products] (id, name, sku, category, unit, min_stock)
  │
  └───< [SerialItems] (id, product_id, serial_number, mac_address, current_location_id, status: AVAILABLE/IN_USE/DEFECTIVE)
```

### Tabelas

| Tabela            | Campos                                                                                         | Descrição                              |
| ----------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| `users`           | id, name, email, password_hash, role, created_at                                               | Usuários do sistema (3 perfis)         |
| `stock_locations` | id, name, type, responsible_user_id                                                            | Locais de estoque (Central ou Veículo) |
| `stock_balances`  | id, location_id, product_id, quantity                                                          | Saldo por local + produto              |
| `stock_movements` | id, source_location_id, target_location_id, product_id, qty, os_number, created_by, created_at | Auditoria imutável de movimentações    |
| `products`        | id, name, sku, category, unit, min_stock                                                       | Cadastro de materiais                  |
| `serial_items`    | id, product_id, serial_number, mac_address, current_location_id, status                        | Rastreamento individual de ativos      |

---

## 5. Regras de Negócio (RN)

| ID    | Regra                                                                                                                                                                                       | Implementação                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| RN-01 | **Unicidade de Ativos**: Não é permitido o cadastro de dois equipamentos com o mesmo Número de Série ou Endereço MAC no sistema.                                                            | `@@unique([serial_number])`, `@@unique([mac_address])` no Prisma + validação no service. |
| RN-02 | **Bloqueio de Saldo Negativo**: Não é permitida a transferência ou baixa de um volume superior ao saldo disponível no local de origem.                                                      | Transação atômica: check saldo → debita source → credita target.                         |
| RN-03 | **Rastreabilidade de Ferramentas**: Ferramentas de alto valor (ex: Máquina de Fusão) são tratadas como ativos rastreáveis vinculadas ao técnico responsável sob regime de comodato interno. | Ferramentas de alto valor ganham `SerialItem` vinculado ao técnico.                      |

---

## 6. Stack Técnica

| Camada   | Tecnologia                               | Versão            |
| -------- | ---------------------------------------- | ----------------- |
| Monorepo | pnpm workspaces                          | 10+               |
| Backend  | NestJS + TypeScript (ESM)                | 11+               |
| ORM      | Prisma (prisma-client, driver adapter)   | 7+                |
| Banco    | PostgreSQL                               | 17                |
| Frontend | React + Vite + TailwindCSS + React Query | 19 / 6 / 3.4 / 5+ |
| Auth     | JWT + bcrypt                             | —                 |

---

## 7. Status do Projeto

### Implementado

- [x] Scaffold do monorepo (apps/api, apps/web, apps/shared)
- [x] Docker Compose (PostgreSQL)
- [x] Schema Prisma (7 tabelas, incl. `revoked_tokens`)
- [x] Módulo Auth (login, refresh com rotação, logout, guards RBAC + revogação)
- [x] Módulo Users (CRUD mínimo ADMIN-only)
- [x] Frontend com access em memória + refresh em cookie httpOnly (retry automático, sobrevive ao reload)
- [x] Módulo Products (CRUD)
- [x] Módulo Technicians (CRUD)
- [x] Módulo Suppliers (CRUD)
- [x] Módulo Stock (balances, movements, serials)
- [x] Módulo Dashboard (summary)
- [x] Frontend base (Login, Dashboard, Products, Stock)
- [x] Seed (3 usuários: admin/estoquista/tecnico)

### Pendente

- [ ] RF-007: Entrada em lote de seriais/MAC
- [ ] RF-008: Entrada de insumos fracionados (metros)
- [ ] RF-009: Transferência Central → Veículo (UI)
- [ ] RF-010: Baixa em OS (UI)
- [ ] RF-011: Devolução com status (UI)
- [ ] RF-012: Filtros avançados no dashboard
- [ ] Testes unitários e e2e
- [ ] CI/CD

---

## 8. Fluxo Obrigatório de Desenvolvimento

> **REGRA PERMANENTE** — este fluxo deve ser seguido em toda feature, sem exceções: **desenvolvimento → teste → validação → merge na main**. Refatorações ficam para o final do projeto.

1. **Desenvolvimento** — implementar a feature na branch `develop` (nunca direto na `main`).
2. **Teste** — implementar/atualizar testes Vitest cobrindo a nova lógica.
3. **Validação** — `prettier --check` limpo + `pnpm --filter api test` verde.
4. **Merge na main** — merge `--no-ff` da `develop` na `main` + push das duas branches.
5. **Refatorações** — somente ao final do projeto, em tarefa dedicada.

- Branches: `main` (estável) e `develop` (integração).
- Padrões de código: Prettier como formatador oficial; baixo acoplamento, alta coesão; preferir algoritmos O(n) com `Set`/`Map` em validações de unicidade e filtros de estoque.

## 9. Changelog

| Data       | Mudança                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------- |
| 2026-09-30 | Scaffold inicial do monorepo, schema Prisma, módulos base API e frontend                     |
| 2026-09-30 | Prettier padronizado (api/web/shared), Vitest com `stock.rules` testadas, repo remoto criado |
