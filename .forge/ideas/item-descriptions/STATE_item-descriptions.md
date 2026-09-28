---
feature: item-descriptions
stage: impl
status: in-progress
language: pt-BR
branch: feature/item-descriptions
mode: quick
top_model: opus
running_agent: textos mods (Sonnet, 174 ids, desde 15:41); revisor minecraft (Opus, desde 15:56)
baselines:
  IDEA: { commit: 753364a6, deps: [tools/dataset/src/items/catalog.ts, tools/dataset/src/lang.ts, data-source/atm-1.3.0/**] }
updated: 2026-09-28
---
## 2026-09-28 - quick iniciada
- Diagnostico do orquestrador: 605/949 sem descricao; ~320 recuperaveis de chaves de lang ignoradas; 283 sem texto no jogo (lista em MISSING_ITEMS). Decisoes na IDEA.

## 2026-09-28 - pipeline D1/D2 verdes (e4920b1c, 0399be87, 5c5c86ef)
- npm ci e cache aquecido (Pontin autorizou). Ids do catalogo iguais (949); nulos 605 -> 286 so com o jogo. `cobblemon:medicinal_brew` faltava na lista (so tinha texto de advancement): adicionado, lista agora 284.
- Textos minecraft (110) prontos no scratchpad; amostra mostrou erros (osso "coleira de caes", PT "suporte de fermentacao"): revisor Opus independente conferindo todos.
