# HANDOFF backend - pokemon-generation

Para o agente de frontend. Tudo abaixo foi conferido no dataset publicado (nao so na SPEC).

## Estado

- Dataset publicado: `public/data/atm1.3.0-cobblemon1.7.3-20261012-78568233/` (`current.json` aponta para ele; a pasta `...-20260930-1949ea67` foi removida pelo `write.ts`, padrao do projeto).
- Commits do backend (branch `feature/pokemon-generation`): S0.1 `748cbeba` (docs), B1.1 `64e0b4f1`, B1.2 `11423420`, B1.3 `89c1b8cf`, B2.1 `f7ba7273`, B2.2 `a4d1cf4e`, T1.1 `4bc9dc74`, T1.2 `bdda90a3`.
- Janela quebrada B1.1 -> B2.2: FECHADA. `tests/unit/data/published-schemas.test.ts` e `tests/unit/dataset/join.test.ts` passam de novo (47 testes); `npx vitest run` inteiro verde (88 arquivos / 744 testes, antes dos testes novos de T1). O app e o e2e abrem de novo.
- Portao de nao-regressao do dado (UI ainda intocada): `npm run build` + `npx playwright test` inteiro = 269 testes, 253 ok, 16 pulados (dev-only), 0 falha, 0 flaky: IGUAL a linha de base da S0.1. Os 7 testes visuais de `responsive.spec.ts:186` (14 comparacoes, Home + Charizard) passaram sem atualizar baseline.
- Contrato em `src/data/types.ts` (`GameInfo`, `DatasetManifest.games`, `SpeciesSummary.games`, `EvolutionChainNode.generation`) e `src/data/schemas.ts` (catalogo `.strict()`, `games` e `generation` obrigatorios). Congelado; nao mudar sem voltar ao backend.

## Desvio da SPEC (aprovado pelo orquestrador)

- F2.1 passo 1 foi ANTECIPADO para B1.1 (SPEC revisada em `8cfc236c`): `src/screens/Detail/EvolutionPanel.tsx` ja tem `type ChainNodeView = Omit<EvolutionChainNode, "generation"> & { generation: string | null };`, a prop `node` do `EvoNode` ja e `ChainNodeView` e o no sintetico do fallback (`const node = (dex) => byDex.get(dex) ?? {...}`) ja tem `generation: null`. So tipo, nenhuma mudanca visual. Na F2.1, NAO refazer o passo 1: comecar no passo 2 (`rootGeneration`). Sem isso o `typecheck` falhava em B1.1.
- Nenhum outro desvio da secao 5.

## Contrato real

### `dataset-manifest.json`

- `games: GameInfo[]` = ULTIMA chave (depois de `files`). `GameInfo = { id: number; slug: string; name: string }`; `id` = id do version-group da PokeAPI; ordem cronologica (version-group.order, desempate por id). `name` e nome proprio, igual em PT e EN (fonte: `version.names` em ingles da PokeAPI, unidos por " / "); mostrar como dado (`{g.name}`), sem i18n.
- 22 jogos, nesta ordem (valor publicado):

| id | slug | name |
|---|---|---|
| 1 | red-blue | Red / Blue |
| 2 | yellow | Yellow |
| 3 | gold-silver | Gold / Silver |
| 4 | crystal | Crystal |
| 5 | ruby-sapphire | Ruby / Sapphire |
| 6 | emerald | Emerald |
| 7 | firered-leafgreen | FireRed / LeafGreen |
| 8 | diamond-pearl | Diamond / Pearl |
| 9 | platinum | Platinum |
| 10 | heartgold-soulsilver | HeartGold / SoulSilver |
| 11 | black-white | Black / White |
| 14 | black-2-white-2 | Black 2 / White 2 |
| 15 | x-y | X / Y |
| 16 | omega-ruby-alpha-sapphire | Omega Ruby / Alpha Sapphire |
| 17 | sun-moon | Sun / Moon |
| 18 | ultra-sun-ultra-moon | Ultra Sun / Ultra Moon |
| 19 | lets-go-pikachu-lets-go-eevee | Let’s Go, Pikachu! / Let’s Go, Eevee! (apostrofo U+2019, vem da API) |
| 20 | sword-shield | Sword / Shield |
| 23 | brilliant-diamond-shining-pearl | Brilliant Diamond / Shining Pearl |
| 24 | legends-arceus | Legends: Arceus |
| 25 | scarlet-violet | Scarlet / Violet |
| 30 | legends-za | Legends: Z-A |

- `sources` ganhou 1 entrada (12 no total, as 11 antigas sao prefixo): `{"file":"tools/dataset/curated/pokeapi-game-availability.json","sizeBytes":46877,"mtime":"2026-10-12T05:08:37.859Z"}` (tamanho do JSON compacto e data da captura: canonica, igual em qualquer PC).
- Carregado no boot pelo `loadManifest` existente (`useDatasetStore().manifest`); ja e precacheado. Nenhum arquivo novo, nenhum loader novo.

### `SpeciesSummary.games` (species-index.json e species/<dex>.json)

