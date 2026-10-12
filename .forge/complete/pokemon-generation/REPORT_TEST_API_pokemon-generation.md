# REPORT TEST API - pokemon-generation (contrato do dataset)

Data: 2026-10-12. Branch `feature/pokemon-generation`, HEAD `813a8521`. Executado por `forge-test` (Playwright 1.63 headless, scripts Node apagados depois). O harness bloqueou a escrita direta deste arquivo; o conteudo foi devolvido ao orquestrador, que o persistiu sem alterar os resultados (prosa traduzida para pt-BR).

Nao ha endpoint HTTP neste projeto: a "API" e o dataset publicado em `public/data/atm1.3.0-cobblemon1.7.3-20261012-78568233/`.

## Regressao (suite completa)

- `npx vitest run`: 800 testes, 93 arquivos, 0 falhas (`tests/unit/domain/bait.test.ts:106`, flake de tempo preexistente, passou nesta rodada).
- `npm run test:e2e`: 276 ok, 16 pulados (dev-only), 0 falha, 0 flaky (3,7 min).
- Ambos iguais ao esperado (T1.5) e acima da linha de base S0.1 (744 / 253) so pelos testes novos.

## Contrato do dataset

| # | Checagem | Resultado | Medido |
|---|---|---|---|
| a1 | species-index tem 1027 especies | PASS | 1027 |
| a2 | toda entrada tem `generation` (string) | PASS | 1027/1027 |
| a3 | toda entrada tem `games` como array de inteiros ou null | PASS | 1027/1027 |
| a4 | especies com jogo id 7 (FireRed / LeafGreen) | PASS | 151 |
| a5 | id 3 (Gold / Silver) | PASS | 251 |
| a6 | id 5 (Ruby / Sapphire) | PASS | 202 |
| a7 | 9901 e 9902 com `games` null, e somente elas | PASS | [9901, 9902] |
| a8 | especies oficiais com `games` = [] | info | 0 |
| b1 | nos de species/41 trazem `generation` | PASS | Zubat gen1, Golbat gen1, Crobat gen2 |
| b2 | Crobat (169) e gen2 | PASS | gen2 |
| b3 | Tyrogue: Hitmonlee e Hitmonchan gen1, Hitmontop gen2 | PASS | 236 gen2, 106 gen1, 107 gen1, 237 gen2 |
| b4 | Pichu raiz gen2, Pikachu e Raichu gen1 | PASS | 172 gen2, 25 gen1, 26 gen1 |
| c1 | catalogo `games` do manifest com 22 entradas | PASS | 22 |
| c2 | ordem cronologica | PASS | ids crescentes, nao contiguos (1..11, 14..20, 23..25, 30): ids de version-group da PokeAPI; de red-blue a legends-za |
| c3 | entrada em `sources` para o recorte da PokeAPI | PASS | `tools/dataset/curated/pokeapi-game-availability.json`, 46.877 bytes |
| d1 | `current.json` aponta para a versao nova, unica pasta `atm*` | PASS | `...-20261012-78568233` |
| e1 | `dist/sw.js` precacheia so a versao nova | PASS | manifest, species-index e type-chart da versao nova + `current.json`; nenhum `1949ea67` |
| f1 | soma gzip dos arquivos precacheados | PASS | 88 + 1.434 + 38.336 + 547 = 40.405 (+2.654 sobre 37.751; teto 47.991) |
| g1 | sonda de vazamento (token, key, bearer, caminhos locais) em `public/data` e `tools/dataset/curated` | PASS | 0 ocorrencias reais |

Nota da sonda: o regex amplo so bateu em texto do jogo (itens "Secret", "bearer" no texto da especie 198, "secret" nas especies 151 e 165), falsos positivos. O travessao aparece em 35 arquivos do dataset (texto de descricao do jogo), mesma contagem de antes da feature (conferido em `748cbeba^`); nao aparece em `curated`, `species-index.json` nem `dataset-manifest.json`.

## Achados

Nenhum (Critical, High, Medium ou Low).
