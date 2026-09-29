---
feature: pwa-auto-update
stage: complete
status: done
language: pt-BR
branch: fix/pwa-auto-update
mode: quick
top_model: opus
running_agent: none
baselines:
  IDEA: { commit: d21bbbc2, deps: [vite.config.ts, src/pwa/**, tests/e2e/pwa-offline.spec.ts] }
updated: 2026-09-28
---
## 2026-09-28 - quick iniciada (pedido do Pontin: sem botao Atualizar)

## 2026-09-28 21:20 - feature concluida (U1..U11 verdes)
- PWA autoUpdate sem botao (dfac0441, 03ba0d0a); cache busting de texturas (99d6035a); descricoes sem obtencao (009c1b55); Como obter sempre preenchido: receitas de todos os mods (4ebd8568), loot (9eb3b1c5), fontes extras (700deaeb), catalogo sem fantasmas + unobtainable (be290046), estruturas reais (262d2dd5); nomes e texturas vanilla (d11b8a16); frontend (9e5cf387, 5faaff47, 0bb335d3, 7b08a3b4); versao do dataset por conteudo + current.json no-cache (9e83d40c, 5fe343e1); dataset `atm1.3.0-cobblemon1.7.3-20260929-1a7afcba` (d3e79e0e).
- Testes: auditoria 0 divergencias (43102); vitest 79 arquivos / 618; e2e completo 230 verdes no U6 + reteste U11 dos arquivos ligados ao dataset. Sem push.
- Pendencias menores fora do escopo: rotulos de loot de estrutura em ingles humanizado; rota `the_bumblezone:ore_balloon` (feature nbt) nao implementada; ~12 descricoes oficiais do jogo citam obtencao; loot de grupos de treinador (grupo -> treinador so no codigo do rctmod).
