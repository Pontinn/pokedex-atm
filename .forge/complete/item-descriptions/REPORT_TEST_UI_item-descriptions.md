# Relatorio de testes UI: item-descriptions (2026-09-28)

Gravado pelo orquestrador a partir do retorno do agente de testes (o harness bloqueou a escrita pelo agente). Headless, sem slowMo, sem sleeps. Chromium do Playwright 1243 instalado com autorizacao do Pontin.

## Suite e2e completa
18 arquivos, dev (`PW_DEV=1`, um arquivo por vez) + producao (build + preview) para pwa-offline.
TOTAL: 218 testes, 215 passaram, 3 falharam, 0 pulados.

| Arquivo | Resultado |
|---|---|
| balls | 7/7 |
| capture | 8/8 |
| captured | 6/6 |
| compare | 8/9 (F1) |
| detail | 46/46 |
| dex | 12/12 |
| home | 24/24 |
| item | 15/16 (F2) |
| items | 7/7 |
| navigation | 2/2 |
| perf | 2/2 |
| responsive | 18/18 (14 baselines de tema OK) |
| settings | 14/14 |
| shell | 15/15 |
| sync | 15/15 |
| team-history | 1/1 |
| trainers | 10/11 (F3) |
| pwa-offline (producao) | 5/5 |

## Falhas
- **F1** `compare.spec.ts:66` "swap keeps scroll": scrollTop diff > 2 (3/3 com repeat). Causa provavel: scroll suave (`#main` scroll-behavior: smooth), a mesma fragilidade ja corrigida em `detail.spec.ts` (HANDOFF_tests.md, "Fragilidade #3") e nunca levada para este arquivo. Arquivos do teste e da tela sem mudanca nesta branch. Low, pre-existente (passou na suite de 2026-09-27 em outro PC).
- **F2** `item.spec.ts:153` "Back restores tab, scroll and open rows": timeout esperando scrollTop convergir (3/3). Mesma causa e mesma prova de nao-regressao. Low, pre-existente.
- **F3** `trainers.spec.ts:172` "accordion shows the full team, spawn item and bag": esperava "Rocha Arenosa", recebeu "Rocha Lisa" (`cobblemon:smooth_rock`, gym_leader_roark_0395). Consequencia correta do D6 (nome PT do kubejs). String fixa no teste (linha 183) desatualizada. Medium (bloqueia o teste, nao o produto).

## Smoke extra (12/12, 0 erros de console, expectNoOverlap em todas)
- Itens: insignia com textura e `minecraft:bone` (icone de categoria), descricao visivel, sem overflow em 1280 e 390 px, PT e EN.
- Pokebolas: "Grande Bola"/"Great Ball", "Bola Cronômetro"/"Timer Ball".
- Charizard: "Hiper-Raio"/"Hyper Beam". Archaludon: "Vigor"/"Stamina". Flabébé: nome acentuado.
- Prints: `ui-refs/T_*.png` (commit 6ad502b3).

## Conclusao
Nenhuma regressao de produto. F3 precisa de ajuste do teste; F1/F2 sao fragilidade de teste pre-existente.
