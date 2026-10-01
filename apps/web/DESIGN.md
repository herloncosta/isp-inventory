---
name: ISP Inventory
description: Controle de estoque e rastreio de material para ISPs de pequeno porte, desenhado como o talão de ordem de serviço que o técnico já preenche à mão.
colors:
  papel-autocopiativo: '#f4f3ef'
  grafite: '#16181d'
  grafite-70: '#5d5f63'
  grafite-45: '#6a6c70'
  regua: '#d8d5cc'
  regua-forte: '#8a8578'
  azul-de-via: '#1b4b8f'
  azul-de-via-fundo: '#143a6e'
  azul-de-via-lavado: '#e9eff8'
  azul-de-via-borda: '#b9cbe6'
  vermelho-de-caneta: '#b3261e'
  papel-levantado: '#e7e4da'
  linha-marcada: '#e6e3d9'
typography:
  display:
    fontFamily: 'Archivo, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 700
    letterSpacing: '0.16em'
    fontVariation: 'wdth 92%'
  headline:
    fontFamily: 'Archivo, ui-sans-serif, system-ui, sans-serif'
    fontSize: '3rem'
    fontWeight: 500
    lineHeight: 1
    fontVariation: 'wdth 92%'
  title:
    fontFamily: 'Archivo, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 700
    letterSpacing: '0.14em'
    fontVariation: 'wdth 78%'
  body:
    fontFamily: 'Archivo, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    fontVariation: 'wdth 92%'
  label:
    fontFamily: 'Archivo, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.6875rem'
    fontWeight: 700
    letterSpacing: '0.14em'
    fontVariation: 'wdth 78%'
  medida:
    fontFamily: 'Azeret Mono, ui-monospace, monospace'
    fontSize: '1.125rem'
    fontWeight: 400
    fontFeature: 'tabular-nums'
rounded:
  form: '2px'
  seal: '0px'
  pill: '999px'
spacing:
  campo: '20px'
  bloco: '32px'
  linha: '48px'
components:
  capa-talhao:
    backgroundColor: '{colors.azul-de-via}'
    textColor: '{colors.papel-autocopiativo}'
    rounded: '{rounded.form}'
    padding: '36px 40px'
    width: '60%'
  carimbo-primario:
    backgroundColor: '{colors.azul-de-via}'
    textColor: '{colors.papel-autocopiativo}'
    rounded: '{rounded.form}'
    padding: '0 20px'
    height: '48px'
  carimbo-primario-hover:
    backgroundColor: '{colors.azul-de-via-fundo}'
  carimbo-fantasma:
    backgroundColor: 'transparent'
    textColor: '{colors.grafite}'
    rounded: '{rounded.form}'
    padding: '0 20px'
    height: '48px'
  campo:
    backgroundColor: 'transparent'
    textColor: '{colors.grafite}'
    typography: '{typography.medida}'
    rounded: '{rounded.form}'
    padding: '12px 0'
    height: '48px'
  selo:
    backgroundColor: '{colors.grafite}'
    textColor: '{colors.papel-autocopiativo}'
    rounded: '{rounded.seal}'
    padding: '0 12px'
    height: '36px'
  selo-ativo-defeito:
    backgroundColor: '{colors.vermelho-de-caneta}'
    textColor: '#ffffff'
  faixa:
    backgroundColor: '{colors.papel-autocopiativo}'
    textColor: '{colors.grafite}'
    rounded: '{rounded.form}'
    height: '56px'
  via:
    backgroundColor: '#ffffff'
    textColor: '{colors.grafite}'
    rounded: '{rounded.form}'
    padding: '12px 16px'
---

# Design System: ISP Inventory

## Overview

**Creative North Star: "A via que viaja"**

O sistema é o talão de ordem de serviço carbonado que o técnico de campo já preenche à mão antes de existir este software. A folha inteira é o talão: o papel é o fundo da página e a estrutura aparece como régua impressa, vinco e perfuração — nunca como caixa flutuante com sombra. Não existe card: existe folha, campo preenchido, guia pontilhada e a duplicata carbonada que se imprime ao confirmar um lançamento e acompanha o técnico como comprovante.