- `games: number[] | null` = ULTIMA chave do resumo (logo depois de `artworkId`; na ficha vem pelo spread, entao fica entre `artworkId` e `pokedexText`).
- Ids de `manifest.games` na ORDEM do catalogo, sem duplicata. `null` = so no pack (exatamente 9901 Piglich e 9902 Creepyon, `generation: "custom"`). `[]` = oficial sem jogo: ZERO especies hoje (todas as 1025 oficiais tem >= 1 jogo), mas o tipo admite.
- Exemplos publicados: 41 Zubat `[1,2,3,4,5,6,7,8,9,10,14,15,16,17,18,19,20,23,24,30]`; 169 Crobat `[3,4,5,6,8,9,10,14,15,16,17,18,20,23,24,30]` (sem 7); 236 Tyrogue `[3,4,10,20,25]`; 106 Hitmonlee `[1,2,3,4,7,10,19,20,25]`; 6 Charizard `[1,2,3,4,7,10,15,19,20,25,30]`; 9901 e 9902 `null`.
- Especies por jogo (indice publicado): 151, 151, 251, 251, 202, 202, 151 (FRLG = exatamente 1..151), 151, 210, 256, 156, 301, 457, 211, 302, 403, 153, 584, 151, 242, 664, 364 (na ordem da tabela).

### `EvolutionChainNode.generation` (species/<dex>.json)

- `generation: string` em TODO no de `evolutionChain.nodes` (mesmo valor de `SpeciesSummary.generation` da especie do no; 2316 nos conferidos, 0 diferencas). Chega junto com a ficha (nao depende do `speciesIndex`).
- Exemplo (ficha 236): `236 tyrogue gen2`, `107 hitmonchan gen1`, `106 hitmonlee gen1`, `237 hitmontop gen2` (raiz 236). Ficha 41: `41 gen1`, `42 gen1`, `169 gen2`.

## Numeros

- Bytes cru (antes -> depois): `species-index.json` 293.243 -> 319.691 (+26.448); `dataset-manifest.json` 2.134 -> 3.561 (+1.427); `current.json` 71 -> 68 (so fim de linha: o arquivo do HEAD anterior estava em CRLF no working tree, o pipeline escreve LF); `type-chart.json` 3.832 (igual).
- Gzip do precache (metodo SPEC 2.3, `zlib.gzipSync` padrao): 88 + 1.434 + 38.336 + 547 = **40.405** bytes (linha de base 37.751; +2.654; teto 47.991).
- sha256 do `species-index.json` publicado: `3e65b9dc1a198016fd445c9e0d70bb07b330505ad56ac84d9f1627b9a0d7aa96`.
- Auditoria no publicado: `checks 51146, especies 1027, divergencias {}` (46.768 + 4.378 novos). Rodada 7 no `tools/dataset/audit/AUDIT_REPORT.md`.
- "So acrescimos" contra o publicado anterior: mesma lista de 1044 arquivos; 15 arquivos fora de indice/fichas/manifest byte a byte iguais; cada entrada do indice sem `games` identica e na mesma ordem; cada ficha sem `games` e sem `nodes[].generation` identica; manifest igual sem `datasetVersion`/`generatedAt`/`sources`/`games`, `sources` antigo = prefixo; geracoes 151/100/135/107/156/72/86/2/89/7/120/2.
- Determinismo: 2a execucao no mesmo dia = mesma `datasetVersion` e os 1044 arquivos iguais (manifest so difere em `generatedAt`).

## Testes do backend (T1.1, T1.2)

- Novos: `tests/unit/dataset/game-availability.test.ts`, `tests/unit/data/precache-budget.test.ts`; blocos novos em `audit.test.ts`, `join.test.ts`, `published-schemas.test.ts` (lista no `CHECKLIST_MANUAL_pokemon-generation.md`, secao Backend).
- Suite inteira depois de T1.2: 90 arquivos / 772 testes. 3 rodadas: 2 verdes, 1 com falha no teste de TEMPO preexistente `tests/unit/domain/bait.test.ts:106` (pior `recommendBerries` 5,17 ms > 5 ms sob carga paralela; isolado 3/3 verde; nao le campo novo). Registrado em Bugs do checklist, assert nao mexido. Se aparecer no T1.5, e esse flake, nao regressao do frontend.
- Cobertura: global 94,37 / 87,93; `tools/dataset/src` 93,84 / 85,18.

## Linha de base da S0.1 (para comparar no fim)

- vitest: 88 arquivos, 744 testes, 0 falhas. Cobertura linhas/branches: global 94,39/87,76; `src/screens` 94,73/88,05; `tools/dataset/src` 93,86/84,67.
- e2e (build + preview): 269 = 253 ok + 16 pulados (dev-only), 0 falha, 0 flaky. NENHUMA falha preexistente: qualquer falha nova e regressao.
- Fato de ambiente: o `prebuild` (`gen:assets`) regrava `src/assets/types/*.svg` e `src/styles/types.generated.css` so com fim de linha LF (sem diff de conteudo). Restaurar com `git checkout -- src/assets/types src/styles/types.generated.css` depois de cada build; nao commitar.

## Recorte curado e script

- `tools/dataset/curated/pokeapi-game-availability.json` (versionado): capturado em 2026-10-12T05:08:37.859Z, 32 version-groups, 35 Pokedexes, 1025 especies, 123 URLs. Recapturar SO a mao: `npm run dataset:snapshot-games [-- --fresh]` (o build nunca usa rede para jogos).
