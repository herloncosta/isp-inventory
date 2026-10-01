---
version: 1
slug: "apps-web-src-app-tsx"
primary_target: "apps/web/src/App.tsx"
related_targets: ["apps/web/src/pages/MovementsPage.tsx","apps/web/src/pages/DashboardPage.tsx","apps/web/src/components/CrudPage.tsx"]
---

# Surface: app shell + todas as telas (ISP Inventory web)

## Scope and mode

App inteiro (Login, shell/nav, Dashboard, Movimentações e as 7 telas de CRUD) em um único sistema visual. Modo **Operate**. Contrato da API, hooks, rotas e regras de negócio intocados: a mudança é da camada visual e dos componentes de apresentação. Nada depapel novo: não existe logo, cor oficial nem fonte de marca; nenhum nome, selo ou marca de terceiro pode ser inventado.

## Audience, job, task, constraints

Técnico de campo no banco do veículo, celular, uma mão só, sob sol. Job: ver o saldo do próprio carro e registrar o que consumiu ou devolveu em segundos, com rastro. Estoquista em desktop faz entrada por lote e bipagem. Estoquista e admin também usam teclado e desktop. Restrição que decide quase tudo: legibilidade sob luz forte e alvo de toque grande. Estados nunca são distinguidos só por cor.

## Chosen direction and memorable moment

**Talão de OS** — o carbon-copy service order slip. O formulário de OS que o técnico já preenche à mão é a própria interface: a linha preenchida é o fato, a via carbonada é a prova.

Momento memorável: **a via**. Ao confirmar uma movimentação, o app imprime a via carbonada — a linha duplicada com OS, item, quantidade, condição e horário. É a mesma via que o técnico levaria como comprovante, e é o que sustenta a promessa de auditoria imutável.

## Direction contract

**THESIS:** O registro de material é o formulário de OS que o técnico já preenche à mão — cada linha da via é um fato e a via carbonada é a prova. Recusa o card-grid de SaaS: nada de quatro cards com número e sombra para "dashboard".

**OWN-WORLD:** Papel autocopiativo (fundo off-white frio #F4F3EF), tinta grafite (#16181D), azul carbono (#1B4B8F) como único acento e cor de ação primária, vermelho carbono (#B3261E) reservado a defeito e ação destrutiva, régua impressa (#D8D5CC). Linhas pontilhadas de preenchimento, selos quadrados para estado, via impressa na confirmação. Grelha declarada: todo componente encaixa nela, nenhuma caixa flutua. Números — quantidade, OS, serial, MAC — em algarismo tabular, porque transpor um dígito em campo custa o item errado.

**STORY:** O técnico abre o app, vê onde está (faixa do bloco de título), o que tem no carro, e preenche a via: OS, item, quantidade, condição. Um toque imprime a via e o saldo muda na frente dele. O estoquista bipa um lote inteiro numa via só.

**FIRST VIEWPORT:** Retrato de celular. Topo: o bloco de título do talão, persistente, com a faixa onde você está. Depois, um número monumental (saldo do item escolhido) e a linha da OS como branco grande com guia pontilhada. Abaixo, a ação primária em largura total, azul carbono. A primeira dobra É o talão — não há shell de card em volta dela.

**FORM:** Talão de OS, candidato 2 de 7 da minha lista grounded (o roll designou Balizamento; o usuário travou o pick). Seed key: ee3aa0d4. Build code-led: sem geração de imagem neste harness, então sem comps — a ambição vive neste contrato e é auditada no finish review.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Raises absorbed into this world

- De `wayfinding-amarelo` (duplicata rejeitada): banda persistente que se comporta como placa, não como cabeçalho de site — a navegação é o índice do talão.
- De `console-grafite-escuro` (declinado): isolamento da ação destrutiva — a exclusão fica depois de uma linha de perfuração, nunca vizinha de salvar.
- De `specimen-crouwel` (declinado): a grelha como armação visível.

## Unresolved

- Sem logo: o bloco de título usa o nome "ISP Inventory" em tipografia, sem marca inventada.
- Sem imagens geradas: nenhuma textura de papel é raster; o papel é superfície de cor e fio de um pixel, não imagem.
- Vitest não cobre web (não há runner no pacote `web`): a verificação do build visual é o build do Vite + review de finish, não teste unitário.