A densidade é de formulário de papel, não de painel de SaaS. Os rótulos são versalete condensados, como as etiquetas impressas de um formulário real; os valores preenchidos à mão vão em monoespaçado com algarismo tabular, porque transpor um dígito em campo custa o item errado. O mundo material é papel autocopiativo, tinta grafite e o azul da caneta de carbono — sem vidro, sem blur, sem gradiente, sem raio arredondado.

A régua que decide tudo: o técnico usa isso de pé, ao lado do veículo, com uma mão só e sob sol forte. Então fio de 1px éота de 3:1, texto nunca abaixo de 4.5:1, alvo de toque de 48px, e nenhum estado é comunicado só por cor.

**Key Characteristics:**

- A página é a folha; a divisão de seções é régua impressa, não caixa.
- Um único azul (o carbono) carrega toda ação; vermelho é reservado a defeito e erro.
- Rótulo em versalete condensado; medida em monoespaçado tabular.
- Selo de estado é quadrado e sempre traz a palavra, nunca só a cor.
- Um único momento animado no produto inteiro: a via se imprime.

## Colors

A paleta é de quatro materiais de papel: a folha, a tinta, a régua e a caneta.

### Primary

- **Azul de via** (#1b4b8f): a única cor de ação do sistema. Carimba o botão primário, marca a aba ativa, desenha a borda da via carbonada e o texto de "Operação registrada". Sobre papel passa 7.7:1; sobre branco, 8.6:1.

### Neutral

- **Papel autocopiativo** (#f4f3ef): o fundo da página inteira e da faixa fixa. Não é creme: é frio, para não parecer papel de café.
- **Grafite** (#16181d): todo texto de conteúdo e a régua de 1px da faixa. 15.9:1 sobre o papel.
- **Grafite 70** (#5d5f63): rótulos, legendas e texto de apoio. 5.8:1.
- **Grafite 45** (#6a6c70): o cinza mais claro que ainda é texto — usado em placeholder e em unidade de coluna. 4.7:1. Abaixo disso não é texto: ou é régua, ou não existe.
- **Régua forte** (#8a8578): a borda de baixo do campo preenchido, a borda do selo e a guia pontilhada. 3.3:1 — é elemento de interface, não texto, e precisa de 3:1 para não desaparecer sob sol.
- **Régua** (#d8d5cc): divisória de linha do ledger e a régua tracejada da perfuração. Puramente decorativa.
- **Papel levantado** (#e7e4da): a superfície do carimbo desabilitado. O estado nunca é só cor — o rótulo vira "Registrando...".
- **Linha marcada** (#e6e3d9): a linha do ledger sob o cursor. Estado, não fronteira.

### Semântica

- **Vermelho de caneta** (#b3261e): defeito, erro de API e a faixa de alerta de estoque mínimo. 5.9:1 sobre papel. Não é cor decorativa e nunca aparece em estado saudável.

### Named Rules

**A Regra do Carbono.** O azul de via é a única cor de ação e ocupa no máximo um elemento por tela. A raridade é o ponto: se tudo é azul, nada é acionável.

**A Regra do Vermelho Reservado.** Vermelho só para defeito, erro e estoque no mínimo. Se um item está disponível, ele nunca é vermelho — nem por decoração, nem por estado decepado.

## Typography

**Display Font:** Archivo (fallback: ui-sans-serif, system-ui, sans-serif)
**Body Font:** Archivo (fallback: ui-sans-serif, system-ui, sans-serif)
**Label/Mono Font:** Azeret Mono (fallback: ui-monospace, monospace)

**Character:** Archivo é uma grotesca de desenhar técnico com eixo de largura variável: no padrão `wdth 92%` ela serve de texto, e esticada paraversal (`wdth 78%`) ela vira a voz das etiquetas impressas do formulário. Azeret Mono entra só para o que o técnico preenche e para o que ele precisa conferir dígito a dígito.

### Hierarchy

- **Display** (700, `1.125rem`, tracking `0.16em`, versalete): o nome do sistema e o título de cada tela. Nunca gigante — o talão não tem manchete.
- **Headline** (500, `3rem`, line-height 1): o número que decide, e só ele: o saldo disponível do item no local, o total de metros da entrada fracionada. É o único número monumental do sistema.
- **Title** (700, `0.75rem`, tracking `0.14em`, versalete): o cabeçalho de seção e o cabeçalho de coluna do ledger.
- **Body** (400, `0.875rem`): texto de apoio e células de texto do ledger. Medida máxima de 75ch. É o tamanho padrão de qualquer texto corrente — não existe passo intermediário entre 11px e 14px.
- **Label** (700, `0.6875rem`, tracking `0.14em`, versalete): rótulo de campo e etiqueta de aba.
- **Medida** (Azeret Mono 400, `1.125rem`, `tabular-nums`): valor preenchido à mão e dado numérico.

### Named Rules

**A Regra do Monoespaçado.** Monoespaçado é para dado, medida e identificador — serial, MAC, placa, SKU, CNPJ, número de OS, quantidade, horário. Nunca é figurino "técnico" e nunca rotula um campo comum.

**A Regra da Etiqueta.** Todo campo começa com um versalete condensado de 11px. O heading carrega o próprio peso; não existe kicker nem eyebrow acima dele.

## Layout

Grade declarada de 12 colunas, sem caixa flutuante: tudo encaixa nela e nada se posiciona fora. Container de conteúdo com `max-width: 5xl` centralizado, margem lateral de `1rem` no celular e `1.5rem` a partir de `md`.

O ritmo é o do formulário: `1.25rem` entre campos de um mesmo grupo, `2rem` entre grupos, régua de 1px separando seções. O espelho acima de um heading é maior que o espelho abaixo dele.

Tabelas são o ledger: coluna mínima de `34rem` dentro de um wrapper com `overflow-x: auto` e respiro lateral negativo, então no celular a tabela rola em vez de estourar a folha. Barra de abas e navegação rolam na horizontal com `white-space: nowrap` e alvo de toque de 44px.

Faixa fixa (`position: sticky`, topo 0) com o nome do sistema, a tela atual e o índice; a régua dela tem 1px e a aba ativa carimba 2px de azul por cima, então as duas nunca se somam.

## Elevation & Depth

A superfície é plana. Profundidade vem de fio de 1px, de cor e de um único recurso: a sombra aparece **só no que de fato levita da folha** — a faixa fixa quando você rola, e a via carbonada quando ela é impressa. Nada mais tem sombra, e nenhuma sombra é halocodeado sem deslocamento.

### Shadow Vocabulary

- **LevITA** (`0 1px 2px rgba(22,24,29,0.08), 0 6px 14px -8px rgba(22,24,29,0.22)`): a única sombra do sistema. Na faixa fixa e na via.

### Named Rules

**A Regra do Que Levita.** Superfície plana em repouso; sombra apenas onde o elemento se descola fisicamente do papel. Cartão com sombra em repouso não existe neste sistema.

## Shapes

O raio máximo é `2px`. Selo e régua são retângulos de 0px. Não existe cápsula, não existe círculo, não existe `rounded-lg`.

A borda é o instrumento principal: campo preenchido tem só a régua de 2px embaixo (o traço da caneta); selo tem borda de 2px em tinta e preenchimento quando ativo; a via tem borda de 1px em azul de via com topo e base tracejados, como a separação entre as folhas do carbonado. A perfuração é um `linear-gradient` tracejado de 12px que separa o que é registro do que é registro permanente.

## Components

### Botões

- **Forma:** retângulo de 2px de raio, 48px de altura, versalete condensado com tracking `0.12em`.
- **Primário (carimbo):** fundo azul de via, texto papel, `padding: 0 20px`. Full-width no celular, auto a partir de `sm`.
- **Hover / Focus:** hover vai para azul de via fundo; o anel de foco é o global de 2px em azul com offset 2px. **Desabilitado:** fundo `#e7e4da`, texto grafite 70 (5:1) — o estado nunca é só cor, o rótulo vira "Registrando...".
- **Secundário (carimbo-fantasma):** transparente com borda de 2px grafite 70; no hover inverte para fundo grafite e texto papel.

### Selos (estado)

- **Estilo:** quadrado sem raio, borda de 2px, 36px de altura, versalete condensado.
- **Estado inativo:** borda régua forte, texto grafite 70. **Ativo:** fundo grafite (ou vermelho de caneta, para defeito e manutenção) e texto claro.
- O tom é **por opção**, não por grupo: "Disponível" nunca carimba vermelho.

### Campos

- **Estilo:** fundo transparente, sem borda, apenas a régua de 2px embaixo em grafite 45→regua forte; padding `12px 0`; altura mínima 48px; caret azul de via.
- **Foco:** a régua vira azul de via. O anel de foco global **não** é cancelado em campo nenhum.
- **Select:** seta desenhada à mão (dois `linear-gradient` de 5px) com `appearance: none`, para não haver duas setas.
- **Erro / desabilitado:** desabilitado usa borda pontilhada e grafite 45; o carimbo desabilitado usa papel levantado com texto em grafite 70 (5:1).
- **Todo campo tem o mesmo corpo de texto** (`1.125rem`, o papel Medida), inclusive a textarea de seriais: no dedo, com luva, um campo não pode ser menor que os outros.

### Marca e capa do login

A marca é um SVG autoral: a gota de fibra descendo até o equipamento, em traço
único (2 unidades em viewBox 32), sem preenchimento de formato. Legível de 24px
a 40px e usada em três lugares: o canto superior esquerdo da capa, a faixa do
app ao lado do nome, e o topo do formulário no celular. É uma marca provisória
do produto — quando existir logo da empresa, ela substitui esta em todos os usos.

A tela de login é a capa do talão partida em **60/40**: à esquerda, a folha
carbonada (fundo azul de via) com o desenho técnico da rede impresso em traço de
1.25px com `vector-effect: non-scaling-stroke` — poste, cabo de drop assentando
no beiral, casa com o equipamento na parede, trena em metros e etiqueta de
patrimônio; à direita, o formulário centrado nas duas direções sobre o papel.
A capa some abaixo de `md` e a marca sobe para o topo do formulário: no celular
não há espaço para duas folhas.

### Via carbonada

Folha branca de verdade sobre o papel: fundo `#fff`, borda de 1px azul de via, sombra Levita, topo e base tracejados. Imprime com `clip-path: inset(0 100% 0 0)` → `inset(0)` em 280ms, carimbando sete linhas: operação, OS, item, quantidade, condição, destino e horário. O horário é capturado no instante da confirmação, nunca recalculado no render — a via não reescreve a própria hora. Respeita `prefers-reduced-motion`.

### Navegação

Faixa fixa com o nome do sistema em versalete condensado, a tela atual em cinza e o índice abaixo. Aba ativa: `border-bottom: 2px` azul de via e texto azul; inativa: borda transparente e texto grafite 70, com borda régua forte no hover. Rola na horizontal no celular. A navegação é o índice do talão, não um menu de site.

### Ledger

Tabela de dados com cabeçalho em versalete de 11px e régua de 1px em grafite embaixo da linha de cabeçalho; divisórias em régua; hover de linha em `#e6e3d9`; nenhuma borda externa, nenhum raio, sombra nenhuma.

## Do's and Don'ts

### Do:

- **Do** usar o versalete condensado de 11px para todo rótulo e toda aba.
- **Do** manter fio de interface em 3:1 ou mais e texto em 4.5:1 ou mais contra o papel — sob sol, o fio some primeiro.
- **Do** usar o azul de via em um único elemento por tela.
- **Do** colocar o número que decide em `3rem` com algarismo tabular, e nenhum outro número grande na tela.
- **Do** marcar estado com selo que traz a palavra, não só a cor.
- **Do** deixar a tabela rolar no celular em vez de espremer a coluna.
- **Do** usar só os tamanhos do ramp (11 / 12 / 14 / 18 / 48px): tamanho fora da rampa é um passo novo e precisa entrar aqui antes de existir no código.
- **Do** promover a cor de um componente a token antes de repetir o literal.

### Don't:

- **Don't** criar card com sombra em repouso; a divisão é régua impressa.
- **Don't** usar rounded-lg, cápsula ou círculo como forma de container.
- **Don't** usar o azul de via em rótulo de texto corrido, nem o vermelho em item saudável.
- **Don't** usar monoespaçado em rótulo ou em texto comum — só em dado, medida e identificador.
- **Don't** adicionar um segundo momento animado; a via é o único.
- **Don't** usar vidro, blur, gradiente ou borda lateral colorida de mais de 1px.
- **Don't** esconder o saldo quando a consulta falha: afirmar "saldo zerado" sobre um erro é mentira, e esta tela é a que promete honestidade de estado.
