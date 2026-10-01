# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Técnico de campo (usuário primário):** opera do banco do veículo, pelo celular, muitas vezes com uma mão só e sob luz do sol. Precisa ver o que há no próprio carro e registrar o que consumiu ou devolveu, sem fricção e sem depender de papel.
- **Estoquista:** trabalha no almoxarifado central, em desktop, com teclado e lotes grandes. Recebe lote de equipamentos (bipagem de serial/MAC), dá entrada de insumos fracionados em metros e distribui para os carros.
- **Administrador:** cadastros, contas de usuário e visão geral. Perfil com acesso total, uso esporádico.

## Product Purpose

Centralizar o controle de entradas, saídas e devoluções de insumos e ativos de provedores de internet de pequeno porte, garantindo rastreabilidade total do ciclo de vida do material — do almoxarifado central ao carro do técnico. Sucesso significa: ninguém precisa perguntar "onde está aquela ONU?", e nenhum material aparece como baixado sem rastro de quem, quando, em qual OS e para onde foi.

## Positioning

Rastreabilidade item a item (serial/MAC) combinada com saldo por local em tempo real e auditoria imutável de toda movimentação. O carro do técnico é um local de estoque de primeira classe, não um palpite: cada item tem dono, condição e histórico.

## Operating Context

- O carro é um almoxarifado móvel; o técnico vê o saldo do próprio veículo e o do almoxarifado central.
- O trabalho é marcado por OS/cliente: toda baixa e devolução referencia um número de OS, preservado na devolução.
- Equipamentos ativos entram em lote por bipagem de serial e MAC; insumos de cabo/fibra entram fracionados em metros por pacote ou caixa.
- Devoluções chegam em três condições: disponível, com defeito, em manutenção.
- Feedback é imediato e no local: o técnico confirma a operação na hora, sem segunda etapa.
- Sessão sobrevive a reload (access em memória + refresh em cookie httpOnly), então recarregar a página no meio do trabalho não desloga ninguém.

## Capabilities and Constraints

- Três perfis com permissões distintas: ADMIN, ESTOQUISTA, TECNICO. O técnico só registra baixa e devolução; entrada e transferência são do estoquista/admin.
- Regras de negócio invioláveis: unicidade de serial e MAC (RN-01), bloqueio de saldo negativo na origem de forma atômica (RN-02), rastreabilidade de ferramenta de alto valor (RN-03).
- Consulta de saldo e dashboard devem responder em menos de 200ms.
- O histórico de movimentações é limitado a 100 registros por consulta.
- Toast/erro de API chega como `message` em JSON; conflito de unicidade e saldo insuficiente chegam como 409/400.
- Stack existente e já em produção: React 19, Vite 6, TailwindCSS 3, TanStack Query 5, React Router 7, pacote de tipos compartilhado `@isp/shared` com enums e rótulos em pt-BR.

## Brand Commitments

Nome "ISP Inventory" e a interface em português do Brasil devem ser preservados. **Não há identidade visual definida** (confirmado pelo usuário): não existe logo, cor oficial nem fonte de marca a respeitar. Nenhum nome, selo ou marca de terceiro pode ser inventado.

## Evidence on Hand

- Código e dados reais do projeto (`apps/web`, `apps/api`, seed com 3 usuários e movimentações de exemplo).
- Evidências ausentes e não fabricáveis: logo, fotos, depoimentos, métricas de uso, studies de caso, print de referência visual.
- Sem usuário Observe/telemetria instrumentada até o momento.

## Product Principles

1. **O carro é o centro.** Toda decisão de tela parte do técnico em pé ao lado do veículo, não do gestor na mesa.
2. **Um toque, um registro.** Confirmar uma movimentação é uma ação, não um fluxo de três passos.
3. **Rastro antes de número.** Antes de qualquer valor de saldo, a interface mostra quem, quando e por quê.
4. **Português e contexto local.** Rótulos do domínio (OS, lote, serial, comodato) são a voz do produto; nada de inglês decorativo.
5. **Honestidade no estado.** Saldo, condição e ser sempre visíveis; nada de valor que o sistema não consiga provar.

## Accessibility & Inclusion

Uso em campo com uma mão só, sob sol forte e às vezes com luvas: alvos de toque grandes, contraste alto para leitura à distância, sem depender apenas de cor para diferenciar estado, e foco visível para uso em desktop por estoquista e administrador.
