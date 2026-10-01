Fontes self-hosted neste diretório
==================================

archivo-latin.woff2
  Família:  Archivo (Omnibus-Type)
  Versão:   variável — wght 100–1000, wdth 62–125
  Subset:   latin (cobre o português do Brasil, inclusive ç, ã, é, ó, â)
  Origem:   Google Fonts, via fonts.googleapis.com/css2 (woff2)
  Licença:  SIL Open Font License 1.1
  Uso no projeto: voz do sistema. Rótulos e títulos em versalete condensado
  (wdth 78%), texto em wdth 92%. Nenhum outro papel.

azeret-mono-latin.woff2
  Família:  Azeret Mono (Displaay)
  Versão:   variável — wght 100–900
  Subset:   latin
  Origem:   Google Fonts, via fonts.googleapis.com/css2 (woff2)
  Licença:  SIL Open Font License 1.1
  Uso no projeto: o valor preenchido à mão e todo dado medido — serial, MAC,
  placa, SKU, CNPJ, número de OS, quantidade, horário.

Ambas as famílias são atribuídas via @font-face em apps/web/src/index.css e
carregadas do próprio projeto: nenhum arquivo de fonte vem de CDN em runtime,
para o app funcionar offline no celular do técnico.

Nenhum arquivo aqui foi modificado; são os woff2 originais do Google Fonts.
