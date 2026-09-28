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

## Correcoes (2026-09-28)
Agente forge-imp-frontend. So arquivos de teste; nenhum bug de produto. Dev (`PW_DEV=1 PW_PORT=4178`, `--workers=1`), headless, sem slowMo, sem sleeps.

- **F3** `0f3c3577` test(e2e): expect kubejs PT name Rocha Lisa for smooth_rock in trainers spec. Os e2e usam strings fixas (nao leem o dataset), entao so a string mudou. Diff de todos os nomes PT/EN (items, moves, abilities, balls) entre o dataset antigo (20260927-1344fc8b) e o novo: 217 mudancas; grep em `tests/` so achou esta expectativa. `tests/fixtures/rules-storage/balls.json` tem nomes antigos, mas e fixture congelada, auto consistente, sem assercao sobre esses nomes; `item-descriptions.test.ts` usa "Estamina"/"Bola Grande" como entrada sintetica. trainers.spec 11/11.
- **F1** `8d0a5d26` test(e2e): stop smooth scroll flake in compare swap keeps scroll. Evidencia: `#main` instrumentado, nenhuma chamada de scroll do app e scrollHeight constante (565); depois do `locator.click()` no Trocar lados o `#main` anima 45 -> 41 -> 19 (~1 s). Com settle + `page.mouse.click` no centro: 45 -> 45 em 3/3. `--repeat-each=5`: 5/5; compare.spec 9/9.
- **F2** `7b0d8399` test(e2e): stop smooth scroll flake in item Back restores scroll. Evidencia: os `locator.click()` na aba TM e na linha do Terremoto animam o `#main` (3 -> 151, 185 -> 533) e a transicao de abrir `.desc-wrap` cresce a pagina (scrollHeight 7558 -> 7565, scrollTop 2633 -> 2640) depois do teste ler `saved`; o app salva 2640 e restaura 2640 exato. Correcao: alvo levado a vista com `behavior: "instant"`, settle, clique de mouse cru, settle antes de medir. `--repeat-each=5`: 5/5; item.spec 16/16.

Lint e typecheck verdes.
