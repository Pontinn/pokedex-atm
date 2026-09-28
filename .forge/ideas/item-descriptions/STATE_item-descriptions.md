---
feature: item-descriptions
stage: impl
status: in-progress
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
