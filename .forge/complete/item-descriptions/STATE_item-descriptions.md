---
feature: item-descriptions
stage: complete
status: done
language: pt-BR
branch: feature/item-descriptions
mode: quick
top_model: opus
running_agent: none
baselines:
  IDEA: { commit: 753364a6, deps: [tools/dataset/src/items/catalog.ts, tools/dataset/src/lang.ts, data-source/atm-1.3.0/**] }
updated: 2026-09-28
---
## 2026-09-28 - quick iniciada
- Diagnostico do orquestrador: 605/949 sem descricao; ~320 recuperaveis de chaves de lang ignoradas; 283 sem texto no jogo (lista em MISSING_ITEMS). Decisoes na IDEA.

## 2026-09-28 - pipeline D1/D2 verdes (e4920b1c, 0399be87, 5c5c86ef)
- npm ci e cache aquecido (Pontin autorizou). Ids do catalogo iguais (949); nulos 605 -> 286 so com o jogo. `cobblemon:medicinal_brew` faltava na lista (so tinha texto de advancement): adicionado, lista agora 284.
- Textos minecraft (110) prontos no scratchpad; amostra mostrou erros (osso "coleira de caes", PT "suporte de fermentacao"): revisor Opus independente conferindo todos.

## 2026-09-28 - D1b, D3, D5, D6, D7 verdes; D4 em andamento
- Commits: D5 2fca6667 (texturas animadas, 1o quadro), D1b 00d74ff4 (`tooltip.<ns>.<path>`), textos 05245de0 + revisao 229143d5 (135/174 corrigidos) + D7 89fc218f (284 textos, 110 minecraft revisados com 93/110 corrigidos, nomes PT do jogo), D6 9b127dea + da8dd7b0 (lang do kubejs por cima dos jars: 111 nomes de item PT, 10 golpes, 54 desc golpe, 90 desc especie, 36 desc habilidade; EN sem mudanca).
- Bug antigo anotado (fora do escopo): `mega_showdown:darkinium-z` e `mimikium-z` (hifen) sao itens fantasma vindos de erro de digitacao em `kubejs/data/rctmod/trainers/team_allthemods_drackion.json`; os reais sao `_z`. Mesmo caso de `karrablast`/`shelmet`.

## 2026-09-28 - D4 verde, feature concluida
- 6f121909 auditoria le o lang do kubejs; 9ba1f7ea dataset `atm1.3.0-cobblemon1.7.3-20260928-f3c842d2` publicado; 27a70e63/aebe6b74 checklist, manual e prints (ui-refs/D4_*).
- 949 itens / 797 golpes / 1027 especies, ids iguais. Descricoes: 665 do jogo + 282 curadas; so `karrablast` e `shelmet` sem descricao (ids quebrados antigos). Auditoria 0 divergencias em 42992 checks; vitest 65 arquivos / 483 testes; typecheck, lint e build ok; smoke PT/EN de 5 itens sem erro de console.
- Pendencias fora do escopo: itens `minecraft:` com nome PT em ingles e sem textura; itens fantasma `darkinium-z`/`mimikium-z`/`karrablast`/`shelmet`; Playwright do projeto pede chromium_headless_shell-1243 (neste PC ha 1234; rodar `npx playwright install` antes do e2e).
- Sem push (so com pedido do Pontin).
