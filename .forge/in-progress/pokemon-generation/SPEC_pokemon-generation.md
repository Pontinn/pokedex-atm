---
feature: pokemon-generation
language: pt-BR
generated: 2026-10-12
stack: React 19 + TypeScript + Vite 6 PWA; dataset pipeline Node 24 + tsx; vitest + Playwright
status: spec
prd_source: PRD_pokemon-generation.md @ 30137dd92cd3f1605155a9ec1d4e9ef4ea5b94f9
---

# SPEC - pokemon-generation (selo de geracao no card, no Hero e em cada estagio da cadeia; filtro e painel de jogos principais)

Desenho tecnico (COMO) e plano executavel. Escrito para agentes de implementacao com contexto limpo que terao so este SPEC, o PRD (rev 3), o CONTEXT e o UISPEC. Todo caminho a MODIFICAR foi conferido no disco em 2026-10-12; toda linha citada foi conferida por Read/Grep no HEAD `979fc78f`. Arquivos marcados "criar" ainda nao existem. Os numeros de jogos e de bytes da secao 2 e 5 vieram de um prototipo da regra rodado em 2026-10-12 contra a PokeAPI viva (121 GETs, cache no scratchpad do agente de SPEC, nada versionado); os testes DERIVAM tudo do recorte curado e do pack, nunca copiam estes numeros.

Convencoes de leitura e regras fixas:
- `ROOT` = `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex` (as listas **Files** trazem sempre o caminho absoluto completo).
- `FEATURE_DIR` = `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/pokemon-generation` (se o orquestrador mover a pasta para `.forge/in-progress/pokemon-generation`, use a pasta nova; os nomes de arquivo nao mudam).
- Identificadores de codigo em INGLES (camelCase/PascalCase; classes CSS, `data-*` e chaves JSON em ingles), espelhando o projeto (CONTEXT `code_identifier_language: en`). Comentarios de codigo em pt-BR sem acento. Texto de UI so em `src/i18n/messages/*.ts` (PT com acento, EN).
- PROIBIDO o caractere travessao (em dash, U+2014) em qualquer texto gerado (codigo, comentario, string, commit, i18n, JSON do recorte). O lint do projeto (`eslint.config.*`, regra do EM_DASH) ja rejeita no codigo; no JSON e no Markdown conferir com `git grep -nP "\x{2014}"`.
- Commits: Conventional Commits em pt-BR sem acento, no estilo do `git log` (`feat(data): ...`, `feat(dex): ...`, `test(e2e): ...`), um commit atomico por feature, SEM nenhuma linha `Co-Authored-By` (regra do Pontin, vence qualquer outra instrucao). Nunca `git push` nem merge sem o Pontin autorizar. Todo artefato `.forge` e versionado (STATE, CHECKLIST, HANDOFF, capturas `after-*`).
- Playwright SEMPRE headless, sem `slowMo`, sem `waitForTimeout`/sleep (auto-wait, `expect.poll`, `settle`) (memoria do projeto `playwright-fast`, vence a regra global).
- ESCOPO FECHADO (Pontin: "nao interfira em nada q foi feito nem brake nada"): so o que esta na IDEA secao 2 e no PRD. A unica mudanca de comportamento existente e a saida do selo de raridade do card (Pokedex e Capturados). Nenhuma refatoracao incidental. Teste existente so muda no assert diretamente afetado (lista exata na secao 2.7); nenhum assert e afrouxado.
- Nenhum agente roda mais de 1h seguida (regra do Pontin): cada feature e pequena e deixa o estado no disco (commit + checklist), para um agente novo continuar do disco.

---

## 1. Baseline (ancora de drift)

- `HEAD`: `979fc78fced0785e969b306da38f518d489ddd00` (branch `feature/pokemon-generation`; so artefatos `.forge` acima de `main` `b7ae68d7`). Ancora de CODIGO: `979fc78f`; os commits seguintes ate `228e7ed3` so tocaram `.forge/` (SPEC/UISPEC/STATE/CHECKLIST), nenhum arquivo de codigo mudou..
- PRD: `FEATURE_DIR/PRD_pokemon-generation.md` = `30137dd92cd3f1605155a9ec1d4e9ef4ea5b94f9` (rev 3)
- CONTEXT: `FEATURE_DIR/CONTEXT_pokemon-generation.md` = `b16864921badb7ad2c37f2f183af29f1625a9253`
- UISPEC: `FEATURE_DIR/UISPEC_pokemon-generation.md` = `11539eed64cc51c3e75a4a7ab312ce2895cc2444` (revisado apos a revisao da SPEC: D1/D2 incorporados)
- IDEA: `FEATURE_DIR/IDEA_pokemon-generation.md` = `7b81d65ab33a889f056cd3b83e826720a485295e`
- LESSONS: `ROOT/.forge/LESSONS.md` = `bf8e65ddd5f9baf595b5b618b206ef8136f8ae39`

Arquivos de codigo de que este SPEC depende (`git hash-object`, 12 chars, working tree = HEAD):

| arquivo (relativo a ROOT) | hash |
|---|---|
| src/data/types.ts | 2445067397b8 |
| src/data/schemas.ts | a7b20fd16613 |
| src/navigation/types.ts | 894b64047e17 |
| src/state/dataset-store.ts | c67f0ced008a |
| src/screens/Dex/PokemonCard.tsx | 4fe29da94b56 |
| src/screens/Dex/DexFilters.tsx | 1886ec2ea037 |
| src/screens/Dex/use-filtered-species.ts | 7207f8ec023e |
| src/screens/Dex/dex.css | a365cd9eebc4 |
| src/screens/Detail/HeroCard.tsx | b61c7bb5003c |
| src/screens/Detail/EvolutionPanel.tsx | 8ed5046bcc66 |
| src/screens/Detail/DetailScreen.tsx | 6a11142b5854 |
| src/screens/Detail/WherePanel.tsx | 024c72a96d55 |
| src/screens/Detail/BestBallPanel.tsx | 1670b6d99f91 |
| src/screens/Detail/FormsPanel.tsx | 8c0eb25478dd |
| src/screens/Detail/StatsCalculator.tsx | eb88712cfe92 |
| src/screens/Detail/detail.css | a6f3a9cb95d2 |
| src/screens/Settings/AboutCard.tsx | bb96d7576fc6 |
| src/components/Badge.tsx | 6a6d5f74fcf7 |
| src/styles/components.css | 20542c615719 |
| src/i18n/messages/dex.ts | b57175bd3a44 |
| src/i18n/messages/detail.ts | c5e8d640cdf5 |
| src/i18n/messages/settings.ts | d7c50978a0e8 |
| tools/dataset/src/species/index-writer.ts | c3515f02f634 |
| tools/dataset/src/species/evolutions.ts | d776090bd462 |
| tools/dataset/src/lib/errors.ts | 284fadf829a5 |
| tools/dataset/src/lib/dataset-version.ts | 475b6a390dac |
| tools/dataset/src/pokeapi/client.ts | e70456f0cb93 |
| tools/dataset/src/index.ts | 3b2a03ea7f5b |
| tools/dataset/README.md | d4cc3a661dea |
| tools/dataset/audit/compare.ts | 7befaa6fb12e |
| tools/dataset/audit/expected.ts | 784529fa11c7 |
| tools/dataset/audit/AUDIT_REPORT.md | 3c5538f1bb43 |
| data-source/README.md | 4255d2dd6d87 |
| README.md | 0192668eb578 |
| package.json | 85d79dc9a66c |
| vite.config.ts | 1e0035bdd4c0 |
| public/data/current.json | 59e428c9cfdf |
| tests/unit/data/published-schemas.test.ts | 49bca7634086 |
| tests/unit/data/loaders.test.ts | 13e91279cc64 |
| tests/unit/dataset/join.test.ts | 23fefa3501b1 |
| tests/unit/dataset/audit.test.ts | d148c86628e1 |
| tests/unit/ui-screens/pokemon-card.test.tsx | 464b105e1035 |
| tests/unit/ui-screens/dex-filter.test.ts | afd801f55c66 |
| tests/unit/ui-screens/dex-screen.test.tsx | 5f3a745fa3b5 |
| tests/unit/ui-screens/search-box.test.tsx | b6c300380bc7 |
| tests/unit/ui-screens/item-screen.test.tsx | cd0ba1d8f652 |
| tests/unit/ui-screens/trainers-screen.test.tsx | d68463bbbc27 |
| tests/unit/domain/search.test.ts | bfa96f7b549e |
| tests/fixtures/rules-storage/species-6.json | 4aa9e9d23e78 |
| tests/fixtures/ui-shell/manifest.json | 256446a38b1c |
| tests/e2e/detail.spec.ts | 22245e47411d |
| tests/e2e/dex.spec.ts | 6aa0658cb21d |
| tests/e2e/responsive.spec.ts | bad04ff822e9 |
| tests/e2e/settings.spec.ts | 0fec4e6b690a |
| tests/e2e/captured.spec.ts | 5bbac71c9fcb |
| tests/e2e/pwa-offline.spec.ts | 92c3ce8b76ac |
| tests/harness/no-overlap.ts | db6c6a3b80c5 |

Medidas de partida (dataset publicado `atm1.3.0-cobblemon1.7.3-20260930-1949ea67`, conferidas em 2026-10-12 com `zlib.gzipSync(readFileSync(f))`, Node 24, nivel padrao): arquivos de dataset no precache do SW (`vite.config.ts:67-68`): `current.json` 71 bytes / 91 gzip; `dataset-manifest.json` 2.134 / 913; `species-index.json` 293.243 / 36.200; `type-chart.json` 3.832 / 547. Soma gzip = **37.751 bytes**. Teto depois da feature = 37.751 + 10.240 = **47.991 bytes** (RNF-01). (O PRD cita 36.163 bytes gzip para o indice: outra ferramenta de gzip; o numero que vale para o teste e o do metodo acima, recalculado na Sprint 0.) 1027 especies (gen1 151, gen2 100, gen3 135, gen4 107, gen5 156, gen6 72, gen7 86, gen7b 2, gen8 89, gen8a 7, gen9 120, custom 2). Auditoria Rodada 6: 46.768 checks, 0 divergencias.

---

## 2. Design Overview

### 2.1 Abordagem em uma frase

Um script manual (`npm run dataset:snapshot-games`) congela da PokeAPI, com o cliente existente (cache + backoff), um recorte cru de version-groups, Pokedexes, versoes e ids de especie em `tools/dataset/curated/pokeapi-game-availability.json`; o build do dataset (sem rede) aplica a regra da IDEA secao 2 sobre esse recorte, publica o catalogo de jogos no `dataset-manifest.json` (`games`), os ids de jogo de cada especie no `species-index.json` e no `species/<dex>.json` (`games`, mesmo campo de `SpeciesSummary`) e a geracao em cada no da cadeia (`evolutionChain.nodes[].generation`); o app mostra o selo de geracao (card, Capturados, Hero, cada estagio), o filtro "Jogo" e o painel "Jogos" lendo so esses campos.

### 2.2 Fluxo de dados

```
PokeAPI viva (so no script manual, nunca no build)
  /version-group?limit=100, /version-group/{name}, /pokedex?limit=100, /pokedex/{name}, /version/{name}, /pokemon-species?limit=10000
     |  collectGameSnapshot (tools/dataset/src/games/snapshot.ts, createPokeapiClient: cache tools/dataset/.cache/pokeapi-games, backoff, concorrencia 6)
     v
tools/dataset/curated/pokeapi-game-availability.json  (VERSIONADO; cru reduzido + origem: api, urls, capturedAt)
     |  build (npm run dataset, sem rede): runWriteStage -> loadGameSnapshot -> deriveGames -> buildGameAvailability -> gamesForSpecies
     v
public/data/<versao nova>/dataset-manifest.json   games: GameInfo[] (catalogo cronologico) + sources[+1 recorte]
public/data/<versao nova>/species-index.json      cada SpeciesSummary + games: number[] | null      (precache do SW)
public/data/<versao nova>/species/<dex>.json      idem (spread do summary) + evolutionChain.nodes[].generation  (runtime CacheFirst)
     |
src/state/dataset-store.ts (manifest + speciesIndex no boot, sem arquivo novo)
  Dex: DexFilters (#f-game) -> filters.game -> filterSpecies;  PokemonCard -> SpeciesBadges variant "card" (Lendario/Mitico + Gen curto)
  Detail: HeroCard -> SpeciesBadges variant "hero" (Lendario/Mitico + Geracao longo + raridade); EvolutionPanel -> EvoNode (evo-gen / evo-gen-diff);
          GamesPanel (detail.games + manifest.games)
  Settings: AboutCard -> InfoLine settings.pokeapi
```

### 2.3 Representacao escolhida e orcamento de peso (RNF-01, RF-45)

**Escolha: ids numericos de version-group da PokeAPI em `SpeciesSummary.games` (indice e ficha) + catalogo `games` dentro do `dataset-manifest.json` (ja precacheado e ja carregado no boot). Nenhum arquivo novo, nenhum ajuste no service worker.**

Medido no prototipo (2026-10-12) sobre o `species-index.json` atual, gzip `zlib.gzipSync` padrao:

| Opcao | indice cru (+bytes) | indice gzip (+bytes) | catalogo | crescimento total gzip do precache |
|---|---|---|---|---|
| **A (escolhida)** `games: [1,2,...]` (id do version-group, ordem cronologica) + catalogo no manifest | +26.448 | +2.136 | manifest +1.427 cru / +526 gzip (22 jogos + 1 entrada em `sources`) | **+2.662** (37.751 -> ~40.413) |
| B `games: ["red-blue",...]` (slug) | +105.969 | +3.587 | idem | ~+4.100 |
| C bitmask `gameMask: number` | +19.205 | +2.226 | idem | ~+2.750, ilegivel e fragil (bit = posicao na lista) |
| D arquivo separado `game-availability.json` precacheado | 0 | 0 | arquivo novo 24.445 cru / 3.942 gzip | ~+4.000, + glob novo no SW + rota nova nos mocks de e2e |

Por que A: menor custo que ainda e legivel e estavel (o id do version-group nao muda se a lista de jogos mudar, ao contrario de indice/bit), juncao por numero (RF-25), o Detail le os jogos da propria ficha (nao depende do indice), e o catalogo no manifest evita arquivo novo no boot: os e2e que mockam `/data/` (`settings.spec.ts:17-23`, `shell.spec.ts:20-28`, `sync.spec.ts`) so servem manifest/indice/type-chart e quebrariam com um arquivo novo de boot (opcao D). Custo medio: 5,81 jogos por especie, maximo 20 (Zubat, Pikachu).

Como medir (fixado): soma de `zlib.gzipSync(readFileSync(f)).length` (Node 24, opcoes padrao) sobre os arquivos de dataset do precache, que sao exatamente `data/current.json` + `data/<datasetVersion>/{dataset-manifest,species-index,type-chart}.json` (`vite.config.ts:67-68`). Linha de base 37.751 (secao 1); teto 47.991. Teste permanente: `tests/unit/data/precache-budget.test.ts` (T1.2), que tambem falha se o glob da linha 68 do `vite.config.ts` mudar sem atualizar a lista do teste.

### 2.4 Geracao nos nos da cadeia (RF-12, RF-16, RF-45)

**Decisao: `generation: string` entra em cada `EvolutionChainNode` (pipeline `buildChain`, `evolutions.ts:159`), nao lookup no `speciesIndex`.** Criterio da IDEA secao 2: o Detail nao pode depender do indice carregado. Com o campo no no, o selo aparece no mesmo render da cadeia (RF-16 sem salto de layout por construcao) e o caso "no sem geracao" (RF-17) fica so no no sintetico do fallback de `EvolutionChainView` (`EvolutionPanel.tsx:190`). Custo: so `species/<dex>.json` (fora do precache, runtime CacheFirst); ~+20 bytes por no. O dataset sera republicado de qualquer forma (jogos), entao a mudanca de contrato nao tem custo extra.

### 2.5 Decisoes-chave

1. **Regra dos jogos (RF-21, RF-22, RF-24), aplicada no build sobre o recorte cru**, constantes nominais em `tools/dataset/src/games/availability.ts`:
   - Pokedex elegivel = `isMainSeries === true` e nome fora de `EXCLUDED_POKEDEXES = ["national", "conquest-gallery"]`.
   - Version-group candidato = nome fora de `EXCLUDED_VERSION_GROUPS = ["red-green-japan", "blue-japan", "champions"]` e com >= 1 Pokedex elegivel em `versionGroup.pokedexes`.
   - **DLC = fusao derivada dos dados**: um candidato cujo conjunto de Pokedexes elegiveis e SUBCONJUNTO PROPRIO do conjunto de outro candidato e descartado (suas Pokedexes ja estao no jogo base). Derivado no prototipo: `the-isle-of-armor` e `the-crown-tundra` -> `sword-shield`; `the-teal-mask` e `the-indigo-disk` -> `scarlet-violet`; `mega-dimension` -> `legends-za` (exatamente as fusoes da IDEA). Conjuntos IGUAIS nao fundem: `red-blue`, `yellow` e `firered-leafgreen` (todos `kanto`), `ruby-sapphire` e `emerald` (`hoenn`), `diamond-pearl` e `brilliant-diamond-shining-pearl` (`original-sinnoh`) ficam jogos separados (RF-22, CA-24).
   - Jogo = `{ id: versionGroup.id, slug: versionGroup.name, name: versions.map(v => v.nameEn).join(" / ") }`, ordenado por `versionGroup.order` (desempate por `id`).
   - Especie disponivel no jogo = id da especie em `species` de qualquer Pokedex elegivel do jogo (uniao, inclui as dexes de DLC do proprio grupo base).
   - Resultado do prototipo (22 jogos, a lista que o teste DERIVA e compara): ver secao 5.3.
2. **Juncao so por numero (RF-25, RF-26, RF-30, RF-51)**: `gamesForSpecies(dex, generation, availability, speciesIds)`:
   - `generation === "custom"`: se `dex` esta em `pokemonSpeciesIds` do recorte -> erro `E_GAMES_CUSTOM_IN_SOURCE` (pack com especie custom colidindo com numero oficial: nunca juntar por acaso); senao `null` ("So no pack").
   - senao, `dex` fora de `pokemonSpeciesIds` -> erro `E_GAMES_NO_SOURCE` (build FALHA, nada publicado: `index.ts:71-74` apaga o staging).
   - senao `availability.get(dex) ?? []` (lista vazia = "Nao aparece nos jogos oficiais", caso defensivo: o prototipo deu 0 especies assim).
3. **Contrato `games: number[] | null` no `SpeciesSummary`** (reuso, nenhum tipo paralelo): como `speciesDetailSchema` faz spread de `summaryShape` (`schemas.ts:167`), a ficha recebe o mesmo campo. `null` = so no pack; `[]` = oficial sem jogo; senao ids na ordem do catalogo. Tipo novo so para o catalogo: `GameInfo`.
4. **Catalogo no manifest** (`DatasetManifest.games: GameInfo[]`, ultima chave depois de `files`): carregado no boot pelo `loadManifest` existente (`dataset-store.ts:35`), disponivel offline (precache), sem loader novo. `ManifestContent` (`dataset-version.ts:12`) herda o campo e o hash da versao passa a cobrir o catalogo.
5. **Origem registrada em 4 lugares (RF-42, RNF-13)**: (a) bloco `source` do proprio JSON (`api`, `capturedAt`, `urls` exatas consultadas, `script`, `license`); (b) secao nova no `tools/dataset/README.md`; (c) entrada nova em `dataset-manifest.json.sources` = `{ file: "tools/dataset/curated/pokeapi-game-availability.json", sizeBytes: Buffer.byteLength(JSON.stringify(snapshot)), mtime: snapshot.source.capturedAt }` (tamanho CANONICO e data da captura, nao o `stat` do arquivo: com `core.autocrlf=true` neste repo o tamanho em disco e o mtime mudariam entre PCs; assim a entrada e identica em qualquer PC); (d) uma linha no `data-source/README.md` dizendo que dado externo ao pack fica em `tools/dataset/curated/` (nao em `data-source/`, que e so do pack; `data-source/atm-1.3.0/MANIFEST.json` NAO muda).
6. **Selo de geracao** (UISPEC secoes 3, 4 e 7): componente `GenerationBadge` sobre `Badge`/`.badge` com a classe nova `badge-gen` (`--secondary-soft` + `--text`). Rotulos pela funcao pura `generationLabel(gen, form, t)`: tabela do RF-05/RF-08 (curto no card e no estagio: "Gen N", "Gen 7 (Let's Go)", "Gen 8 (Arceus)", "Pack"; longo no Hero: "Geração N"/"Generation N" (chave existente `dex.genN`), e os mesmos tres especiais); valor fora da tabela -> `null` (sem selo, nunca erro). O filtro `#f-gen` continua usando `genLabel` (`DexFilters.tsx:30-34`) sem mudanca (RF-18).
7. **`SpeciesBadges` ganha `variant: "card" | "hero"`** (`PokemonCard.tsx:32`): card = Lendario/Mitico + Gen curto (raridade NUNCA no card); hero = Lendario/Mitico + Geracao longa + raridade (ordem: especial, geracao, raridade). Assim o card perde a raridade e o Hero a mantem sem duplicar componente; `RARITY_BADGE` (`PokemonCard.tsx:17`) segue exportado (usado por `WherePanel.tsx:15` e pelo proprio Hero).
8. **Estagio da cadeia: selo EM FLUXO abaixo do nome, nao sobreposto a imagem (DESVIO D1 do UISPEC secao 4/7, ver secao 9).** Motivo verificado: a regra do projeto "Sem sobreposicao de texto" (`tests/harness/no-overlap.ts:1-3`, `img` e controle na linha 30 do `DEFAULT_CONTROL_SELECTORS`) e o teste EXISTENTE `tests/e2e/detail.spec.ts:306-318` (`expectNoOverlap(page, page.locator("#evo-panel"))` para Eevee e Charizard a 360/390/1280, PT e EN) reprovam qualquer texto sobre a `<img>` do sprite; o motivo do overlay no UISPEC ("aparece quando o speciesIndex carregar; overlay nao causa reflow") deixou de existir com a decisao 2.4 (a geracao chega junto com a ficha). Forma: `<span className="evo-label">` envolve `.evo-name` + o selo `badge badge-gen evo-gen` (metricas do selo do card no phone: 9/800, pad 3/6, radius 8, h18); a caixa `.evo` cresce ~22 px de altura (18 + gap 4) no linear e o rotulo vira coluna no ramificado. Destaque (RF-13/RF-14): classe `evo-gen-diff` quando `node.generation !== geracao do no chain.root`, com `outline: 2px solid var(--secondary)` (troca para `var(--primary)` nos temas green, blue e purple, padrao do projeto em `detail.css:86`; purple incluido porque `--secondary` #FF6FB1 da 2,57:1 sobre branco, abaixo de 3:1; DESVIO D2) e nome acessivel `role="img"` + `aria-label` "Geração 2, diferente da base" / "Generation 2, different from the base"; estagio comum tem `aria-label` com o rotulo longo.
9. **Filtro "Jogo"** (RF-35..RF-41; UISPEC secao 4): `<select id="f-game">` irmao de `#f-gen` no mesmo `.filter-row`, logo depois dele; opcoes `dex.all` ("Todos") + um `option` por `manifest.games` (valor `String(id)`, texto `name`); estado `DexFilters.game: number | null` (default `null` em `navigation/types.ts:100`), escrito por `patchFilters({ game })` na entrada da pilha (Voltar restaura como os outros, RF-38). `filterSpecies` ganha `(filters.game ?? null) === null || (s.games !== null && s.games.includes(filters.game))`, E logico com os demais (RF-37). Desktop `.filter-row` passa a `1fr 1fr 1fr 1fr auto`; phone continua `1fr 1fr` (Geracao | Jogo, Evolucao | Ordenar, Status na linha inteira).
10. **Painel "Jogos"** (RF-29..RF-33; UISPEC secao 4): `GamesPanel` logo depois de `WherePanel` (`DetailScreen.tsx:147`), `--i` 7; `BestBallPanel` 7->8, `FormsPanel` 8->9, `CalculatorsPanel` 9->10 (decisao do UISPEC). Estados: catalogo ausente (`manifest` nulo) -> painel nao renderiza (RF-32, sem lista vazia enganosa); `games === null` -> `p.muted` "Só no pack"; `[]` -> `p.muted` "Não aparece nos jogos oficiais"; senao `.kv` com `.k` "Disponível em" + `<ul className="chips games-list">` de `<li className="game-chip" data-game={slug}>` em ordem do catalogo + `<p className="games-note">` (nota da National Dex, so no caso com lista). Lista semantica, todos os itens no DOM, `flex-wrap` (RF-31).
11. **Credito** (RF-52): `InfoLine` nova `settings.pokeapi` (testId `pokeapi`) logo depois de `settings.images` (`AboutCard.tsx:65`); README linhas 29 e 116 ajustadas sem apagar creditos.
12. **Janela quebrada planejada (LESSONS 2026-09-29, CA-36)**: B1.1 torna obrigatorios `SpeciesSummary.games`, `EvolutionChainNode.generation` e `DatasetManifest.games` no zod. De B1.1 ate B2.2 (republicacao): `tests/unit/data/published-schemas.test.ts` (le `public/data/current.json`, linhas 25-26 e 40) FALHA e fica EXCLUIDO; `tests/unit/dataset/join.test.ts` NAO e excluido (roda o pipeline em pasta temporaria, linha 57, e valida o que gera); o app e todo o e2e nao abrem (o loader rejeita o manifest publicado sem `games`) e NAO sao rodados. O Frontend so comeca depois de B2.2 verde. Logo depois de B2.2 (UI ainda intocada), a suite e2e INTEIRA roda e tem de bater com a linha de base da Sprint 0 (portao de nao-regressao do dado).

### 2.6 Convencao de identificadores (obrigatoria)

Ingles. Tipos: `GameInfo` (`src/data/types.ts`); internos do pipeline `GameSnapshot`, `DerivedGame`. Pipeline: `GAME_SNAPSHOT_FILE`, `EXCLUDED_VERSION_GROUPS`, `EXCLUDED_POKEDEXES`, `gameSnapshotSchema`, `loadGameSnapshot`, `deriveGames`, `buildGameAvailability`, `gamesForSpecies`, `gameSnapshotSource`, `collectGameSnapshot`, `GAME_SNAPSHOT_CACHE_DIR`, `parseSnapshotArgs`, `runSnapshotCli`. Erros `E_GAME_SNAPSHOT_MISSING`, `E_GAME_SNAPSHOT_INVALID`, `E_GAMES_NO_SOURCE`, `E_GAMES_CUSTOM_IN_SOURCE`. JSON: `games` (manifest e especie), `generation` (no), `pokemonSpeciesIds`, `versionGroups`, `pokedexes`, `isMainSeries`, `nameEn`, `capturedAt`. App: `generationLabel`, `GenerationBadge`, `GenerationForm`, `gamesOf`, `GamesPanel`, prop `variant` de `SpeciesBadges`, prop `label` de `Badge`, `filters.game`. Classes CSS `badge-gen`, `evo-label`, `evo-gen`, `evo-gen-diff`, `games-panel`, `games-list`, `game-chip`, `games-note`, `games-empty`; ids `#f-game`, `#games-panel`; atributos `data-game`, `data-games`, `data-info="pokeapi"`. Chaves i18n `dex.game`, `dex.genBadge`, `dex.genBadge7b`, `dex.genBadge8a`, `dex.genBadgePack`, `detail.genDiff`, `detail.games`, `games.availableIn`, `games.note`, `games.none`, `games.packOnly`, `settings.pokeapi`. npm script `dataset:snapshot-games`.

### 2.7 Testes existentes afetados (lista exata, conferida no HEAD)

Mudancas de ASSERT (ajuste ao comportamento aprovado, nunca afrouxar), todas em F1.3 no mesmo commit que causa a mudanca:
- `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/pokemon-card.test.tsx:58-65` ("badge de raridade so aparece quando primary != null", com o zero de `[class*="badge-"]` na linha 60 e `.badge-rare` na 64): vira o `it` em ingles "card shows the generation seal in place of rarity (rarity never on the card)" (convencao T1), com a lista EXATA de classes `badge-*` do card (`["badge badge-gen"]`) nos dois casos e `.badge-rare` ausente (texto exato na F1.3). Igualdade exata de lista = mesma forca do zero anterior.
- `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/detail.spec.ts:82`: `toHaveCount(1)` -> `toHaveCount(2)` (Charizard: geracao + raridade) + dois asserts novos (`.seal .badge-gen` = "Geração 1"; `.seal .badge:not(.badge-gen)` count 1 = a raridade de antes). `:83` (`.badge-nospawn` 0) inalterado.
- `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/dex.spec.ts:114-120`: titulo "legendary card has the special seal and rarity; ..." vira "legendary card has the special seal and the generation seal (no rarity); ..." + dois asserts novos (`.badge-gen` = "Gen 1"; nenhuma classe de raridade no card). Os asserts existentes ficam.

Revisao de BASELINE VISUAL (efeito direto e intencional do selo e do painel), em F4.2: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/responsive.spec.ts-snapshots/detail-charizard-<tema>-chromium-win32.png` (7 temas; teste `responsive.spec.ts:183-205`, `fullPage`). Os 7 `home-<tema>-chromium-win32.png` NAO podem mudar.

Inalterados e obrigatoriamente verdes (conferidos): `tests/e2e/dex.spec.ts:123-140` ("badges never wrap", mede todo `.pcard .badge`, inclui o selo novo sozinho), `tests/e2e/responsive.spec.ts:138/149/160/170` (`expectBadgesIntact`/`expectNoOverlap`/`expectChipsInViewport` em Home, Dex, Detail Mewtwo e Capturados medem todo `.badge`), `tests/e2e/detail.spec.ts:120/130` (Lendario/Mitico no Hero), `:200-215` (Hero sem sobreposicao), `:306-318` (cadeia sem sobreposicao: motivo do desvio D1), `:419` e `:445` (raridade no WherePanel), `tests/e2e/dex.spec.ts:165-180` (`#f-gen` gen1 + Fogo = 12), `tests/unit/ui-screens/dex-screen.test.tsx:102-120` (opcoes de `#f-gen`), `tests/unit/ui-screens/detail-hero.test.ts`, `tests/e2e/settings.spec.ts:71-77` (InfoLines por `data-info`; a nova tem `data-info="pokeapi"`).

Mudancas de FIXTURE (sem tocar em assert), obrigatorias pelo contrato: em B1.1 acrescentar `games` nos objetos `SpeciesSummary` literais e `games: []` nos manifests de fixture (lista e linhas em B1.1); em F3.1 (mesmo commit do tipo `DexFilters.game`) acrescentar `game: null` em `dex-filter.test.ts:35` e `dex-screen.test.tsx:153`.

## 2b. Mapa de ciclo de vida das entidades

N/A: todos os dados novos (`games` por especie, catalogo `games` do manifest, `generation` nos nos) sao do dataset publicado, somente leitura, gerados pelo pipeline; nao ha criacao, edicao nem exclusao pelo usuario. O unico estado novo de UI (`filters.game`) vive na entrada da pilha de navegacao em memoria (`navigation-store.ts`), escrito pelo `#f-game` e lido de volta ao Voltar, como `filters.generation`.

---

## 3. Trade-offs e alternativas rejeitadas

| Decisao | Alternativa rejeitada | Por que |
|---|---|---|
| Ids de version-group em `SpeciesSummary.games` + catalogo no manifest (opcao A) | Slugs no indice (B), bitmask (C), arquivo separado precacheado (D) | A tem o menor gzip legivel (+2.662 no total, teto 10.240); bitmask depende da posicao na lista; D exige glob novo no SW e quebra os e2e que mockam `/data/` com so 4 arquivos (secao 2.3). |
| Catalogo no `dataset-manifest.json` | `games.json` novo carregado no boot ou sob demanda | O manifest ja e o arquivo de boot precacheado; sem loader novo, sem estado de carregamento novo na Dex, sem mudanca no SW (unico ajuste permitido no SW nem precisa ser usado). |
| `generation` em cada no da cadeia | Lookup no `speciesIndex` (padrao `findPartnerSpecies`) | Criterio da IDEA: o Detail nao depende do indice; selo no mesmo render (RF-16 por construcao); custo so na ficha, fora do precache. |
| Fusao de DLC derivada ("subconjunto proprio de Pokedexes") | Lista nominal de fusoes | LESSONS 2026-09-29: lista por regra e DERIVADA dos dados; a regra reproduz exatamente as 5 fusoes da IDEA e o teste CA-24 confere os nomes. Exclusoes continuam nominais (sao decisoes, nao dados). |
| Recorte CRU reduzido (version-groups, Pokedexes, especies) + regra no build | Script ja gravar a lista final por especie | O teste CA-23/CA-29 deriva o esperado do recorte e confronta com a regra; a regra fica num lugar so, versionada com o codigo; mudar exclusao nao exige rede. |
| Script manual separado com cache proprio (`.cache/pokeapi-games`) e `--fresh` | Etapa nova do pipeline com rede | RF-43: o build nunca toca rede para jogos; RNF-13: cache local e backoff do cliente existente; `--fresh` so quando se quer recapturar. |
| `sources` com tamanho canonico e `mtime = capturedAt` | `statSync` do arquivo | `core.autocrlf=true` neste repo: o arquivo em disco muda de tamanho/mtime entre PCs; a entrada canonica e identica em qualquer PC. |
| `SpeciesBadges` com `variant` | Componente novo so para o card, ou tirar a raridade do componente | Um componente so, sem duplicar o selo especial; tirar a raridade do componente tiraria do Hero (CONTEXT secao 2). |
| Selo da cadeia em fluxo abaixo do nome (D1) | Overlay no canto da imagem (UISPEC) | O overlay viola a regra "Sem sobreposicao de texto" e reprova o teste existente `detail.spec.ts:306-318`; afrouxar o teste (ignorar `img`) e proibido. O motivo do overlay sumiu com a decisao 2.4. |
| Outline `--primary` em green/blue/purple (D2) | `--secondary` em todos os temas | `--secondary` da 1,2:1 (green), 1,6:1 (blue) e 2,57:1 (purple) sobre `--surface`; o padrao do projeto ja troca para `--primary` em green/blue (`detail.css:86`, `components.css:38`). |
| Rotulo longo do Hero reusando `dex.genN` | Chave nova "Geração {n}" | Mesmo texto que o PRD pede (RF-08); os 3 especiais tem chaves proprias. `genLabel` do filtro nao muda (RF-18). |
| Auditoria estendida com fatos fixos independentes do recorte | Auditoria reconstruindo jogos do recorte | RF-49: o esperado nao pode depender do proprio recorte; os fatos (Kanto = 1..151 em Red/Blue e FireRed/LeafGreen, Johto = 1..251 em Gold/Silver, Hoenn = 202 em Ruby/Sapphire) e a geracao dos nos (do pack cru) sao independentes. |

## 4. Riscos e mitigacoes

| Risco | Impacto | Mitigacao |
|---|---|---|
| Schema estrito + dataset velho (janela quebrada) | App, e2e e `published-schemas.test.ts` quebrados de B1.1 a B2.2 | Secao 2.5 item 12: so `published-schemas.test.ts` excluido, sem e2e na janela, Frontend so depois de B2.2; backend anota no checklist e no HANDOFF. |
| Flake preexistente confundido com regressao | Retrabalho ou assert afrouxado | Sprint 0 (S0.1): suite completa + build ANTES de qualquer mudanca, flakes classificados com `--repeat-each=3` e evidencia no STATE; flake se corrige pela causa. |
| Baselines visuais do Charizard | 7 e2e de tema falham por mudanca intencional | F4.2 regera so `detail-charizard-*` com `--update-snapshots` limitado ao teste e confere por `git status` que nenhum `home-*` mudou; revisao visual contra `ui-refs/` antes do commit. |
| PokeAPI muda/indisponivel na captura | Recorte incompleto | `collectGameSnapshot` falha com erro claro (paginacao, nome EN ausente, espelhamento version-group <-> Pokedex quebrado, URL de especie fora do padrao) e NUNCA grava parcial; build so le o arquivo versionado. |
| Lista de jogos inesperada (version-group novo na PokeAPI) | Jogo a mais/a menos | Regra derivada + teste CA-24 por nome; B1.2 registra no checklist a lista derivada e compara com a secao 5.3; divergencia = parar e registrar no STATE. |
| Selo longo nao caber no card a 360 | Sobreposicao com `dex-num` | Medido (Playwright, Nunito 800 local): "Gen 7 (Let's Go)" = 88,9 px no phone (9px) e 102,6 px no desktop (10px); espaco livre ~106 px (360) e ~140 px (desktop); `responsive.spec.ts:149` e `dex.spec.ts:123-140` cobrem; T1.4 abre Meltan e Wyrdeer explicitamente. |
| Caixa do `EvoNode` mais alta (D1) | Layout da cadeia muda | So +22 px; `detail.spec.ts:306-318` (sem sobreposicao) roda a 360/390/1280; capturas `after-*` comparadas com `detail-evolution-*.png`. |
| 5a coluna no desktop | Selects apertados em larguras intermediarias | `min-width: 0` e `width: 100%` ja existem (`dex.css:66`); RF-41 cobre 360/390/1280 com `expectNoOverlap("#filters")`. |
| Determinismo e "outro PC" | `datasetVersion` muda por data e por `sources.mtime` dos jars | Fato preexistente (hash inclui o manifest com `mtime`): "mesma versao" = mesmo PC no mesmo dia; "arquivos identicos" = todos os arquivos de dado menos o `dataset-manifest.json`; a entrada nova de `sources` e canonica (item 2.5.5). Ver assuncao A4. |
| `CA-32` "PC sem `.cache`" | O pipeline existente ja depende do cache da PokeAPI para golpes/habilidades/sprites | Fora do escopo mudar isso (nao alterar o existente); a parte de jogos prova independencia de rede e de cache (T1.1). Assuncao A3. |

---

## 5. Contrato dos arquivos do dataset (no lugar de endpoints)

**Endpoints HTTP: N/A.** O site e SPA estatico sem backend: nenhum endpoint e criado ou modificado. O CONTRATO sao os JSON publicados em `public/data/<datasetVersion>/`, validados por zod na carga (`src/data/loaders.ts`). Produtores: `tools/dataset/src/species/index-writer.ts` (indice, fichas, manifest) e `tools/dataset/src/species/evolutions.ts` (nos). Tipos em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/types.ts` (o pipeline importa via `../../../../src/data/types`), schemas em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/schemas.ts`. Consumidores: `dataset-store`, `DexFilters`, `use-filtered-species`, `PokemonCard`/`SpeciesBadges`, `HeroCard`, `EvolutionPanel`, `GamesPanel`, auditoria `tools/dataset/audit/compare.ts`, testes `published-schemas.test.ts`, `join.test.ts`, `precache-budget.test.ts`.

Nenhum arquivo publicado novo. Arquivos MODIFICADOS (so acrescimos, RF-46): `dataset-manifest.json`, `species-index.json`, `species/<dex>.json` (1027), `current.json` (nova versao). Todos os outros (`items.json`, `moves.json`, `abilities.json`, `balls.json`, `series.json`, `fossils.json`, `biomes.json`, `type-chart.json`, `texture-manifest.json`, `trainers/*`) byte a byte iguais.

### 5.1 Tipos (em `src/data/types.ts`)

Novo, entre `PackInfo` (fecha na linha 91) e `export interface DatasetManifest` (linha 93):

```ts
/** pokemon-generation: jogo principal = version-group da PokeAPI (recorte curado), no catalogo do manifest. */
export interface GameInfo {
  /** id do version-group na PokeAPI (ex. 7 = firered-leafgreen); e o valor guardado em SpeciesSummary.games */
  id: number;
  /** nome do version-group na PokeAPI (ex. "firered-leafgreen") */
  slug: string;
  /** nomes em ingles das versoes do grupo unidos por " / " (ex. "FireRed / LeafGreen"); nome proprio, igual em PT e EN */
  name: string;
}
```

`DatasetManifest` (linhas 93-108), depois de `files: DatasetFiles;` (linha 107):
```ts
  /** pokemon-generation: jogos principais em ordem cronologica (version-group.order) */
  games: GameInfo[];
```

`SpeciesSummary` (linhas 130-150), depois de `artworkId: number | null;` (linha 149):
```ts
  /** pokemon-generation: ids de GameInfo em que a especie consta (ordem do catalogo); [] = oficial sem jogo; null = so no pack (custom) */
  games: number[] | null;
```

`EvolutionChainNode` (linhas 202-207), depois de `types: TypeId[];` (linha 206):
```ts
  /** pokemon-generation: geracao da especie do no (mesmo valor de SpeciesSummary.generation) */
  generation: string;
```

`SpeciesDetail extends SpeciesSummary` (linha 289) herda `games` sem mudanca.

### 5.2 Schema zod (em `src/data/schemas.ts`)

- `datasetManifestSchema` (linhas 49-96): depois do bloco `files` (fecha na linha 95), antes do `});` da linha 96:
  `games: z.array(z.object({ id: z.number().int().positive(), slug: z.string().min(1), name: z.string().min(1) }).strict()),`
- `summaryShape` (linhas 98-111): depois de `artworkId: z.number().nullable(),` (linha 110):
  `games: z.array(z.number().int().positive()).nullable(),`
- `evolutionChain.nodes` (linha 190): o objeto passa a `z.object({ dex: z.number(), slug: z.string(), name: localizedTextSchema, types: z.array(typeIdSchema), generation: z.string() })`.
Obrigatorios (nunca `.optional()`). O objeto do catalogo e `.strict()` (campo desconhecido rejeita); os objetos existentes continuam como estao (o `published-schemas.test.ts:36` ja pega campo descartado em silencio).

### 5.3 Exemplos reais esperados (prototipo da regra, PokeAPI 2026-10-12; os testes derivam do recorte)

Catalogo derivado (`dataset-manifest.json.games`, 22 jogos, nesta ordem; coluna "especies" = quantas especies do indice tem o id):

| order | id | slug | name | Pokedexes elegiveis | especies |
|---|---|---|---|---|---|
| 3 | 1 | red-blue | Red / Blue | kanto | 151 |
| 4 | 2 | yellow | Yellow | kanto | 151 |
| 5 | 3 | gold-silver | Gold / Silver | original-johto | 251 |
| 6 | 4 | crystal | Crystal | original-johto | 251 |
| 7 | 5 | ruby-sapphire | Ruby / Sapphire | hoenn | 202 |
| 8 | 6 | emerald | Emerald | hoenn | 202 |
| 11 | 7 | firered-leafgreen | FireRed / LeafGreen | kanto | 151 |
| 12 | 8 | diamond-pearl | Diamond / Pearl | original-sinnoh | 151 |
| 13 | 9 | platinum | Platinum | extended-sinnoh | 210 |
| 14 | 10 | heartgold-soulsilver | HeartGold / SoulSilver | updated-johto | 256 |
| 15 | 11 | black-white | Black / White | original-unova | 156 |
| 16 | 14 | black-2-white-2 | Black 2 / White 2 | updated-unova | 301 |
| 17 | 15 | x-y | X / Y | kalos-central, kalos-coastal, kalos-mountain | 457 |
| 18 | 16 | omega-ruby-alpha-sapphire | Omega Ruby / Alpha Sapphire | updated-hoenn | 211 |
| 19 | 17 | sun-moon | Sun / Moon | original-alola + 4 ilhas | 302 |
| 20 | 18 | ultra-sun-ultra-moon | Ultra Sun / Ultra Moon | updated-alola + 4 ilhas | 403 |
| 21 | 19 | lets-go-pikachu-lets-go-eevee | Let’s Go, Pikachu! / Let’s Go, Eevee! | letsgo-kanto | 153 |
| 22 | 20 | sword-shield | Sword / Shield | galar, isle-of-armor, crown-tundra | 584 |
| 25 | 23 | brilliant-diamond-shining-pearl | Brilliant Diamond / Shining Pearl | original-sinnoh | 151 |
| 26 | 24 | legends-arceus | Legends: Arceus | hisui | 242 |
| 27 | 25 | scarlet-violet | Scarlet / Violet | paldea, kitakami, blueberry | 664 |
| 30 | 30 | legends-za | Legends: Z-A | lumiose-city, hyperspace | 364 |

(O apostrofo de "Let’s Go" e o U+2019 que a PokeAPI devolve em `version.names`; e dado, nao digitado.) Fora pela regra: `colosseum` (12) e `xd` (13) sem Pokedex; `champions` (32) nominal (e Pokedex `champions` com `is_main_series: false`); `red-green-japan` (28) e `blue-japan` (29) nominais; DLC fundidos: 21, 22, 26, 27, 31. Todas as 1025 especies oficiais caem em >= 1 jogo (0 no caso "Nao aparece").

`dataset-manifest.json` (trechos; `games` e a ultima chave):
```json
{"datasetVersion":"atm1.3.0-cobblemon1.7.3-<yyyymmdd>-<hash8>","generatedAt":"...","pack":{...},"cobblemonVersion":"1.7.3",
 "sources":[...as 11 entradas de hoje...,{"file":"tools/dataset/curated/pokeapi-game-availability.json","sizeBytes":<Buffer.byteLength(JSON.stringify(recorte))>,"mtime":"<recorte.source.capturedAt>"}],
 "counts":{...igual...},"levelCapConfig":{...igual...},"media":{...igual...},"files":{...igual...},
 "games":[{"id":1,"slug":"red-blue","name":"Red / Blue"},{"id":2,"slug":"yellow","name":"Yellow"},...,{"id":30,"slug":"legends-za","name":"Legends: Z-A"}]}
```

`species-index.json` (entradas; `games` e a ultima chave de cada `SpeciesSummary`):
- dex 41 Zubat: `..."artworkId":41,"games":[1,2,3,4,5,6,7,8,9,10,14,15,16,17,18,19,20,23,24,30]`
- dex 169 Crobat: `"games":[3,4,5,6,8,9,10,14,15,16,17,18,20,23,24,30]` (sem 7 = FireRed / LeafGreen: so pela National Dex)
- dex 236 Tyrogue: `"games":[3,4,10,20,25]`; dex 106 Hitmonlee: `"games":[1,2,3,4,7,10,19,20,25]`
- dex 6 Charizard: `"games":[1,2,3,4,7,10,15,19,20,25,30]`
- dex 9901 Piglich e 9902 Creepyon (`generation: "custom"`): `"games":null`

`species/41.json` (ficha): `games` igual ao do indice (logo depois de `artworkId`, pelo spread), e
`"evolutionChain":{"root":41,"nodes":[{"dex":41,"slug":"zubat","name":{"pt":"Zubat","en":"Zubat"},"types":["poison","flying"],"generation":"gen1"},{"dex":42,...,"generation":"gen1"},{"dex":169,...,"generation":"gen2"}],"edges":[...igual...]}`.

`tools/dataset/curated/pokeapi-game-availability.json` (versionado, `JSON.stringify(x, null, 2)` + `\n`, ~117 KB; chaves nesta ordem):
```json
{
  "source": {
    "api": "https://pokeapi.co/api/v2",
    "capturedAt": "2026-10-12T00:00:00.000Z",
    "script": "npm run dataset:snapshot-games",
    "license": "PokeAPI (pokeapi.co): API livre, sem autenticacao; uso justo com cache local. Dump estatico PokeAPI/api-data sob BSD-3-Clause.",
    "urls": ["/pokedex/blueberry", "...", "/version/yellow", "/version-group/crystal", "...", "/version-group?limit=100", "/pokemon-species?limit=10000", "/pokedex?limit=100"]
  },
  "pokemonSpeciesIds": [1, 2, "...", 1025],
  "versionGroups": [
    { "id": 1, "name": "red-blue", "order": 3, "pokedexes": ["kanto"], "versions": [{ "name": "red", "nameEn": "Red" }, { "name": "blue", "nameEn": "Blue" }] }
  ],
  "pokedexes": [
    { "id": 1, "name": "national", "isMainSeries": true, "versionGroups": [], "species": [1, 2, "...", 1025] },
    { "id": 2, "name": "kanto", "isMainSeries": true, "versionGroups": ["red-blue", "yellow", "firered-leafgreen", "red-green-japan", "blue-japan"], "species": [1, "...", 151] }
  ]
}
```
Regras do formato: `versionGroups` (32) por `id`; `pokedexes` (35) por `id`; `species` e `pokemonSpeciesIds` ascendentes sem duplicata; `versions` e `pokedexes` de cada grupo e `versionGroups` de cada Pokedex na ordem da API; `urls` = todas as URLs relativas consultadas, ordenadas por code unit (`a < b ? -1 : a > b ? 1 : 0`), sem duplicata. `capturedAt` = ISO do inicio da execucao do script. Zod estrito (`gameSnapshotSchema`, B1.2).

### 5.4 Formatos EXISTENTES modificados

| Formato | Mudanca | Quem consome |
|---|---|---|
| `DatasetManifest` (types.ts:93, schemas.ts:49) | + `games: GameInfo[]` (ultima chave); `sources` +1 entrada | `dataset-store` (boot), `DexFilters`, `GamesPanel`, `AboutCard` (inalterado), auditoria, `published-schemas`, `join.test`, fixtures `tests/fixtures/ui-shell/manifest.json` e `tests/unit/data/loaders.test.ts:17-36` |
| `SpeciesSummary` (types.ts:130, schemas.ts:98) | + `games: number[] \| null` (ultima chave) | Dex (filtro), `GamesPanel` (via ficha), indice inteiro (+26.448 bytes cru, +2.136 gzip), fixtures de 7 testes |
| `SpeciesDetail` (spread) | + `games` (via summary) | `GamesPanel`, fixture `tests/fixtures/rules-storage/species-6.json` |
| `EvolutionChainNode` (types.ts:202, schemas.ts:190) | + `generation: string` | `EvolutionPanel`, auditoria |
| `DexFilters` (navigation/types.ts:50, default :100) | + `game: number \| null` (default `null`) | `DexFilters.tsx`, `use-filtered-species.ts`, fixtures `dex-filter.test.ts:35`, `dex-screen.test.tsx:153` (ajustadas em F3.1) |
| `SpeciesBadges` props (PokemonCard.tsx:32) | + `variant: "card" \| "hero"`; `species` passa a `Pick<..., "labels" \| "rarity" \| "generation">` | `PokemonCard.tsx:79`, `HeroCard.tsx:185` |
| `Badge` props (Badge.tsx:4) | + `label?: string` (quando presente: `role="img"` + `aria-label`); sem `label` o HTML e identico ao de hoje | `GenerationBadge` (estagio da cadeia) |

## 5b. Dependencias e configuracao

- Nenhuma dependencia npm nova (zod 3.24.4, msw e @playwright/test ja instalados; cliente PokeAPI ja existe).
- npm script novo em `package.json`: `"dataset:snapshot-games": "tsx tools/dataset/src/games/snapshot-cli.ts"` (rodado SO a mao; `npm run dataset` nao o chama).
- Nenhuma variavel de ambiente nova. Nenhum segredo (a PokeAPI nao tem autenticacao).
- Cache novo do script: `tools/dataset/.cache/pokeapi-games/` (ja ignorado por `tools/dataset/.cache/` no `.gitignore`).
- `vite.config.ts`: SEM mudanca (nenhum arquivo novo no precache). `.gitignore`: sem mudanca.
- Reversao do dado = `git revert` do commit de republicacao (restaura a pasta anterior e o `current.json`).

## 5c. Matriz de autorizacao

N/A: site publico sem autenticacao, nenhum endpoint. Todo visitante le o mesmo dataset estatico; nao ha recurso com dono nem papel.

---

## 6. Divisao do trabalho

Sprint 0 (pre-voo, antes de QUALQUER mudanca): S0.1, feita pelo agente de backend (ou pelo orquestrador) no branch atual.

## Backend

"Backend" = pipeline `tools/dataset/` (Node 24 + tsx): contrato em `src/data/` (tipos + zod + fixtures), modulo novo `tools/dataset/src/games/` (regra, recorte, script manual), juncao no `index-writer`, auditoria `tools/dataset/audit/` e republicacao em `public/data/<versao>/`. Sprints B1 (contrato + regra + juncao) e B2 (auditoria + republicacao). B1.1 congela o contrato que o Frontend consome.

## Frontend

"Frontend" = app React em `src/`: textos i18n, selo de geracao (card, Capturados, Hero, cadeia), filtro "Jogo", painel "Jogos", credito. Referencia visual obrigatoria: `FEATURE_DIR/UISPEC_pokemon-generation.md` (secoes 3 a 7) e as capturas de `FEATURE_DIR/ui-refs/`; cada feature cita a secao. Nao re-derivar identidade: so variaveis de tema, sem hex novo. Desvios D1 e D2 (secoes 2.5 item 8 e 9). Sprints F1 (selo), F2 (cadeia), F3 (jogos e credito), F4 (limpeza e baseline visual). O Frontend so COMECA depois de B2.2 verde.

Sprint final T1: testes (definidos aqui, escritos na etapa de testes).

---

## 7. Sprints

### Regras gerais de toda feature de pipeline (auto-fill `build` / `estrutura` / `outro`)

- **Runtime**: Node >= 24; `npm run dataset` (tsx). Rede so no script manual de B1.2; o build roda sempre com `--offline` (cache existente de golpes/sprites em `tools/dataset/.cache/pokeapi`; o recorte de jogos nao usa cache nenhum).
- **Artefatos de teste**: `tools/dataset/out/_pg_*` (`out/` e gitignored); apagar as pastas `_pg_*` ao terminar a feature. Nunca publicar em `public/` antes de B2.2.
- **Pipeline de teste (dente)**: `npm run dataset -- --offline --out tools/dataset/out/_pg_stage --publish-dir tools/dataset/out/_pg_pub`; saida em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/out/_pg_pub/data/<versao>/`.
- **Edge cases padrao**: arquivo ausente/JSON invalido = erro nomeado (nunca dado inventado nem parcial); ordem deterministica (comparador por code unit ou por numero antes de escrever); pasta/permissao: nada fora de `tools/dataset/out/`, `tools/dataset/curated/` e (so em B2.2) `public/data/`; `.gitignore` nao muda; README do pipeline atualizado na feature que muda o comportamento.
- **Janela quebrada B1.1 -> B2.2** (secao 2.5 item 12): todo "Done when" de B1.x e B2.1 roda `npx vitest run --exclude tests/unit/data/published-schemas.test.ts`; `published-schemas.test.ts` volta e TEM de passar em B2.2; nenhum e2e roda na janela; anotar a janela no checklist e no HANDOFF.

### Regras gerais de toda feature de frontend (auto-fill da categoria `frontend`)

- **Loading**: a Dex so renderiza a grade com o indice carregado (`DexScreen.tsx:36-41`, spinner antes); o Detail mostra skeleton ate a ficha chegar (`DetailScreen.tsx:135-138`); o catalogo vem no manifest, ja carregado no boot (sem estado de carregamento novo). Sem catalogo (`manifest` nulo, so em teste) o `#f-game` mostra so "Todos" e o painel "Jogos" nao renderiza (RF-32).
- **Erro**: falha de boot ja cai na tela de erro existente; nada novo pode lancar: `generationLabel` devolve `null` para valor desconhecido; `gamesOf` ignora id fora do catalogo; `filters.game` desconhecido = lista vazia com o `EmptyState` existente.
- **Vazio**: combinacao sem resultado = `EmptyState messageKey="dex.none"` existente (`DexScreen.tsx:43-48`, RF-39); painel "Jogos" com texto proprio para `[]` e `null`.
- **Offline**: nenhuma chamada de rede nova, nenhuma midia nova (RNF-03); dados no manifest/indice precacheados e na ficha (CacheFirst).
- **Validacao de entrada**: so selects com valores fixos; `Number(e.target.value)` so para valores vindos das proprias opcoes; "all" = `null`.
- **Textos**: todo texto por `t()` (regra `pontindex/no-literal-jsx-text` rejeita qualquer JSXText); nomes de jogo sao dado (`{g.name}`), iguais em PT e EN.
- **Tema/mobile**: so variaveis (`--secondary-soft`, `--text`, `--secondary`, `--primary`, `--surface-2`, `--border`, `--muted`); `flex-wrap`, `min-width: 0`, `overflow-wrap: anywhere`; 360/390/1280 px sem vazamento nem sobreposicao (`expectNoOverlap`, `tests/harness/no-overlap.ts`).
- **Done when (dente)**: toda feature de frontend so fica verde depois de RENDERIZADA headless: dev server proprio (`npx vite --port 4179 --strictPort`, em background) e um spec TEMPORARIO `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/zz-pokemon-generation-capture.spec.ts` (copia `boot`/`openDetail`/`setLanguage`/`settle` de `tests/e2e/detail.spec.ts:22-60` e `openDex`/`scrollToCard`/`setLanguage` de `tests/e2e/dex.spec.ts:16-72`), rodado com `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/zz-pokemon-generation-capture.spec.ts` (headless, sem slowMo, sem sleep), salvando PNGs `after-<alvo>.png` em `FEATURE_DIR/ui-refs/` para comparar lado a lado com os PNGs de referencia do UISPEC secao 2 (regra do Pontin: mostrar no navegador antes de aprovar). O spec temporario e APAGADO antes do commit (nunca versionado); os PNGs `after-*` sao versionados. Parar o dev server ao terminar.

---

## Sprint 0

### Sprint S0: Pre-voo (linha de base antes de qualquer mudanca)

- **Descricao**: roda a suite completa, o build, o pipeline e a auditoria no branch atual SEM nenhuma mudanca de codigo, para separar flake preexistente de regressao (LESSONS 2026-09-29, CA-59) e congelar as medidas de partida.
- **Deliverable**: secao "Baseline (Sprint 0)" no `FEATURE_DIR/STATE_pokemon-generation.md` e no checklist, com numeros e evidencias.
- **Risco**: baixo (so leitura; o unico arquivo que o `run.ts` reescreve e restaurado).
- **Prerequisito**: working tree limpo exceto `.vite/` e artefatos `.forge` (`git status`).
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/pokemon-generation/STATE_pokemon-generation.md` (modificar: acrescentar secao no fim)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/pokemon-generation/CHECKLIST_pokemon-generation.md` (criar se o orquestrador ainda nao criou: uma linha por feature desta SPEC)
  - nenhum arquivo de codigo

#### Feature S0.1: Linha de base completa `[category: outro]`
- **Traces**: RF-56, RNF-08, RNF-09, CA-58, CA-59; restricao "rodar a suite na main antes" (PRD secao 3).
- **Steps**:
  1. `git rev-parse HEAD` (= `979fc78f...`) e `git status --short` (so `.vite/` e `.forge`); anotar.
  2. `npm run typecheck` e `npm run lint`: anotar resultado.
  3. `npx vitest run --coverage`: anotar numero de arquivos, de testes, falhas (com o nome e as 5 primeiras linhas do erro) e as porcentagens de cobertura por grupo do `vitest.config.ts`.
  4. `npm run build`: anotar sucesso e tamanho do `dist/sw.js` e a lista de URLs `data/*.json` dentro dele (`grep -o "data/[^\"]*json" dist/sw.js | sort -u`).
  5. `npx playwright test` (build + preview, headless, sem `PW_DEV`): anotar total/passou/falhou/flaky. Para CADA teste que falhar ou ficar flaky: `npx playwright test <arquivo> -g "<titulo exato>" --repeat-each=3` e anotar quantas das 3 passaram e a 1a linha do erro (evidencia). Classificar: 3/3 falha = falha deterministica preexistente; 1-2/3 = flake preexistente. Anotar explicitamente o status dos 14 testes visuais de `responsive.spec.ts:183-205` (home/detail-charizard x 7 temas).
  6. Reprodutibilidade do dataset: `npm run dataset -- --offline --out tools/dataset/out/_pg_base_stage --publish-dir tools/dataset/out/_pg_base`; comparar cada arquivo de `tools/dataset/out/_pg_base/data/<v>/` com `public/data/atm1.3.0-cobblemon1.7.3-20260930-1949ea67/` (script node inline: `Buffer.compare` arquivo a arquivo; o `dataset-manifest.json` comparado sem `datasetVersion` e `generatedAt`); anotar se o sufixo de 8 hex da versao gerada e `1949ea67` (esperado: sim neste PC). Qualquer diferenca = parar e registrar (o "so acrescimos" de B2.2 depende disso).
  7. Medir o gzip dos 4 arquivos de dataset do precache (metodo da secao 2.3): esperado 91 / 913 / 36.200 / 547 = 37.751. Se diferir, anotar os numeros medidos: eles viram as constantes de `precache-budget.test.ts` (T1.2).
  8. Auditoria: `npx tsx tools/dataset/audit/run.ts` (esperado `checks 46768, especies 1027, divergencias {}`), depois `git checkout -- tools/dataset/audit/AUDIT_REPORT.md` (o `run.ts` reescreve o arquivo inteiro; o historico de Rodadas e mantido a mao).
  9. Apagar `tools/dataset/out/_pg_base*`.
- **Edge cases**: suite com falha preexistente nao bloqueia a feature, mas fica listada com evidencia e e o criterio de comparacao de T1.5; nenhum assert e mexido aqui; se `npx playwright test` nao subir o servidor (porta 4173 ocupada) liberar a porta e repetir, nunca trocar de porta sem anotar.
- **Consumes**: nada.
- **Done when**: STATE e checklist com os 9 passos e os numeros; `git status` sem mudanca de codigo.
- **Commit**: `docs(forge): linha de base da suite e do dataset antes do pokemon-generation`
- **Rollback**: `git revert <hash>` (so documento).

---

## Backend

### Sprint B1: Contrato, regra dos jogos e juncao

- **Descricao**: congela o contrato (jogos por especie, catalogo, geracao nos nos), cria o modulo de jogos com o recorte curado capturado da PokeAPI e liga tudo no `write`.
- **Deliverable**: pipeline no snapshot gera indice, fichas e manifest validos com `games` e `generation` iguais aos exemplos da secao 5.3.
- **Risco**: medio (contrato compartilhado; janela quebrada; captura com rede).
- **Prerequisito**: S0.1 registrada. Ordem B1.1 -> B1.2 -> B1.3.
- **Files** (soma da sprint; detalhe por feature): `src/data/types.ts`, `src/data/schemas.ts`, `tools/dataset/src/species/evolutions.ts`, `tools/dataset/src/species/index-writer.ts`, `tools/dataset/src/lib/errors.ts`, `tools/dataset/src/games/{availability,snapshot,snapshot-cli}.ts` (criar), `tools/dataset/curated/pokeapi-game-availability.json` (criar), `package.json`, `tools/dataset/README.md`, `data-source/README.md`, fixtures de teste.

#### Feature B1.1: Contrato do dataset (tipos, zod, geracao nos nos, placeholders e fixtures) `[category: estrutura]`

> **Revisao 2026-10-12 (orquestrador, blocker do forge-imp-backend):** com `EvolutionChainNode.generation` obrigatorio no tipo, o placeholder de `src/screens/Detail/EvolutionPanel.tsx:190` (`{ dex, slug, name, types: [] }`) quebra o `typecheck` (TS2322 nas linhas 202, 204, 216 e 246), e o Done when de B1.1 exige typecheck limpo. O passo 1 de F2.1 (tipo local `ChainNodeView = Omit<EvolutionChainNode, "generation"> & { generation: string | null }` e `generation: null` no fallback da linha 190) passa a fazer parte de B1.1: e um ajuste SOMENTE de tipo, sem mudanca visual nem de comportamento, feito pelo agente de backend no mesmo commit do contrato. F2.1 comeca do passo 2 e reutiliza `ChainNodeView`. Alternativa rejeitada: `generation` opcional so no TS (divergiria do zod e do contrato 5.1).
- **Traces**: RF-12 (dado), RF-45 (forma), RF-48 (forma), RF-25, RNF-08.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/types.ts` (modificar: `GameInfo` entre as linhas 91 e 93; `games` depois da linha 107; `games` depois da linha 149; `generation` depois da linha 206)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/schemas.ts` (modificar: linha 95/96, linha 110, linha 190; secao 5.2)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/species/evolutions.ts` (modificar: linha 159 `nodes.push({ dex: ms.dex, slug: ms.slug, name: ms.name, types: ms.types, generation: ms.generation });` em `buildChain`, linhas 144-166)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/species/index-writer.ts` (modificar: placeholder `games: null,` depois de `artworkId,` na linha 92 de `buildSpeciesDetail`; `games` na desestruturacao (depois da linha 159) e no objeto (depois da linha 172) do mapeamento do indice, linhas 146-174; `games: [],` depois do bloco `files` (fecha na linha 222) em `manifestContent`, linhas 203-223)
  - fixtures (so dado, nenhum assert): `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/pokemon-card.test.tsx` (linha 23: `artworkId: null,` ganha `games: null,` em seguida, coerente com `generation: "custom"`), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/dex-filter.test.ts` (linha 21: `games: [],` depois de `artworkId: dex,`; o `game: null` da linha 35 NAO entra aqui: vai em F3.1 junto com o tipo), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/dex-screen.test.tsx` (linha 33: `games: [],`; o `game: null` da linha 153 vai em F3.1), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/search-box.test.tsx` (linha 22: `games: [1],`), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/domain/search.test.ts` (linha 18: `games: [],`), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-screen.test.tsx` (linha 91: `, games: []` no fim do objeto), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/trainers-screen.test.tsx` (linha 132: idem), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/data/loaders.test.ts` (manifest das linhas 17-36: `games: [],` depois do bloco `files`), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/fixtures/ui-shell/manifest.json` (`"games": []` depois de `files`), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/fixtures/rules-storage/species-6.json` (`"games": [1,2,3,4,7,10,15,19,20,25,30]` logo depois de `artworkId`; `"generation": "gen1"` em cada um dos 3 nos de `evolutionChain.nodes`)
  - `src/navigation/types.ts` NAO entra aqui (e do Frontend, F3.1).
- **Steps**:
  1. Colar os tipos da secao 5.1 exatamente (nomes, posicao, comentarios pt-BR sem acento).
  2. Colar o schema da secao 5.2.
  3. `evolutions.ts:159`: acrescentar `generation: ms.generation` (valor real ja agora; `MergedSpecies.generation` existe, `context.ts:126`).
  4. `index-writer.ts`: placeholders `games: null` (summary) e `games: []` (manifest) para o `typecheck` passar; B1.3 troca pelos valores reais. A ordem das chaves e a do contrato (`games` ultima no summary e no manifest).
  5. Fixtures: aplicar a lista acima e conferir com `npm run typecheck` que nao sobrou objeto `SpeciesSummary`/`DatasetManifest` literal sem o campo (objetos com `as unknown as` ou `as SpeciesSummary` parcial, ex. `captured-list.test.ts:6`, `home-stores.test.ts:46`, `item-link-missing.test.tsx:47,52-61`, `detail-screen.test.tsx:44`, nao mudam).
- **Edge cases**: nenhuma pasta nova; `games: null` e `[]` validos; `games` com id nao inteiro ou <= 0 rejeitado; objeto do catalogo com campo extra rejeitado (`.strict()`); no sem `generation` rejeitado; fixture `species-6.json` continua passando em `speciesDetailSchema` (`loaders.test.ts:59`).
- **Consumes (contrato)**: nada (define o contrato).
- **Done when**: `npm run typecheck` e `npm run lint` limpos; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde (inclui `join.test.ts`, que roda o pipeline com os placeholders e valida contra o schema novo); pipeline de teste (regra geral) roda sem erro e TODO no de `species/*.json` gerado tem `generation` igual ao `generation` da especie do no no indice gerado (script node inline sobre `_pg_pub`); janela quebrada ABERTA anotada no checklist e no HANDOFF (nenhum e2e ate B2.2).
- **Commit**: `feat(data): contrato do pokemon-generation (jogos por especie, catalogo no manifest e geracao nos nos da cadeia)`
- **Rollback**: `git revert <hash>`.

#### Feature B1.2: Regra dos jogos e recorte curado da PokeAPI `[category: build]`
- **Traces**: RF-21, RF-22, RF-23, RF-24, RF-28, RF-42, RF-43, RF-44, RNF-12, RNF-13.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/games/availability.ts` (criar)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/games/snapshot.ts` (criar)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/games/snapshot-cli.ts` (criar)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/lib/errors.ts` (modificar: 4 codigos novos depois de `| "E_WRITE_FAILED"`, linha 15, trocando o `;` de lugar)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/curated/pokeapi-game-availability.json` (criar: gerado pelo script, versionado)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/package.json` (modificar: script `dataset:snapshot-games` depois de `"dataset": "tsx tools/dataset/src/index.ts",`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/README.md` (modificar: secao "## Uso" ganha o comando do recorte depois do bloco bash; secao "## Saida" ganha o item "Jogos (pokemon-generation, `src/games/*`)" depois da linha 40 (item Bagas); secao "## Erros" (linha 44; lista de codigos na linha 46) ganha os 4 codigos)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/README.md` (modificar: uma linha nova depois da lista de acrescimos, antes da linha "Ficaram de fora")
- **Steps**:
  1. `errors.ts`: `| "E_GAME_SNAPSHOT_MISSING" | "E_GAME_SNAPSHOT_INVALID" | "E_GAMES_NO_SOURCE" | "E_GAMES_CUSTOM_IN_SOURCE";`.
  2. `availability.ts` (pura, sem rede, sem cache; importa `z` de "zod", `existsSync`/`readFileSync`, `path`, `PipelineError`, tipo `GameInfo`):
     - `export const GAME_SNAPSHOT_FILE = path.resolve(import.meta.dirname, "../../curated/pokeapi-game-availability.json");` (padrao de `items/bait.ts:14`).
     - `export const EXCLUDED_VERSION_GROUPS = ["red-green-japan", "blue-japan", "champions"] as const;` com comentario "IDEA secao 2: edicoes so do Japao (mesma dex kanto) e spin-off".
     - `export const EXCLUDED_POKEDEXES = ["national", "conquest-gallery"] as const;` ("national nao e jogo; conquest-gallery e spin-off").
     - `export const gameSnapshotSchema` = zod estrito da secao 5.3: `source` `{ api: z.string().url(), capturedAt: z.string().datetime(), script: z.string().min(1), license: z.string().min(1), urls: z.array(z.string().startsWith("/")).min(1) }`; `pokemonSpeciesIds: z.array(z.number().int().positive()).min(1)`; `versionGroups: z.array({ id: int positive, name: string min 1, order: z.number().int(), pokedexes: z.array(z.string()), versions: z.array({ name: z.string().min(1), nameEn: z.string().min(1) }).min(1) })`; `pokedexes: z.array({ id, name, isMainSeries: z.boolean(), versionGroups: z.array(z.string()), species: z.array(int positive) })`; todos os objetos `.strict()`. `export type GameSnapshot = z.infer<typeof gameSnapshotSchema>`.
     - `export function loadGameSnapshot(file = GAME_SNAPSHOT_FILE): GameSnapshot`: arquivo ausente -> `PipelineError("E_GAME_SNAPSHOT_MISSING", "recorte curado de jogos ausente; rode npm run dataset:snapshot-games", file)`; `JSON.parse` falha ou `safeParse` falha -> `E_GAME_SNAPSHOT_INVALID` com as 5 primeiras issues (`path: message`).
     - `export interface DerivedGame extends GameInfo { order: number; pokedexes: string[] }` e `export function deriveGames(s: GameSnapshot): DerivedGame[]`: valida integridade (todo nome em `versionGroups[].pokedexes` existe em `pokedexes[]` e o espelho `pokedexes[].versionGroups` contem o grupo, e vice-versa; ids sem duplicata) senao `E_GAME_SNAPSHOT_INVALID`; aplica a regra da secao 2.5 item 1 (elegivel, candidato, descarte por subconjunto proprio, nome = `nameEn` unidos por " / ", ordem por `order` e depois `id`); lista vazia -> `E_GAME_SNAPSHOT_INVALID`.
     - `export function buildGameAvailability(s: GameSnapshot, games: readonly DerivedGame[]): Map<number, number[]>`: especie -> ids de jogo na ordem de `games` (sem duplicata).
     - `export function gamesForSpecies(dex: number, generation: string, availability: ReadonlyMap<number, number[]>, speciesIds: ReadonlySet<number>): number[] | null`: regra da secao 2.5 item 2 (`E_GAMES_CUSTOM_IN_SOURCE` / `E_GAMES_NO_SOURCE` com o dex na mensagem).
     - `export function gameSnapshotSource(s: GameSnapshot): DatasetSource` = `{ file: "tools/dataset/curated/pokeapi-game-availability.json", sizeBytes: Buffer.byteLength(JSON.stringify(s)), mtime: s.source.capturedAt }`.
  3. `snapshot.ts` (coletor; importa `POKEAPI_BASE` e o tipo `PokeapiClient` de `../pokeapi/client`, e `gameSnapshotSchema`/`deriveGames` de `./availability`): `export async function collectGameSnapshot(client: PokeapiClient, capturedAt: Date): Promise<GameSnapshot>`:
     - GET `/version-group?limit=100` e `/pokedex?limit=100`: se `count > results.length` -> `E_GAME_SNAPSHOT_INVALID` ("paginacao: aumente o limit"); `null` (404) -> idem.
     - Para cada nome (em paralelo pelo limitador do cliente): `/version-group/{name}` -> `{ id, name, order, pokedexes: pokedexes.map(p => p.name), versions: versions.map(v => v.name) }`; `/pokedex/{name}` -> `{ id, name, isMainSeries: is_main_series, versionGroups: version_groups.map(v => v.name), species: ids de pokemon_entries[].pokemon_species.url por /\/pokemon-species\/(\d+)\/?$/ }` (URL fora do padrao -> erro; ordena e remove duplicata).
     - Para cada versao distinta: `/version/{name}` -> `names.find(n => n.language.name === "en")?.name` (ausente -> erro).
     - `/pokemon-species?limit=10000` -> ids das `results[].url` (mesmo regex), conferindo `ids.length === count`.
     - Monta o objeto na ordem da secao 5.3, com `source.api = POKEAPI_BASE`, `source.capturedAt = capturedAt.toISOString()`, `source.script = "npm run dataset:snapshot-games"`, `source.license` (texto da secao 5.3), `source.urls` = URLs relativas pedidas, ordenadas por code unit, sem duplicata; valida com `gameSnapshotSchema.parse` e roda `deriveGames` (sanidade) ANTES de devolver.
  4. `snapshot-cli.ts`: `export const GAME_SNAPSHOT_CACHE_DIR = path.resolve(import.meta.dirname, "../../.cache/pokeapi-games");` `export function parseSnapshotArgs(argv): { fresh: boolean; out: string }` (`--fresh`; `--out <arquivo>` com padrao `GAME_SNAPSHOT_FILE`; flag desconhecida -> `E_CLI_ARGS`); `export async function runSnapshotCli(argv, client?)`: se `fresh`, `rmSync(GAME_SNAPSHOT_CACHE_DIR, { recursive: true, force: true })`; `createPokeapiClient({ cacheDir: GAME_SNAPSHOT_CACHE_DIR, offline: false })`; `collectGameSnapshot(client, new Date())`; `writeJsonAtomic(out, snapshot, { pretty: true })`; `log.info` com contagens (32 grupos, 35 Pokedexes, N especies) e a lista `deriveGames(...)` (`order id slug name`). Guarda de execucao direta igual a `index.ts:84-90`. Nenhum arquivo de `tools/dataset/src` fora de `games/snapshot*.ts` importa `snapshot.ts` ou `snapshot-cli.ts`.
  5. `package.json`: `"dataset:snapshot-games": "tsx tools/dataset/src/games/snapshot-cli.ts",`.
  6. Capturar o recorte (UNICA execucao com rede desta feature, a mao): `npm run dataset:snapshot-games -- --fresh`. ~121 GETs (32 + 35 + 53 + 1 + 2 listas), concorrencia 6, cache local. Sem rede = parar e registrar no STATE (bloqueio). Conferir que a lista impressa e a da secao 5.3 (22 jogos, mesma ordem); divergencia = parar e registrar.
  7. README do pipeline: "## Uso" ganha `npm run dataset:snapshot-games [-- --fresh]` (rodado so a mao; regrava `curated/pokeapi-game-availability.json`; o build nunca chama); "## Saida" ganha o item Jogos (fonte, as 4 URLs-modelo, `capturedAt`, a regra da secao 2.5 itens 1 e 2, a entrada de `sources`, os erros); "## Erros" ganha os 4 codigos.
  8. `data-source/README.md`: linha "- 2026-10-12 (pokemon-generation): dados de fora do pack (jogos principais por especie, PokeAPI) NAO ficam aqui; o recorte versionado e `tools/dataset/curated/pokeapi-game-availability.json` (origem e data no proprio arquivo e em `tools/dataset/README.md`)."
- **Edge cases**: rede falha no meio = `PokeapiError` do cliente, nada gravado (escrita atomica so no fim); cache corrompido = o cliente apaga e refaz (`client.ts:132-138`); 404 numa lista = erro (nunca recorte parcial); `--out` fora de `tools/dataset/` aceito so para teste (o padrao e o curado); travessao nos nomes da PokeAPI = conferir com `git grep -nP "\x{2014}" tools/dataset/curated/pokeapi-game-availability.json` (vazio esperado); fluxo de build: este passo NAO toca `npm run dataset`.
- **Consumes (contrato)**: `GameInfo`, `DatasetSource` (B1.1).
- **Done when**: o JSON existe, passa em `gameSnapshotSchema`, `deriveGames` devolve os 22 jogos da secao 5.3 na mesma ordem (script node inline via `npx tsx -e`), `kanto.species` = 1..151, `pokemonSpeciesIds` = 1..1025; segunda execucao sem `--fresh` faz 0 requisicoes (contar no log/cache) e gera o mesmo conteudo exceto `capturedAt`; `npm run typecheck`/`lint` limpos; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde; `git grep -n "games/snapshot" -- tools/dataset/src ':!tools/dataset/src/games'` vazio (nenhum modulo do pipeline importa o coletor nem o CLI; a palavra "snapshot" sozinha ja aparece em `species/collect.ts`, `forms.ts` e `spawns.ts` e nao serve de criterio).
- **Commit**: `feat(dataset): recorte curado da PokeAPI e regra dos jogos principais`
- **Rollback**: `git revert <hash>`.

#### Feature B1.3: Jogos por especie e catalogo no dataset `[category: build]`
- **Traces**: RF-21, RF-22, RF-24, RF-25, RF-26, RF-28, RF-30, RF-43, RF-44, RF-45, RF-46, RF-50, RF-51.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/species/index-writer.ts` (modificar: import de `../games/availability` depois da linha 25; `runWriteStage` linha 121: depois de `const counts = assertCountsComplete(ctx);` (linha 122) carregar e derivar; `buildSpeciesDetail` linha 73 ganha o parametro `games: number[] | null` e troca o placeholder; laco das linhas 133-136 passa `gamesForSpecies(...)`; `manifestContent` linhas 203-223: `sources` (linha 206) e `games` reais; report antes do passo 5 (linha 193))
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/README.md` (completar o item Jogos com o formato publicado)
- **Steps**:
  1. Em `runWriteStage`, logo depois da linha 122: `const gameSnapshot = loadGameSnapshot(); const derivedGames = deriveGames(gameSnapshot); const availability = buildGameAvailability(gameSnapshot, derivedGames); const speciesIds = new Set(gameSnapshot.pokemonSpeciesIds);` (antes de escrever qualquer ficha: falha = nada escrito; `index.ts:71-74` apaga o staging).
  2. `buildSpeciesDetail(ctx, merged, games)`: `summary.games = games` (ultima chave, depois de `artworkId`); no laco: `details.push(buildSpeciesDetail(ctx, merged, gamesForSpecies(merged.dex, merged.generation, availability, speciesIds)));`.
  3. Mapeamento do indice (146-174): `games` na desestruturacao e no objeto, por ultimo.
  4. `manifestContent`: `sources: [...ctx.source.sources, gameSnapshotSource(gameSnapshot)]`, `games: derivedGames.map(({ id, slug, name }) => ({ id, slug, name }))` (ultima chave, depois de `files`).
  5. Report: `ctx.report.section("games", { games: derivedGames.map((g) => g.slug), perGame: Object.fromEntries(derivedGames.map((g) => [g.slug, <n especies com g.id>])), packOnly: [<dex com null>], officialWithoutGame: [<dex com []>], capturedAt: gameSnapshot.source.capturedAt })`.
  6. README: formato publicado (`games` no manifest e no summary, `null`/`[]`, `generation` nos nos).
- **Edge cases**: recorte ausente/invalido = `E_GAME_SNAPSHOT_*` (CA-31); especie oficial sem `pokemon-species` = `E_GAMES_NO_SOURCE` (CA-39); `custom` com numero oficial = `E_GAMES_CUSTOM_IN_SOURCE`; determinismo (ordem do catalogo e da lista por especie fixas); rede (nenhuma chamada nova: `loadGameSnapshot` so le arquivo); `--only write` continua falhando em `assertCountsComplete` como hoje.
- **Consumes (contrato)**: `GameSnapshot`, `deriveGames`, `buildGameAvailability`, `gamesForSpecies`, `gameSnapshotSource` (B1.2); tipos da secao 5.1.
- **Done when**: pipeline de teste (regra geral); em `_pg_pub/data/<versao>/`: Zubat, Crobat, Tyrogue, Hitmonlee, Charizard, Piglich e Creepyon iguais a secao 5.3 (script inline); `manifest.games` = 22 entradas da secao 5.3 na ordem; contagem por jogo do report igual a coluna "especies" da secao 5.3 (anotar no checklist; divergencia = parar); `officialWithoutGame` = `[]`, `packOnly` = `[9901, 9902]`; ultima entrada de `sources` canonica; `report.json` sem aviso novo; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde.
- **Commit**: `feat(dataset): jogos por especie e catalogo de jogos no dataset`
- **Rollback**: `git revert <hash>` (volta aos placeholders de B1.1).

### Sprint B2: Auditoria e publicacao

- **Descricao**: auditoria independente dos campos novos e republicacao com provas de paridade, determinismo, "so acrescimos" e orcamento.
- **Deliverable**: `public/data/<versao nova>/` + `current.json`; auditoria 0 divergencias; janela quebrada fechada; e2e inteiro igual a linha de base; HANDOFF para o frontend.
- **Risco**: medio.
- **Prerequisito**: Sprint B1 completa. B2.2 depende de B2.1.

#### Feature B2.1: Auditoria com geracao dos nos e fatos de jogos `[category: outro]`
- **Traces**: RF-49, RF-12, RF-26, RF-28, RF-51.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/audit/compare.ts` (modificar: constante `KNOWN_GAME_DEX` depois de `SPAWN_BAIT_NEW_ITEMS` (fecha na linha 54); bloco "jogos" no `compare` depois do laco de fichas (fecha na linha 112), antes de `// ---- fosseis`; em `compareSpecies` (linha 282), depois do check de `generation` (linha 301): checks dos nos e de `games` indice = ficha)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/audit/AUDIT_REPORT.md` (modificar: secao "## Rodada 7 (<data>, pokemon-generation)" no topo, antes da Rodada 6 (linha 3), no formato das linhas 3-11)
- **Steps** (a auditoria NAO importa nada de `tools/dataset/src` nem le o recorte curado: RF-49):
  1. `export const KNOWN_GAME_DEX = [{ slug: "red-blue", size: 151, range: [1, 151] }, { slug: "firered-leafgreen", size: 151, range: [1, 151] }, { slug: "gold-silver", size: 251, range: [1, 251] }, { slug: "ruby-sapphire", size: 202, range: null }] as const;` com comentario "fatos fixos dos jogos (Kanto, Johto, Hoenn), independentes do recorte da PokeAPI".
  2. `compareSpecies`: para cada no `n` de `a.evolutionChain?.nodes ?? []`: `eq(scope, \`evolutionChain.node ${n.dex} generation\`, exp.species.get(n.dex)?.generation, n.generation, ev, pf)` (esperado do pack cru); `eq(scope, "games (indice = ficha)", idx?.games, a.games, "species-index.json", pf)`; `eq(scope, "games null so no custom", e.generation === "custom", a.games === null, ev, pf)`.
  3. Bloco jogos no `compare`: `manifest.games` ausente ou vazio -> `MISSING` (`scope: "manifest"`, `field: "games"`); para cada `k` de `KNOWN_GAME_DEX`: jogo do slug ausente -> `MISSING`; senao `eq("game " + k.slug, "especies", k.size, <n do indice com o id>, "fato fixo do jogo", pub(idxFile))` e, com `range`, `eq(..., "conjunto = range", J([range]), J(<dex ordenados>), ...)`; todo id de `games` de qualquer especie existe em `manifest.games` (`EXTRA` por especie, senao 1 check).
  4. Rodar `npx tsx tools/dataset/audit/run.ts tools/dataset/out/_pg_pub/data/current.json`; depois `git checkout -- tools/dataset/audit/AUDIT_REPORT.md` e escrever a Rodada 7 a mao no topo (dataset comparado, o que foi acrescentado, tabela de severidades, `<checks> checks, 1027 fichas`).
- **Edge cases**: no com dex fora do pack = esperado `undefined` -> `MISSING`; especie custom com lista = `WRONG DATA`; catalogo com slug faltando = `MISSING`; o check existente de `generation` (linha 301, `COSMETIC`) continua igual.
- **Consumes (contrato)**: indice, fichas e manifest gerados em B1.3 (secao 5).
- **Done when**: `run.ts` contra `_pg_pub` imprime `divergencias {}` com `checks` > 46.768 e com pelo menos 1027 x 2 + (numero total de nos) + 4 checks novos; `npx vitest run tests/unit/dataset/audit.test.ts` verde (testes existentes inalterados); Rodada 7 no `AUDIT_REPORT.md`.
- **Commit**: `feat(audit): checks de geracao na cadeia e de jogos por especie`
- **Rollback**: `git revert <hash>`.

#### Feature B2.2: Republicacao, provas e HANDOFF `[category: build]`
- **Traces**: RF-46, RF-47, RF-48, RF-50, RNF-01, RNF-03, CA-33, CA-34, CA-35, CA-36, CA-37, CA-60.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/public/data/current.json` (gerado)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/public/data/<versao nova>/**` (gerado; a pasta `atm1.3.0-cobblemon1.7.3-20260930-1949ea67` e removida pelo `write.ts`, padrao do projeto)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/pokemon-generation/HANDOFF_backend.md` (criar, formato de `.forge/complete/berry-mutations/HANDOFF_backend.md`)
- **Steps**:
  1. "So acrescimos" ANTES de publicar (o publicado atual ainda existe): pipeline de teste em `_pg_pub`; script node inline (no scratchpad, nao versionado) comparando `_pg_pub/data/<nova>/` com `public/data/atm1.3.0-cobblemon1.7.3-20260930-1949ea67/`: (a) mesma lista de arquivos; (b) todo arquivo fora `species-index.json`, `species/*.json` e `dataset-manifest.json` byte a byte igual; (c) `species-index.json`: para cada entrada, `JSON.stringify` sem a chave `games` igual ao antigo, mesma ordem; (d) cada `species/<dex>.json` sem `games` e sem `evolutionChain.nodes[].generation` igual ao antigo; (e) manifest igual sem `datasetVersion`, `generatedAt`, `sources` e `games`, e `sources` antigo = prefixo do novo; (f) contagens de `generation` = 151/100/135/107/156/72/86/2/89/7/120/2. Qualquer diferenca = parar.
  2. Publicar: `npm run dataset -- --offline` (grava em `public/`).
  3. Determinismo (RF-50): nova execucao com `--publish-dir tools/dataset/out/_pg_again`; mesma `datasetVersion` (mesmo dia) e todos os arquivos iguais ao publicado (`Buffer.compare`).
  4. Orcamento (RNF-01): medir o gzip dos 4 arquivos do precache (secao 2.3) no publicado: soma <= 47.991 (esperado ~40.413); anotar os 4 numeros no HANDOFF e no STATE.
  5. `npx tsx tools/dataset/audit/run.ts` (publicado, 0 divergencias; restaurar o `AUDIT_REPORT.md` com `git checkout` e manter a Rodada 7 de B2.1, so atualizando o caminho do dataset se mudou).
  6. Janela FECHADA: `npx vitest run tests/unit/data/published-schemas.test.ts tests/unit/dataset/join.test.ts` verde; depois `npx vitest run` inteiro verde.
  7. Portao de nao-regressao do dado (UI ainda intocada): `npm run build` e `npx playwright test` inteiro: resultado igual a linha de base da S0.1 (mesmos testes verdes; so as falhas/flakes ja listadas la podem falhar). Os 14 visuais de `responsive.spec.ts` tem de passar sem atualizar baseline (nada visual mudou ainda).
  8. HANDOFF: estado, commits, janela fechada, contrato REAL conferido no publicado (secao 5 com os valores reais de Zubat/Crobat/Tyrogue/Hitmonlee/Charizard/custom e o catalogo), numeros (bytes cru e gzip, checks da auditoria, sha256 do `species-index.json`), desvios. Apagar `tools/dataset/out/_pg_*`.
- **Edge cases**: `current.json` apontando para pasta inexistente = nao commitar; `datasetVersion` igual a `...-1949ea67` = nada mudou (erro); `sources` antigo nao sendo prefixo = parar; e2e do passo 7 diferente da linha de base = regressao do dado, parar e investigar a causa (nunca mexer em teste).
- **Consumes (contrato)**: pipeline completo de B1 e auditoria de B2.1.
- **Done when**: `current.json` com `datasetVersion` nova (diferente de `atm1.3.0-cobblemon1.7.3-20260930-1949ea67`); passos 1 a 7 verdes; numeros no HANDOFF e no STATE.
- **Commit**: `feat(data): dataset republicado com jogos por especie e geracao na cadeia` (inclui o HANDOFF)
- **Rollback**: `git revert <hash>` (restaura a pasta e o `current.json` anteriores).

---

## Frontend

### Sprint F1: Selo de geracao (card, Capturados, Hero)

- **Descricao**: textos PT/EN, rotulos e componente do selo, card com geracao no lugar da raridade, Hero com geracao + raridade.
- **Deliverable**: Dex, Capturados e Hero conforme CA-01..CA-10, com capturas `after-*`.
- **Risco**: medio (asserts de selo; largura no phone).
- **Prerequisito**: B2.2 verde. Ordem F1.1 -> F1.2 -> F1.3.

#### Feature F1.1: Textos i18n `[category: frontend]`
- **Traces**: RF-05, RF-08, RF-14, RF-30, RF-33, RF-35, RF-52, RF-53, RNF-05.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/i18n/messages/dex.ts` (acrescentar depois da linha 24 `"dex.genCustom"`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/i18n/messages/detail.ts` (acrescentar antes do fechamento da linha 169 `} as const satisfies ...`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/i18n/messages/settings.ts` (acrescentar depois da linha 19 `"settings.images"`)
- **Steps** (valores exatos):
  1. `dex.ts`: `"dex.game": { pt: "Jogo", en: "Game" }`, `"dex.genBadge": { pt: "Gen {n}", en: "Gen {n}" }`, `"dex.genBadge7b": { pt: "Gen 7 (Let's Go)", en: "Gen 7 (Let's Go)" }`, `"dex.genBadge8a": { pt: "Gen 8 (Arceus)", en: "Gen 8 (Arceus)" }`, `"dex.genBadgePack": { pt: "Pack", en: "Pack" }`. A opcao "Todos" reusa `dex.all`; o rotulo longo "Geração N" reusa `dex.genN`.
  2. `detail.ts`: `"detail.genDiff": { pt: "{gen}, diferente da base", en: "{gen}, different from the base" }`, `"detail.games": { pt: "Jogos", en: "Games" }`, `"games.availableIn": { pt: "Disponível em", en: "Available in" }`, `"games.note": { pt: "Lista pela Pokédex regional de cada jogo; a National Dex do pós-jogo não entra", en: "Listed by each game's regional Pokédex; the post-game National Dex is not counted" }`, `"games.none": { pt: "Não aparece nos jogos oficiais", en: "Not in the official games" }`, `"games.packOnly": { pt: "Só no pack", en: "Pack only" }`.
  3. `settings.ts`: `"settings.pokeapi": { pt: "Jogos de cada Pokémon: PokeAPI (recorte no build)", en: "Games each Pokémon appears in: PokeAPI (snapshot at build time)" }`.
- **Edge cases**: chave duplicada entre modulos (`i18n-modules.test.ts:7` pega); PT/EN nao vazios; nenhum travessao; form validation/API error N/A (feature so de texto).
- **Consumes (contrato)**: nada.
- **Done when**: `npx vitest run tests/unit/ui-shell/i18n-modules.test.ts tests/unit/ui-foundation/i18n.test.tsx` verde; `npm run lint` e `npm run typecheck` limpos; captura headless `after-f11-dex-pt.png` da Dex sem nenhuma mudanca visual (as chaves ainda nao sao usadas).
- **Commit**: `feat(i18n): textos de geracao, filtro de jogo, painel Jogos e credito da PokeAPI`
- **Rollback**: `git revert <hash>`.

#### Feature F1.2: Rotulo e componente do selo de geracao `[category: frontend]`
- **Traces**: RF-05, RF-07, RF-08, RF-14, RF-17, RNF-05; UISPEC secoes 3 (`badge-gen`) e 4 (selo a partir de `Badge`).
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Dex/GenerationBadge.tsx` (criar)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/components/Badge.tsx` (modificar: assinatura da linha 4 e o `span` das linhas 6-8)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/styles/components.css` (acrescentar depois da linha 109 `html[data-theme="black"] .badge-common`, a ultima regra de selos; `.badge-nospawn` e a linha 108)
- **Steps**:
  1. `GenerationBadge.tsx`: `export type GenerationForm = "short" | "long";` `export function generationLabel(gen: string, form: GenerationForm, t: TranslateFn): string | null`: `custom` -> `t("dex.genBadgePack")`; `gen7b` -> `t("dex.genBadge7b")`; `gen8a` -> `t("dex.genBadge8a")`; `/^gen(\d+)$/` -> `form === "short" ? t("dex.genBadge", { n }) : t("dex.genN", { n })`; qualquer outro -> `null`. `export function GenerationBadge({ generation, form, className, label }: { generation: string | null | undefined; form: GenerationForm; className?: string; label?: string })`: `const t = useT(); const text = generation ? generationLabel(generation, form, t) : null; return text ? <Badge className={\`badge-gen${className ? \` ${className}\` : ""}\`} label={label}>{text}</Badge> : null;` (import `TranslateFn` e `useT` de `../../i18n/useT`, `Badge` de `../../components/Badge`).
  2. `Badge.tsx`: `export function Badge({ className, children, title, label }: { className?: string; children: ReactNode; title?: string; label?: string })` e `<span className=... title={title} role={label ? "img" : undefined} aria-label={label}>`. Sem `label` o HTML gerado e identico ao de hoje.
  3. `components.css`: `.badge-gen { background: var(--secondary-soft); color: var(--text); }` (metricas vem de `.badge`, `.pcard-top .badge` (dex.css:25, 48) e `.seal .badge` (detail.css:42)).
- **Edge cases**: `generation` vazio/nulo/desconhecido = sem selo (RF-17); tema escuro (`black`: `--text` #F4F2EA sobre #3A3210) e claros: contraste >= 4,5:1 nos 7 temas (calculado em T1.4); texto nunca quebra (`white-space: nowrap` de `.badge`); i18n PT/EN iguais nos rotulos curtos; offline/erro/vazio N/A (componente puro).
- **Consumes (contrato)**: `SpeciesSummary.generation`, `EvolutionChainNode.generation` (secao 5.1).
- **Done when**: `npm run typecheck`/`lint` limpos; `npx vitest run tests/unit/ui-screens` verde (nenhum teste usa o componente ainda, prova que `Badge` sem `label` nao mudou nada); captura headless `after-f12-dex-pt.png` igual a `dex-cards-desktop.png` (sem mudanca visual).
- **Commit**: `feat(ui): selo de geracao (rotulos curto e longo e classe badge-gen)`
- **Rollback**: `git revert <hash>`.

#### Feature F1.3: Geracao no card no lugar da raridade e no Hero `[category: frontend]`
- **Traces**: RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, RF-11, RF-54, RF-56; UISPEC secoes 4 (selo do card e do Hero), 5 (card e Capturados), 7 (Do/Don't).
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Dex/PokemonCard.tsx` (modificar: `SpeciesBadges` linhas 31-47; chamada na linha 79; import de `./GenerationBadge`; comentario das linhas 1-4 e 31 atualizado)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/HeroCard.tsx` (modificar: `HeroCard` linhas 161-186: `hasSeal` linha 166 e chamada linha 185; import de `../Dex/GenerationBadge`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/pokemon-card.test.tsx` (ajuste de assert, linhas 58-65)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/detail.spec.ts` (ajuste de assert, linha 82)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/dex.spec.ts` (ajuste de assert, linhas 114-120)
- **Steps**:
  1. `SpeciesBadges({ species, variant }: { species: Pick<SpeciesSummary, "labels" | "rarity" | "generation">; variant: "card" | "hero" })`: especial como hoje (linhas 38-43); depois `<GenerationBadge generation={species.generation} form={variant === "card" ? "short" : "long"} />`; depois a raridade SO se `variant === "hero"` (mesmo JSX da linha 44). `RARITY_BADGE` (linha 17) e `specialLabel` (linha 25) intocados.
  2. `PokemonCard.tsx:79`: `<SpeciesBadges species={species} variant="card" />`.
  3. `HeroCard`: `const t = useT();` no corpo; `const hasSeal = special !== null || detail.rarity.primary !== null || generationLabel(detail.generation, "long", t) !== null;` e `<SpeciesBadges species={detail} variant="hero" />`. `.seal` (detail.css:40-42) e o espaco dos botoes nao mudam (RF-11).
  4. Ajustes de assert (secao 2.7), textos exatos:
     - `pokemon-card.test.tsx` (substitui o `it` das linhas 58-65): `it("card shows the generation seal in place of rarity (rarity never on the card)", () => { const badgeClasses = (root: HTMLElement) => [...root.querySelectorAll('[class*="badge-"]')].map((el) => el.className); const { container: none } = render(<PokemonCard species={species()} onOpen={vi.fn()} />); expect(badgeClasses(none)).toEqual(["badge badge-gen"]); expect(none.querySelector(".badge-gen")?.textContent).toBe("Pack"); const { container: rare } = render(<PokemonCard species={species({ dex: 7, generation: "gen1", rarity: { primary: "rare", secondary: [] } })} onOpen={vi.fn()} />); expect(rare.querySelector(".badge-rare")).toBeNull(); expect(badgeClasses(rare)).toEqual(["badge badge-gen"]); expect(rare.querySelector(".badge-gen")?.textContent).toBe("Gen 1"); });`
     - `detail.spec.ts:82`: `await expect(hero.locator(".seal .badge")).toHaveCount(2);` + `await expect(hero.locator(".seal .badge-gen")).toHaveText("Geração 1");` + `await expect(hero.locator(".seal .badge:not(.badge-gen)")).toHaveCount(1);`
     - `dex.spec.ts:114`: titulo `"legendary card has the special seal and the generation seal (no rarity); clicking a card opens the detail"`; depois da linha 118: `await expect(mewtwo.locator(".badge-gen")).toHaveText("Gen 1");` e `await expect(mewtwo.locator(".badge-common, .badge-uncommon, .badge-rare, .badge-ultra")).toHaveCount(0);`.
- **Edge cases**: Lendario + "Gen 1" (Mewtwo) e Mitico + "Gen 7 (Let's Go)" (Meltan) quebram em 2 linhas dentro de `.pcard-badges` (flex-wrap), cada selo inteiro (RF-07); custom "Pack"; formas (Charizard Mega) mostram a geracao da especie (RF-06: o card e por especie); Capturados herda pelo `DexGrid.tsx:99` (RF-02); WherePanel intocado (RF-10); loading/erro/offline/vazio: herdados da tela (sem dado novo assincrono).
- **Consumes (contrato)**: `SpeciesSummary.generation`, `labels`, `rarity` (sem mudanca).
- **Done when**: capturas `after-f13-dex-{desktop,phone}.png` (comparar com `dex-cards-*.png`), `after-f13-captured-{desktop,phone}.png` (com `captured-*.png`, semeando o IndexedDB como `tests/e2e/captured.spec.ts:39-43`), `after-f13-hero-{mewtwo,charizard}-{desktop,phone}.png` (com `detail-hero-*.png`), `after-f13-dex-meltan-phone.png` (card do 808 a 360); no spec temporario: cards 41/169/808/899/9901 com "Gen 1"/"Gen 2"/"Gen 7 (Let's Go)"/"Gen 8 (Arceus)"/"Pack"; nenhuma classe de raridade em `.pcard`; `npx vitest run tests/unit/ui-screens/pokemon-card.test.tsx tests/unit/ui-screens/detail-hero.test.ts` verde; `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/dex.spec.ts tests/e2e/detail.spec.ts tests/e2e/captured.spec.ts` verde (com os 3 ajustes e nenhum outro assert mexido).
- **Commit**: `feat(dex): selo de geracao no card no lugar da raridade e no Hero`
- **Rollback**: `git revert <hash>`.

### Sprint F2: Geracao na cadeia de evolucao

- **Descricao**: selo em cada estagio, destaque nao cromatico quando difere da raiz.
- **Deliverable**: cadeias de Zubat, Tyrogue, Pichu, Charmander e Eevee conforme CA-11..CA-19, com capturas.
- **Risco**: medio (desvio D1; caixa mais alta).
- **Prerequisito**: F1.2.

#### Feature F2.1: Selo de geracao no EvoNode `[category: frontend]`
- **Traces**: RF-12, RF-13, RF-14, RF-15, RF-16, RF-17, RNF-05, RNF-06; UISPEC secao 4 (marcador `evo-gen`/`evo-gen-diff`) com os desvios D1 (posicao) e D2 (cor do outline em purple).
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/EvolutionPanel.tsx` (modificar: `EvoNode` linhas 159-179; `EvolutionChainView` linhas 181-251 (fallback da linha 190 e as 4 chamadas de `EvoNode` nas linhas 202, 204, 216 e 246); imports das linhas 9-21)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/detail.css` (acrescentar depois da linha 116 `.evo .evo-name` e depois da linha 134 `.evo-branch .evo .evo-name`)
- **Steps**:
  1. (JA FEITO em B1.1, ver revisao 2026-10-12; apenas conferir que existe) Tipo local `type ChainNodeView = Omit<EvolutionChainNode, "generation"> & { generation: string | null };` e fallback da linha 190 com `generation: null`.
  2. `EvolutionChainView`: `const rootGeneration = byDex.get(chain.root)?.generation ?? null;` passado a TODA chamada de `EvoNode` (`rootGeneration={rootGeneration}`).
  3. `EvoNode({ node, current, known, lang, rootGeneration }: { node: ChainNodeView; ...; rootGeneration: string | null })`: `const t = useT(); const long = node.generation ? generationLabel(node.generation, "long", t) : null; const diff = long !== null && rootGeneration !== null && node.generation !== rootGeneration;` e `body` = `<SpeciesSprite .../>` + `<span className="evo-label"><span className="evo-name">{gameName(node, lang)}</span><GenerationBadge generation={node.generation} form="short" className={\`evo-gen${diff ? " evo-gen-diff" : ""}\`} label={long ? (diff ? t("detail.genDiff", { gen: long }) : long) : undefined} /></span>`.
  4. CSS (depois da linha 116): `.evo-label { display: grid; justify-items: center; gap: 4px; min-width: 0; }`, `.evo .badge.evo-gen { font-size: 9px; letter-spacing: 0; padding: 3px 6px; }`, `.evo .badge.evo-gen-diff { outline: 2px solid var(--secondary); outline-offset: 1px; }`, `html[data-theme="green"] .evo .badge.evo-gen-diff, html[data-theme="blue"] .evo .badge.evo-gen-diff, html[data-theme="purple"] .evo .badge.evo-gen-diff { outline-color: var(--primary); }`; depois da linha 134: `.evo-branch .evo .evo-label { justify-items: start; }`.
- **Edge cases**: raiz sem geracao (fallback) = nenhum destaque; no sintetico = sem selo e sem erro (RF-17); indice carregando = selo ja presente (vem na ficha, RF-16, CA-17); Eevee ramificado com 8 ramos a 360 (rotulo em coluna, sem vazar); estagio atual (`.evo.current`, fundo `--secondary-soft`) continua legivel (texto `--text`); nenhum texto de jogo na cadeia (RF-15); loading/erro/offline herdados da ficha.
- **Consumes (contrato)**: `evolutionChain.root`, `evolutionChain.nodes[].generation` (secao 5.1).
- **Done when**: capturas `after-f21-evo-zubat-{desktop,phone}.png` e `after-f21-evo-tyrogue-{desktop,phone}.png` (comparar com `detail-evolution-*.png`), `after-f21-evo-pichu-desktop.png`, `after-f21-evo-eevee-phone.png`; no spec temporario: Zubat/Golbat sem `.evo-gen-diff`, Crobat com; Tyrogue (raiz gen2) sem, Hitmonlee e Hitmonchan (gen1) com destaque, Hitmontop (gen2) sem (esperado DERIVADO no spec do `generation` de cada no da ficha publicada, nunca lista a mao, LESSONS 2026-09-29); Pichu sem, Pikachu e Raichu com; Charmander/Charmeleon/Charizard sem nenhum; `aria-label` do Crobat = "Geração 2, diferente da base"; `expectNoOverlap("#evo-panel")` a 360/390/1280 PT e EN para 41, 236, 172, 133 e 6; `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/detail.spec.ts tests/e2e/navigation.spec.ts` verde sem mudar assert.
- **Commit**: `feat(detail): selo de geracao em cada estagio da cadeia de evolucao`
- **Rollback**: `git revert <hash>`.

### Sprint F3: Jogos (filtro, painel) e credito

- **Descricao**: select "Jogo" na Pokedex, painel "Jogos" no Detail, credito da PokeAPI.
- **Deliverable**: CA-25..CA-28, CA-40..CA-54, CA-61 renderizados, com capturas.
- **Risco**: medio (5a coluna; lista longa no phone).
- **Prerequisito**: F1.1. Ordem F3.1 -> F3.2 -> F3.3.

#### Feature F3.1: Filtro por jogo na Pokedex `[category: frontend]`
- **Traces**: RF-18, RF-19, RF-24, RF-35, RF-36, RF-37, RF-38, RF-39, RF-40, RF-41, RNF-05, RNF-11; UISPEC secao 4 (select irmao de `#f-gen`) e 5 (filtros).
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/navigation/types.ts` (modificar: `DexFilters` linhas 50-55 ganha `game: number | null;` depois de `generation` (linha 52); default da linha 100 ganha `game: null` depois de `generation: null`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Dex/use-filtered-species.ts` (modificar: `filterSpecies` linhas 42-53, nova condicao depois da linha 47; comentario das linhas 1-2)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Dex/DexFilters.tsx` (modificar: `SelectsAndStatus` linhas 84-140, novo `.filter-group` depois da linha 105; comentario das linhas 1-3)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Dex/dex.css` (modificar: linha 65)
  - fixtures (so dado, mesmo commit do tipo, porque `typecheck` inclui `tests/`): `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/dex-filter.test.ts` (linha 35: `filters` ganha `game: null`) e `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/dex-screen.test.tsx` (linha 153: `filters` ganha `game: null`)
- **Steps**:
  1. `filterSpecies`: `const game = filters.game ?? null;` e, depois da condicao de geracao, `(game === null || (s.games !== null && s.games.includes(game))) &&`.
  2. `SelectsAndStatus`: `const game = useNavigationStore((s) => (s.current.ui as DexUi).filters?.game ?? null); const games = useDatasetStore((s) => s.manifest?.games ?? NO_GAMES);` (`const NO_GAMES: readonly GameInfo[] = [];` no topo do modulo; o import de tipo da linha 9 passa a `import type { GameInfo, TypeId } from "../../data/types";`) e, logo depois do grupo de `#f-gen`: `<div className="filter-group"><label htmlFor="f-game">{t("dex.game")}</label><select id="f-game" value={game === null ? "all" : String(game)} onChange={(e) => patchFilters({ game: e.target.value === "all" ? null : Number(e.target.value) })}><option value="all">{t("dex.all")}</option>{games.map((g) => (<option key={g.id} value={String(g.id)}>{g.name}</option>))}</select></div>`.
  3. `dex.css:65`: `.filter-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap: 12px; align-items: end; }`. Mobile (linhas 69-72) sem mudanca.
- **Edge cases**: exemplos do PRD (FRLG = 151; FRLG + Veneno inclui Zubat/Golbat e exclui Crobat; FRLG + Gen 2 = `EmptyState`); "Todos" = lista identica a de hoje (RF-40: `game === null` nao filtra nada); Voltar do Detail restaura o jogo junto com os outros filtros (RF-38: mesma entrada da pilha); custom nunca entra (`games === null`, RF-26); teclado: `select` nativo com `label` (RNF-05); catalogo vazio = so "Todos"; 360/390 grade 2 colunas (Geracao | Jogo na 1a linha); validacao/erro de API N/A (opcoes fixas, sem rede).
- **Consumes (contrato)**: `DatasetManifest.games` (id, name), `SpeciesSummary.games` (secao 5.1).
- **Done when**: capturas `after-f31-filters-{desktop,desktop-en,phone}.png` (comparar com `dex-filters-*.png`), `after-f31-frlg-desktop.png` (Jogo = FireRed / LeafGreen), `after-f31-frlg-gen2-empty.png`; no spec temporario: `#dex-count` = 151 com FRLG, opcoes do `#f-game` = "Todos" + os 22 nomes do manifest na ordem, Voltar do Zubat mantem FRLG; `expectNoOverlap("#filters")` a 360/390/1280 PT e EN; `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/dex.spec.ts tests/e2e/navigation.spec.ts` verde; `npx vitest run tests/unit/ui-screens/dex-filter.test.ts tests/unit/ui-screens/dex-screen.test.tsx` verde sem mudar assert.
- **Commit**: `feat(dex): filtro por jogo na Pokedex`
- **Rollback**: `git revert <hash>`.

#### Feature F3.2: Painel "Jogos" no Detail `[category: frontend]`
- **Traces**: RF-15, RF-24, RF-26, RF-28, RF-29, RF-30, RF-31, RF-32, RF-33, RNF-03, RNF-05, RNF-06; UISPEC secao 4 (painel "Jogos": estados a, b, c, d e `--i` 7) e 5 (Detail).
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/GamesPanel.tsx` (criar)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/DetailScreen.tsx` (modificar: import depois da linha 26; `<GamesPanel detail={detail} />` depois da linha 147 `<WherePanel detail={detail} />`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/BestBallPanel.tsx` (modificar: linha 132, `"--i": 7` -> `8`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/FormsPanel.tsx` (modificar: linha 95, `8` -> `9`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/StatsCalculator.tsx` (modificar: linha 226, `9` -> `10`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/detail.css` (acrescentar depois da linha 177 `.badge.badge-sm`)
- **Steps**:
  1. `GamesPanel.tsx`: `export function gamesOf(ids: readonly number[] | null, catalog: readonly GameInfo[]): GameInfo[]` = `ids === null ? [] : catalog.filter((g) => ids.includes(g.id))` (ordem do catalogo, ignora id desconhecido). `export const GamesPanel = memo(function GamesPanel({ detail }: { detail: SpeciesDetail }) { const t = useT(); const catalog = useDatasetStore((s) => s.manifest?.games ?? null); const list = useMemo(() => (catalog ? gamesOf(detail.games, catalog) : []), [catalog, detail.games]); if (catalog === null) return null; ... })` com o markup da secao 2.5 item 10: `<div className="panel games-panel" id="games-panel" style={{ "--i": 7 } as CSSProperties}><div className="panel-head"><h3>{t("detail.games")}</h3></div>{detail.games === null ? <p className="muted games-empty" data-games="pack">{t("games.packOnly")}</p> : list.length === 0 ? <p className="muted games-empty" data-games="none">{t("games.none")}</p> : <><div className="kv"><span className="k" id="games-available">{t("games.availableIn")}</span><ul className="chips games-list" aria-labelledby="games-available">{list.map((g) => <li key={g.id} className="game-chip" data-game={g.slug}>{g.name}</li>)}</ul></div><p className="games-note">{t("games.note")}</p></>}</div>`.
  2. CSS: `.games-list { list-style: none; margin: 0; padding: 0; }`, `.game-chip { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; background: var(--surface-2); border: 1px solid var(--border); color: var(--text); min-width: 0; max-width: 100%; overflow-wrap: anywhere; }`, `.games-note { margin: 10px 0 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }`, `.games-empty { margin: 0; }`.
  3. `--i` de best/forms/calc conforme UISPEC.
- **Edge cases**: Crobat sem FireRed / LeafGreen (RF-28); Hitmonlee com e Tyrogue sem (CA-27); Zubat com 20 jogos a 360/390 (todos no DOM, wrap, RF-31); custom "Só no pack" sem nota; oficial sem jogo (sintetico em RTL) "Não aparece nos jogos oficiais" sem nota; manifest ausente = painel nao renderiza (RF-32); offline: dados da ficha e do manifest em cache (RNF-03); leitor de tela: `ul`/`li` com rotulo (RNF-05); nada de raridade ou spawn mexido; `TermsToggle` N/A (nomes de jogo sao iguais nos 2 idiomas).
- **Consumes (contrato)**: `SpeciesDetail.games`, `DatasetManifest.games` (secao 5.1).
- **Done when**: capturas `after-f32-games-zubat-{desktop,phone}.png`, `after-f32-games-crobat-desktop.png`, `after-f32-games-piglich-desktop.png`, `after-f32-games-zubat-en-phone.png` (comparar com `detail-where-zubat-*.png`: mesma identidade de painel); no spec temporario: `#games-panel` logo depois de `#where-panel` no DOM; Zubat inclui `[data-game='firered-leafgreen']`, Crobat nao; 9901 mostra `[data-games='pack']` "Só no pack"; nota presente so com lista; `expectNoOverlap("#games-panel")` e `scrollWidth <= clientWidth` do `#main` a 360/390/1280 PT/EN; `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/detail.spec.ts` verde.
- **Commit**: `feat(detail): painel Jogos com os jogos principais da especie`
- **Rollback**: `git revert <hash>`.

#### Feature F3.3: Credito da PokeAPI (Configuracoes e README) `[category: frontend]`
- **Traces**: RF-52, RF-53; UISPEC secao 4 (`InfoLine` irma, `settings.pokeapi`).
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Settings/AboutCard.tsx` (modificar: nova linha depois da linha 65 `<InfoLine text={t("settings.images")} />`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/README.md` (modificar: linhas 29 e 116)
- **Steps**:
  1. `<InfoLine testId="pokeapi" text={t("settings.pokeapi")} />` logo depois da linha 65 (texto de `settings.images` intocado).
  2. README linha 29: `- **Dados do modpack (e jogos pela PokeAPI)**: os jars e configs da instancia sao lidos uma vez, no build, e viram JSON, texturas, sons e traducoes PT/EN dentro do app. A lista de jogos principais de cada Pokemon vem de um recorte da PokeAPI congelado no repositorio (\`tools/dataset/curated/\`) e embutido no build. Em runtime so o artwork grande vem da PokeAPI.`
  3. README linha 116: acrescentar, depois de "sprites e artwork da PokeAPI", o trecho "; jogos principais de cada Pokemon da PokeAPI (recorte versionado)" mantendo o resto da frase.
- **Edge cases**: sem manifest a linha nova aparece igual (texto fixo); PT/EN; nenhuma outra `InfoLine` muda (`settings.spec.ts:71-77` por `data-info`); mobile (card de Configuracoes no "Mais").
- **Consumes (contrato)**: nada.
- **Done when**: capturas `after-f33-credits-{desktop,phone}.png` (comparar com `settings-credits-*.png`); `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/settings.spec.ts` verde; `npx vitest run tests/unit/ui-screens/settings-screen.test.tsx` verde.
- **Commit**: `feat(settings): credito da PokeAPI como fonte dos jogos`
- **Rollback**: `git revert <hash>`.

### Sprint F4: Limpeza e baseline visual

- **Descricao**: varredura de codigo morto com protocolo seguro e revisao das 7 baselines visuais do Detail do Charizard.
- **Deliverable**: relatorio da varredura no checklist; baselines novas versionadas.
- **Risco**: baixo.
- **Prerequisito**: F1, F2, F3 completos.

#### Feature F4.1: Varredura de codigo morto `[category: outro]`
- **Traces**: RF-54, RF-56; restricao "preservar `RARITY_BADGE`" (PRD secao 3).
- **Files**: so os que a varredura provar mortos (hoje esperado: nenhum); relatorio em `FEATURE_DIR/CHECKLIST_pokemon-generation.md`.
- **Steps** (protocolo): para cada candidato, `git grep -n "<simbolo>"` no repo inteiro (`src`, `tools`, `tests`, `*.css`); so remove com ZERO referencia viva; depois de cada remocao `npm run typecheck`, `npm run lint`, `npx vitest run` e `npm run build` verdes; o que continuar referenciado FICA e e listado com o motivo. Candidatos e resultado esperado:
  - `RARITY_BADGE` (`PokemonCard.tsx:17`): FICA (usado por `WherePanel.tsx:15,73` e pelo Hero via `SpeciesBadges` variant hero).
  - Ramo de raridade de `SpeciesBadges` (`PokemonCard.tsx:35,44`): FICA (Hero).
  - Chaves `rarity.common|uncommon|rare|ultra|legendary|mythical`: FICAM (Hero, WherePanel).
  - CSS `.badge-common|uncommon|rare|ultra` (`components.css:102-105`) e `.pcard-top .badge` (`dex.css:25,48`): FICAM (Hero/WherePanel; selo de geracao no card).
  - `genLabel` e `dex.genCustom` (`DexFilters.tsx:30-34`, `dex.ts:24`): FICAM (filtro `#f-gen`, RF-18).
  - Classe `seal-empty` (`HeroCard.tsx:184`): FICA (ainda alcancavel com geracao desconhecida; sem regra CSS hoje, fato preexistente fora do escopo).
- **Edge cases**: nao remover nada so "provavelmente sem uso"; nao mexer em codigo fora da feature.
- **Consumes**: nada.
- **Done when**: relatorio no checklist (candidato, referencias encontradas, decisao); suite + build verdes.
- **Commit**: `chore: varredura de codigo morto do pokemon-generation` (so se algo foi removido; senao sem commit, so o relatorio vai no commit de checklist)
- **Rollback**: `git revert <hash>`.

#### Feature F4.2: Baselines visuais do Detail do Charizard `[category: outro]`
- **Traces**: RF-56, RNF-06, CA-58.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/responsive.spec.ts-snapshots/detail-charizard-{black,blue,classic,green,orange,purple,white}-chromium-win32.png` (modificar)
- **Steps**:
  1. `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/responsive.spec.ts -g "Home and Charizard detail screenshots"`: confirmar que SO as comparacoes `detail-charizard-*` falham (as `home-*` passam). Se algum `home-*` falhar, parar: regressao.
  2. Revisar os PNGs `*-actual.png` em `test-results/` de pelo menos classic, black e purple (selo "Geração 1" no Hero, selos nos 3 estagios, painel "Jogos" depois de "Onde encontrar").
  3. `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/responsive.spec.ts -g "Home and Charizard detail screenshots" --update-snapshots` (modo padrao "changed").
  4. `git status --short tests/e2e/responsive.spec.ts-snapshots`: so os 7 `detail-charizard-*` mudaram; rodar de novo sem `--update-snapshots` e ver verde.
- **Edge cases**: baselines sao do modo dev (`responsive.spec.ts:7`); se a S0.1 registrou esses testes como falha preexistente, anotar e mesmo assim so regravar os `detail-charizard-*` depois de conferir que a diferenca e so a da feature.
- **Consumes**: tudo de F1-F3.
- **Done when**: os 14 testes visuais verdes; diff de snapshots = 7 arquivos.
- **Commit**: `test(e2e): baselines visuais do Detail do Charizard com geracao e Jogos`
- **Rollback**: `git revert <hash>`.

---

### Sprint T1: Testes (definidos aqui, escritos na etapa de testes)

- **Descricao**: unitarios do modulo de jogos e da auditoria, contrato publicado, orcamento, regras puras e RTL, e2e headless e regressao completa.
- **Deliverable**: suite verde nos limites de cobertura; e2e headless verde; auditoria 0.
- **Risco**: medio.
- **Prerequisito**: B1, B2, F1-F4 completos (T1.1 e T1.2 podem ser escritos logo depois de B2.2; T1.5 fica para o fim).
- **Regras**: Vitest 3 (`tests/unit/**`, nomes de `it` em ingles, `// @vitest-environment node` em testes de dado fora de `tests/unit/{build,dataset}`) + Testing Library + Playwright 1.63 (headless, sem slowMo, sem sleep). Toda lista esperada (jogos, conjuntos por jogo, destaques da cadeia) e DERIVADA do recorte curado, do pack ou do dataset dentro do teste (LESSONS), nunca copiada da IDEA/PRD/SPEC; as unicas constantes sao as do proprio requisito (tabela de rotulos do RF-05/RF-08, exclusoes nominais, nomes exemplo do PRD). Mocks so de loader/store no RTL e de rede (msw) no coletor; pipeline e e2e usam dados reais. Nenhum teste existente removido ou afrouxado.

#### Feature T1.1: Modulo de jogos (regra, recorte, coletor, CLI) e auditoria `[category: outro]`
- **Traces**: RF-21, RF-22, RF-23, RF-24, RF-25, RF-26, RF-28, RF-30, RF-42, RF-43, RF-44, RF-49, RF-51, RNF-12, RNF-13, CA-23, CA-24, CA-26, CA-30, CA-31, CA-32, CA-38, CA-39, CA-63, CA-65.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/dataset/game-availability.test.ts` (criar); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/dataset/audit.test.ts` (novo `describe("audit: generation in the chain and games (pokemon-generation)", ...)` depois da linha 212, sem mudar os existentes)
- **Steps**:
  1. `loadGameSnapshot`: arquivo inexistente (pasta temporaria em `tools/dataset/out/_pg_test`) -> `E_GAME_SNAPSHOT_MISSING`; JSON quebrado e objeto com campo extra (`.strict()`) -> `E_GAME_SNAPSHOT_INVALID`; o arquivo curado real passa.
  2. `deriveGames` no recorte REAL: o teste reimplementa a regra inline (elegivel, candidato, subconjunto proprio, ordem) e compara com a funcao (CA-23); por nome: sem `red-green-japan`, `blue-japan`, `champions`, `colosseum`, `xd`, `the-isle-of-armor`, `the-crown-tundra`, `the-teal-mask`, `the-indigo-disk`, `mega-dimension`; uma entrada para `sword-shield`, `scarlet-violet`, `legends-za`; `diamond-pearl` e `brilliant-diamond-shining-pearl` separados; `legends-arceus` presente; nome do `firered-leafgreen` = "FireRed / LeafGreen" (CA-24); uniao de Pokedexes de `sword-shield`/`scarlet-violet`/`legends-za` igual a lista do recorte (CA-26); ordem estritamente crescente de `order`.
  3. `deriveGames` sintetico: grupo apontando Pokedex inexistente e espelho quebrado -> `E_GAME_SNAPSHOT_INVALID`; empate de `order` resolvido por `id`; conjuntos iguais nao fundem.
  4. `buildGameAvailability` + `gamesForSpecies`: FRLG = exatamente as especies de `kanto.species` (151) (CA-25 no dado); Zubat/Golbat sim, Crobat nao; Hitmonlee sim, Tyrogue nao (CA-27 no dado); custom fora do intervalo -> `null`; custom dentro -> `E_GAMES_CUSTOM_IN_SOURCE`; oficial fora -> `E_GAMES_NO_SOURCE` (CA-39); oficial sem dex de jogo (sintetico) -> `[]` (CA-28 no dado).
  5. Sem rede no build (RF-43, CA-32 recorte): com `globalThis.fetch` trocado por funcao que lanca, `loadGameSnapshot` + `deriveGames` + `buildGameAvailability` rodam e a funcao nunca e chamada; nenhum caminho de `availability.ts` cita `.cache`.
  6. `collectGameSnapshot` com msw (cliente com `baseUrl: "https://fake-pokeapi.test"`, padrao de `pokeapi-media.test.ts:150-170`, `backoffMs: [1, 1, 1]`): API minima (2 grupos, 3 Pokedexes, 3 versoes, 5 especies) gera o objeto esperado (ordenacao, `urls` relativas ordenadas sem duplicata, `capturedAt`); `source.api` = `"https://pokeapi.co/api/v2"` (a constante `POKEAPI_BASE`, nunca a `baseUrl` falsa do teste: a origem registrada e a da fonte real, e as `urls` sao relativas); `count > results` -> erro; versao sem nome EN -> erro; espelho quebrado -> erro; segunda chamada com o mesmo cache faz 0 requisicoes (RNF-13); `parseSnapshotArgs` (`--fresh`, `--out`, flag desconhecida -> `E_CLI_ARGS`).
  7. Separacao (CA-30, CA-65): `git`-free: ler `tools/dataset/src/index.ts`, `species/*.ts` e `pokeapi/*.ts` e conferir que nenhum importa `games/snapshot`; `snapshot-cli.ts` importa `createPokeapiClient`; `package.json` tem `dataset:snapshot-games` e o script `dataset` continua `tsx tools/dataset/src/index.ts`.
  8. Origem e segredos (RF-42, CA-63): recorte com `source.api` = `https://pokeapi.co/api/v2`, `capturedAt` ISO, `urls` nao vazio; nenhum valor parecido com token (`/(api[_-]?key|token|secret|password)/i`) no recorte nem em `tools/dataset/src/games/*`.
  9. Auditoria: `buildExpected()` + `compare` contra uma copia do publicado em `tools/dataset/out/_audit_pg_test` (padrao `audit.test.ts:192-210`): limpo = 0 divergencias nos campos novos; adulterar a geracao do no 169 na ficha 41, remover o id 7 do Zubat so no indice e dar `games: [1]` ao 9901 -> `WRONG DATA` nos 3 campos esperados.
- **Done when**: `npx vitest run tests/unit/dataset/game-availability.test.ts tests/unit/dataset/audit.test.ts` verde; cobertura de `tools/dataset/src/**` >= 80/80.
- **Commit**: `test(dataset): regra dos jogos, recorte curado, coletor e auditoria`
- **Rollback**: `git revert <hash>`.

#### Feature T1.2: Contrato publicado, juncao e orcamento do precache `[category: outro]`
- **Traces**: RF-12, RF-25, RF-26, RF-29, RF-45, RF-46, RF-47, RF-48, RF-50, RF-51, RNF-01, CA-19, CA-29, CA-33, CA-34, CA-35, CA-37, CA-60.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/data/published-schemas.test.ts` (novo `it` depois da linha 92, sem mudar os existentes); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/dataset/join.test.ts` (novo `describe("pokemon-generation: games and chain generation", ...)` no fim, depois da linha 411); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/data/precache-budget.test.ts` (criar)
- **Steps**:
  1. `published-schemas` (o `it.each` existente ja valida indice e manifest com `toEqual`): ficha 41 passa; manifest com campo extra em `games[0]`, entrada do indice sem `games`, `games: [1.5]`, no sem `generation` -> rejeitados; `games: null` e `[]` passam.
  2. `join.test` (dados do pipeline em pasta temporaria): catalogo = derivado do recorte pela regra reimplementada no teste; para TODA especie, `games` = derivado (especie em alguma Pokedex elegivel do jogo, por numero) (CA-29); `games === null` <=> `generation === "custom"`; indice = ficha em `games`; todo no de toda ficha com `generation` = `generation` da especie do no no indice (CA-19); contagens de `generation` = as do `buildExpected()` da auditoria (independente); ultima entrada de `sources` canonica; `datasetVersion` diferente de `atm1.3.0-cobblemon1.7.3-20260930-1949ea67` (CA-35).
  3. `precache-budget.test.ts` (`// @vitest-environment node`): `BASELINE_GZIP = { "current.json": 91, "dataset-manifest.json": 913, "species-index.json": 36200, "type-chart.json": 547 }` (constantes da S0.1, com comentario da versao medida e da regra: o teto de 10.240 bytes e relativo a linha de base DESTA feature (`atm1.3.0-cobblemon1.7.3-20260930-1949ea67`); toda feature futura que republicar o dataset re-ancora `BASELINE_GZIP` na versao publicada antes dela); soma atual dos 4 arquivos do publicado (secao 2.3) - 37.751 <= 10.240 (CA-60); o glob da linha 68 do `vite.config.ts` contem exatamente `{dataset-manifest,species-index,type-chart}` (se mudar, o teste obriga a atualizar a lista).
- **Done when**: `npx vitest run tests/unit/data tests/unit/dataset/join.test.ts` verde.
- **Commit**: `test(data): contrato publicado, juncao por numero e orcamento do precache`
- **Rollback**: `git revert <hash>`.

#### Feature T1.3: Regras puras e RTL (selo, cadeia, filtro, painel, credito) `[category: outro]`
- **Traces**: RF-01..RF-19, RF-29..RF-41, RF-52, RF-53, RNF-05, RNF-11, CA-01, CA-02, CA-15, CA-17, CA-18, CA-19, CA-20, CA-22, CA-28, CA-43, CA-45, CA-51, CA-55, CA-64.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/generation-badge.test.tsx` (criar); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/detail-generation.test.tsx` (criar; Hero + cadeia, padrao de stores de `detail-screen.test.tsx`); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/games-panel.test.tsx` (criar); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/dex-filter.test.ts` (novos `it` no fim); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/dex-screen.test.tsx` (novos `it` no fim); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/settings-screen.test.tsx` (novo `it` no fim)
- **Steps**:
  1. `generationLabel`: tabela do RF-05 (curto) e RF-08 (longo) em PT e EN (`translate`), "gen10" curto "Gen 10", valor desconhecido/vazio -> `null`; para TODA `generation` distinta do `species-index.json` publicado os dois rotulos sao nao nulos; render de `PokemonCard` para as 1027 especies do indice real: `.badge-gen` = rotulo esperado pela tabela escrita no teste (CA-02) e nenhuma classe de raridade (CA-03).
  2. `SpeciesBadges`: card = [especial?, gen]; hero = [especial?, gen longo, raridade?] na ordem (CA-07, CA-08); `Badge` sem `label` sem `role`/`aria-label`.
  3. Cadeia (`EvolutionPanel` com fichas REAIS 41, 169, 236, 172, 4, 133 lidas do publicado): para cada no, `.evo-gen` existe e o destaque `.evo-gen-diff` existe se e so se `node.generation !== generation do no root` (esperado calculado no teste a partir do `generation` de cada no; ex.: na cadeia do Tyrogue, raiz gen2, Hitmonlee e Hitmonchan gen1 destacados e Hitmontop gen2 nao) (CA-11..CA-14, CA-19); `aria-label` com "diferente da base"/"different from the base" so nos destacados (CA-15); `speciesIndex: null` no store e os selos continuam (CA-17); no sintetico sem `generation` -> sem selo, sem erro (CA-18); nenhum texto de jogo na cadeia (CA-16).
  4. `GamesPanel`/`gamesOf`: ordem do catalogo, id desconhecido ignorado; `null` -> "Só no pack" exato; `[]` -> "Não aparece nos jogos oficiais" exato (CA-28); manifest nulo -> nada renderizado (CA-45); `ul`/`li` com `aria-labelledby`; EN (CA-43); nota so com lista.
  5. `filterSpecies`: game null = mesmo resultado de antes para as combinacoes existentes do arquivo (CA-51); FRLG (id 7, ficticio no sintetico) + tipo/geracao/busca por E (CA-48, CA-49); custom nunca; com o indice REAL e o catalogo real: FRLG = 151 e conjunto = especies com o id; desempenho: mediana de 20 execucoes de `filterSpecies` com jogo sobre o indice real < 5 ms (CA-64, RNF-11).
  6. `DexScreen`: `#f-game` com `label` "Jogo", opcoes "Todos" + nomes do manifest do store na ordem; trocar grava `ui().filters.game` (numero) e reduz `#dex-count`; "all" volta a `null`; `#f-gen` com as mesmas opcoes de antes (CA-20, CA-22).
  7. `SettingsScreen`: `[data-info='pokeapi']` com `settings.pokeapi` em PT e EN (CA-54).
- **Done when**: `npx vitest run tests/unit/ui-screens` verde; cobertura `src/screens/**` >= 70/70 e global >= 80/80.
- **Commit**: `test(ui): selo de geracao, cadeia, filtro e painel de jogos`
- **Rollback**: `git revert <hash>`.

#### Feature T1.4: e2e headless (Dex, Capturados, Detail, temas, Configuracoes, offline) `[category: outro]`
- **Traces**: RF-01..RF-17, RF-21, RF-28..RF-41, RF-52, RNF-03, RNF-05, RNF-06, RNF-11, CA-01, CA-03..CA-16, CA-25, CA-27, CA-40..CA-44, CA-46..CA-53, CA-56, CA-57, CA-61, CA-62.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/dex.spec.ts` (novo `test.describe("pokemon-generation: generation seal and game filter", ...)` no fim, depois da linha 260; reusa `openDex` (16), `setLanguage` (27), `scrollMain` (35), `scrollToCard` (58), `settle` (72), `cardDexes` (158), `filterText` (160)); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/detail.spec.ts` (novo `test.describe("pokemon-generation: hero, chain, games panel and themes", ...)` no fim, depois da linha 843; reusa `boot` (22), `openDetail` (31), `setLanguage` (43), `settle` (50)); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/captured.spec.ts` (novo `test` no fim; reusa `boot` (30) e `seed` (39)); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/settings.spec.ts` (novo `test` no fim); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/pwa-offline.spec.ts` (novo `test` no describe da linha 99, padrao do teste da linha 155)
- **Steps**:
  1. Dex: CA-01 (cards 41, 169, 808, 899, 9901 com os textos exatos); CA-03 (nenhuma classe de raridade em `.pcard` visivel, em 3 posicoes de scroll); CA-04 (Mewtwo e Mew: especial + gen); CA-05 (card 6 "Gen 1"); CA-06 (`.pcard .badge` sem quebra com Meltan e Wyrdeer na tela, 360/390/1280, PT/EN); CA-46 (opcoes de `#f-game` = "Todos" + `manifest.games` lido via `fetch` como `dex.spec.ts:187-191`); CA-25/CA-47 (FRLG: `#dex-count` e conjunto de `data-dex` coletado com scroll = ids com 7 no indice lido no teste; Zubat e Golbat sim, Crobat nao); CA-48 (FRLG + Veneno); CA-49 (FRLG + Gen 2: `.empty-state`); CA-50 (FRLG + Fogo, abrir card, `page.goBack()`, `#f-game` e chip restaurados); CA-51 (Todos = 1027); CA-52 (`expectNoOverlap("#filters")` 360/390/1280 PT/EN, sem scroll horizontal); CA-53 (Tab ate `#f-game` com foco visivel (`:focus-visible` e outline nao "none"), `getByLabel("Jogo")` resolve o select, ArrowDown muda o valor); CA-64 (lista de requisicoes da Dex com o filtro = as mesmas URLs de dado de antes: nenhuma URL `/data/` nova).
  2. Capturados: cards semeados com `.badge-gen` e sem classe de raridade (CA-03).
  3. Detail: CA-07 (Charizard PT "Geração 1" e EN "Generation 1" + raridade); CA-08 (Mewtwo: Lendario, geracao, raridade); CA-09/CA-57 (`.where-rarity` igual ao teste existente da linha 419); CA-10 (Hero a 360 sem sobreposicao com os botoes; o teste existente das linhas 200-215 cobre e roda junto); CA-11..CA-14 (Zubat, Crobat, Tyrogue, Charmander: destaque derivado do `generation` de cada no da ficha publicada lida via `fetch`, nunca lista a mao; no Tyrogue isso da Hitmonlee e Hitmonchan destacados e Hitmontop sem destaque); CA-15 (`.evo-gen-diff` com `outline-style: solid`, `outline-width: 2px` e `aria-label` com "diferente da base"; no tema classic sem cor (`filter: grayscale(1)` no `html`) o destaque continua medivel pelo outline); CA-16/CA-44 (nenhum `[data-game]`/`.game-chip` em `#evo-panel` nem em `.pcard`); CA-27 (Hitmonlee com `firered-leafgreen`, Tyrogue sem); CA-40 (Zubat: lista na ordem do manifest + nota); CA-41 (Crobat sem FRLG); CA-42 (Zubat a 360/390: todos os `li` visiveis dentro do painel, `expectNoOverlap("#games-panel")`, sem scroll horizontal); CA-43 (EN: titulo, rotulo, nota); CA-28 (9901 "Só no pack" exato, sem nota); CA-62 (7 temas via `writeDoc(page, "preferences", ...)` + reload como `responsive.spec.ts:76-90`: contraste `.badge-gen` texto x fundo >= 4,5:1 no Hero e no estagio (calculado de `getComputedStyle`), contraste do outline de `.evo-gen-diff` contra o fundo do `.evo` >= 3:1, foco visivel no `#f-game`).
  4. Configuracoes: `[data-info=pokeapi]` "Jogos de cada Pokémon: PokeAPI (recorte no build)" e EN (CA-54).
  5. Offline (CA-61, RNF-03): com o SW no controle, abrir Dex e Zubat online; `context.setOffline(true)`; recarregar; Dex com `#f-game` = FRLG mostra 151; Zubat (ja visitado) mostra `#games-panel` com FRLG; 0 erros; nenhuma requisicao a dominio novo.
- **Done when**: `npx playwright test tests/e2e/dex.spec.ts tests/e2e/detail.spec.ts tests/e2e/captured.spec.ts tests/e2e/settings.spec.ts tests/e2e/pwa-offline.spec.ts tests/e2e/responsive.spec.ts tests/e2e/navigation.spec.ts` (build + preview, headless) verde, incluindo TODOS os testes existentes desses arquivos.
- **Commit**: `test(e2e): selo de geracao, cadeia, filtro e painel de jogos, temas e offline`
- **Rollback**: `git revert <hash>`.

#### Feature T1.5: Regressao completa contra a linha de base `[category: outro]`
- **Traces**: RF-54, RF-56, RNF-08, RNF-09, RNF-12, CA-56, CA-58, CA-59, CA-63.
- **Files**: nenhum arquivo de codigo; numeros no `FEATURE_DIR/STATE_pokemon-generation.md`.
- **Steps** (mapa RF de regressao -> execucao):
  1. RNF-08: `npm run typecheck` e `npm run lint` limpos (inclui `no-literal-jsx-text` e o travessao).
  2. RNF-09: `npx vitest run --coverage`: arquivos/testes >= linha de base da S0.1 + os novos; limites do `vitest.config.ts` (global 80/80, `tools/dataset/src/**` 80/80, `src/screens/**` 70/70, `src/domain/**` 95/95).
  3. RF-56/RF-54/CA-56: `npm run build` e `npx playwright test` inteiro (build + preview, headless), comparado com a S0.1: so as falhas/flakes ja registradas la podem falhar; qualquer outra falha = regressao (corrigir a causa no codigo da feature, nunca o teste). Suites que provam RF-54 sem mudanca: `items.spec.ts`, `item.spec.ts`, `item-obtain-v2.spec.ts`, `balls.spec.ts`, `compare.spec.ts`, `home.spec.ts`, `trainers.spec.ts`, `team-history.spec.ts`, `capture.spec.ts`, `sync.spec.ts`, `shell.spec.ts`, `perf.spec.ts`, e os blocos existentes de `dex.spec.ts`/`detail.spec.ts`.
  4. RF-56: `git diff main -- tests/` mostra, fora dos arquivos criados e dos blocos novos, so: fixtures de B1.1, os 2 fixtures `game: null` de F3.1 (`dex-filter.test.ts:35`, `dex-screen.test.tsx:153`, ver secao 2.7), os 3 ajustes de F1.3 e os 7 PNGs de F4.2 (conferir linha a linha que nenhum outro assert mudou).
  5. RF-49: `npx tsx tools/dataset/audit/run.ts` = 0 divergencias (restaurar o `AUDIT_REPORT.md` com `git checkout`).
  6. RNF-12/CA-63: `git grep -nIE "(api[_-]?key|token|secret|password)\s*[:=]" -- src tools/dataset/src tools/dataset/curated` sem ocorrencia nova; `git grep -n "fetch(" -- src/screens` sem ocorrencia nova.
  7. Nenhum U+2014 nos arquivos tocados (`git grep -nP "\x{2014}" -- src tools tests README.md data-source/README.md .forge/ideas/pokemon-generation`).
- **Done when**: os 7 passos verdes e os numeros (testes, cobertura, checks da auditoria, bytes gzip) no STATE.
- **Commit**: `test: regressao completa do pokemon-generation (vitest, e2e, auditoria)` (so se algum arquivo mudou; senao sem commit)
- **Rollback**: n/a.

---

## 8. Matriz de cobertura do PRD

| RF/RNF | Sprint.Feature | Como e satisfeito |
|---|---|---|
| RF-01 | F1.2, F1.3, T1.3, T1.4 | `SpeciesBadges` variant card com `GenerationBadge` curto em todo card; CA-02 nas 1027 |
| RF-02 | F1.3, T1.4 | Capturados reusa `PokemonCard` (`DexGrid.tsx:99`) |
| RF-03 | F1.3, T1.3, T1.4 | Selo dentro de `.pcard-badges` no lugar da raridade; raridade so no variant hero |
| RF-04 | F1.3, T1.4 | Selo especial inalterado antes do de geracao |
| RF-05 | F1.1, F1.2, T1.3 | `generationLabel` curto com a tabela exata |
| RF-06 | F1.3, T1.4 | Card e Hero por especie; formas sem campo proprio |
| RF-07 | F1.3, T1.4 | Larguras medidas; `dex.spec.ts:123-140` e T1.4 com Meltan/Wyrdeer 360/390/1280 PT/EN |
| RF-08 | F1.1, F1.2, F1.3, T1.4 | Rotulo longo (`dex.genN` + especiais) no Hero |
| RF-09 | F1.3, T1.4 | Variant hero = especial + geracao + raridade |
| RF-10 | F1.3, F4.1, T1.4 | `WherePanel` e `RARITY_BADGE` intocados |
| RF-11 | F1.3, T1.4 | `.seal` com o mesmo margin-right; teste de Hero sem sobreposicao |
| RF-12 | B1.1, F2.1, T1.2, T1.3 | `generation` em cada no; selo em todo `EvoNode` |
| RF-13 | F2.1, T1.3, T1.4 | `evo-gen-diff` quando difere de `chain.root` |
| RF-14 | F2.1, T1.4 | Outline 2px + `aria-label` "diferente da base"; texto sempre presente |
| RF-15 | F2.1, F3.2, T1.3, T1.4 | Jogos so no painel e no filtro |
| RF-16 | B1.1, F2.1, T1.3 | Geracao vem na ficha: selo no 1o render |
| RF-17 | F2.1, T1.3 | No sintetico com `generation: null` sem selo |
| RF-18 | F3.1, T1.3, T1.4 | `#f-gen` e `genLabel` intocados; testes existentes verdes |
| RF-19 | F3.1, T1.4 | Filtros na pilha (inalterado) |
| RF-21 | B1.2, B1.3, T1.1, T1.2 | Uniao das Pokedexes elegiveis do grupo |
| RF-22 | B1.2, T1.1 | Predicado + exclusoes nominais + fusao por subconjunto proprio, derivado |
| RF-23 | B1.2, T1.1 | `name` = `nameEn` das versoes unidos por " / " |
| RF-24 | B1.2, F3.1, F3.2, T1.1 | Ordem por `order`; painel e select na ordem do catalogo |
| RF-25 | B1.3, T1.2 | Juncao por `dex` x `pokemonSpeciesIds`/`species` |
| RF-26 | B1.3, F3.1, T1.1, T1.4 | Custom = `null`; nunca no filtro |
| RF-28 | B1.2, F3.2, T1.1, T1.4 | FRLG = `kanto`; nota no painel |
| RF-29 | F3.2, T1.4 | `GamesPanel` depois do WherePanel |
| RF-30 | B1.3, F3.2, T1.3 | `null`/`[]`/falha do build |
| RF-31 | F3.2, T1.4 | Todos os `li` no DOM com wrap a 360/390 |
| RF-32 | F3.2, T1.3 | Sem catalogo o painel nao renderiza |
| RF-33 | F1.1, F3.2, T1.4 | `games.note` sob a lista |
| RF-35 | F3.1, T1.3, T1.4 | `#f-game` irmao de `#f-gen` com "Todos" + catalogo |
| RF-36 | F3.1, T1.3, T1.4 | `filterSpecies` por `games.includes` |
| RF-37 | F3.1, T1.3, T1.4 | E logico com os demais |
| RF-38 | F3.1, T1.4 | `filters.game` na entrada da pilha |
| RF-39 | F3.1, T1.4 | `EmptyState` existente |
| RF-40 | F3.1, T1.3, T1.4 | `game === null` nao filtra |
| RF-41 | F3.1, T1.4 | Grid 5 colunas / 2 no phone; `expectNoOverlap("#filters")` |
| RF-42 | B1.2, T1.1 | Script manual + recorte versionado com `source` |
| RF-43 | B1.2, B1.3, T1.1 | Build so le o arquivo; sem rede nem cache para jogos |
| RF-44 | B1.2, B1.3, T1.1 | `E_GAME_SNAPSHOT_MISSING/INVALID` |
| RF-45 | B1.1, B1.3, T1.2 | `games` no indice e na ficha; `generation` nos nos |
| RF-46 | B2.2, T1.2 | Comparacao "so acrescimos" arquivo a arquivo |
| RF-47 | B2.2, T1.2 | Nova `datasetVersion` e `current.json`; janela quebrada planejada |
| RF-48 | B1.1, B2.2, T1.2 | Zod estrito; `published-schemas` sem campo descartado |
| RF-49 | B2.1, T1.1, T1.5 | Auditoria com fatos fixos e geracao do pack |
| RF-50 | B2.2, T1.2 | Duas execucoes = mesma versao e arquivos |
| RF-51 | B1.3, T1.1 | `E_GAMES_NO_SOURCE`; custom sem falha |
| RF-52 | F1.1, F3.3, T1.3, T1.4 | `InfoLine settings.pokeapi` + README |
| RF-53 | F1.1, T1.3, T1.5 | Chaves no dicionario; lint |
| RF-54 | F4.1, T1.5 | Suites das telas nao tocadas verdes; nada removido sem prova |
| RF-56 | S0.1, F1.3, F4.2, T1.5 | Linha de base; 3 ajustes + 7 PNGs; diff de testes conferido |
| RNF-01 | B2.2, T1.2 | +2.662 gzip medido; teste permanente de teto |
| RNF-03 | F3.1, F3.2, T1.4 | Sem arquivo novo nem rede; teste offline |
| RNF-05 | F1.2, F2.1, F3.1, F3.2, T1.3, T1.4 | Texto + contraste 7 temas; outline + aria; select com label; `ul/li` |
| RNF-06 | F1.3, F2.1, F3.1, F3.2, T1.4 | `expectNoOverlap` 360/390/1280 PT/EN em Dex, Capturados, Hero, cadeia, painel, filtros |
| RNF-08 | Todas, T1.5 | typecheck e lint limpos |
| RNF-09 | T1.1, T1.2, T1.3, T1.5 | Limites v8 |
| RNF-11 | F3.1, T1.3, T1.4 | Sem download novo; `filterSpecies` < 5 ms (mediana de 20) |
| RNF-12 | B1.2, T1.1, T1.5 | Sem segredo; sem servico novo |
| RNF-13 | B1.2, T1.1 | Cliente existente com cache e backoff; script so a mao |

Total: 52 RF + 9 RNF = 61 requisitos; 61 cobertos; 0 orfaos (lacunas de numeracao do PRD: RF-20, 27, 34, 55, 57; RNF-02, 04, 07, 10). CA-01..CA-65 exercitados em S0.1, B2.2 e T1.1..T1.5 (CA-36 e CA-59 sao criterios de processo: secao 2.5 item 12 e S0.1).

## 9. Assuncoes e perguntas em aberto

- [REVISAO 2026-10-12] F2.1 passo 1 movido para B1.1 (ver nota em B1.1): ajuste de tipo em `EvolutionPanel.tsx` exigido pelo typecheck do contrato; sem mudanca visual.

Desvios do UISPEC original (ja incorporados no UISPEC revisado `11539eed64cc`; a implementacao segue ESTE SPEC):
- **D1 (posicao do selo da cadeia)**: em fluxo, abaixo do nome, dentro de `.evo-label`, em vez de sobreposto ao canto da imagem (UISPEC secao 4 e Don't "aumentar a caixa do EvoNode"). Prova: `tests/harness/no-overlap.ts` trata `img` como controle (linha 30) e o teste existente `tests/e2e/detail.spec.ts:306-318` reprovaria o overlay; o motivo do overlay sumiu com a geracao na ficha (2.4). Custo: +22 px de altura na caixa.
- **D2 (cor do outline do destaque)**: `--primary` em green, blue e purple (UISPEC: `--secondary` em todos). Prova: `--secondary` da 1,2:1 / 1,6:1 / 2,57:1 sobre `--surface` nesses temas; com a troca todos os 7 temas ficam >= 3,5:1 sobre `--surface` e sobre `--secondary-soft`.

Assuncoes (modo autonomo, revisaveis pelo Pontin):
1. **A1 Catalogo no manifest**: nenhum arquivo novo; o PRD permitia ajustar o SW so para arquivo novo, que nao existe.
2. **A2 Fusao de DLC derivada** (subconjunto proprio) em vez de lista nominal; reproduz exatamente as 5 fusoes da IDEA.
3. **A3 CA-32 ("PC sem `.cache`")** vale para os dados de jogos: o pipeline EXISTENTE ja depende do cache da PokeAPI para golpes, habilidades, sprites e artwork (`--offline` = so cache, `client.ts:139`); mudar isso esta fora do escopo ("nao alterar o existente"). A parte de jogos nao usa rede nem cache (T1.1 passo 5).
4. **A4 Determinismo**: "mesma `datasetVersion`" = mesmo PC no mesmo dia (a versao tem a data e o hash cobre `sources[].mtime` dos jars, fato preexistente); "arquivos identicos em outro PC" = todos os arquivos de dado menos o `dataset-manifest.json`. A entrada nova de `sources` e canonica.
5. **A5 Linha de base do gzip**: 37.751 bytes pelo metodo da secao 2.3 (o PRD citava 36.163 para o indice com outra ferramenta); o teto de 10.240 se aplica ao crescimento.
6. **A6 Ordem dos selos no Hero**: especial, geracao, raridade (a geracao ocupa no Hero a mesma posicao relativa que no card).
7. **A7 Temas**: o PRD fala em 4 temas; o app tem 7 (`THEME_IDS`); os testes cobrem os 7.
8. **A8 Textos novos** (valores exatos em F1.1), dentro do sentido aprovado na IDEA/UISPEC.

Perguntas em aberto: nenhuma que bloqueie a implementacao. Pendente so de rede: a captura do recorte (B1.2 passo 6) exige internet no PC; sem rede, B1.2 para e registra no STATE.

Dry-run de implementabilidade (feito, lendo como agente de contexto limpo): cada feature foi percorrida perguntando "da para implementar sem perguntar nada?". Conferido: (a) todo arquivo a modificar existe e as linhas citadas batem com o HEAD `979fc78f` (types.ts 91/93/107/130-150/149/202-207/206/289; schemas.ts 49-96/95/98-111/110/167/190; evolutions.ts 144-166/159; index-writer.ts 25/73/80-93/92/121-122/133-136/146-174/159/172/193/203-223/206/222; errors.ts 2-15; dataset-version.ts 12; client.ts 132-139; index.ts 71-74/84-90; navigation/types.ts 50-55/52/100; use-filtered-species.ts 1-2/42-53/47; DexFilters.tsx 1-3/30-34/84-140/105; dex.css 25/48/65/66/69-72; PokemonCard.tsx 1-4/17/25/31-47/35/44/79; HeroCard.tsx 13/161-186/166/184/185; EvolutionPanel.tsx 9-21/159-179/181-251/190/202/204/216/246; DetailScreen.tsx 26/135-138/147; BestBallPanel.tsx 132; FormsPanel.tsx 95; StatsCalculator.tsx 226; detail.css 40-42/86/116/134/177; components.css 101-109/109; Badge.tsx 4/6-8; AboutCard.tsx 65; dex.ts 24; detail.ts 169; settings.ts 19; DexScreen.tsx 36-48; WherePanel.tsx 15/73; vite.config.ts 67-68; README.md 29/116; tools/dataset/README.md 40/46; audit/compare.ts 54/112/282/301; AUDIT_REPORT.md 3-11; published-schemas.test.ts 25-26/36/40/92; join.test.ts 57/411; audit.test.ts 192-212; loaders.test.ts 17-36/59; pokemon-card.test.tsx 23/58-65; dex-filter.test.ts 21/35; dex-screen.test.tsx 33/102-120/153; search-box.test.tsx 22; search.test.ts 18; item-screen.test.tsx 91; trainers-screen.test.tsx 132; detail.spec.ts 22-60/82/83/120/130/200-215/306-318/419/445/843; dex.spec.ts 16-72/114-120/123-140/158/160/165-180/187-191/260; responsive.spec.ts 76-90/138/149/160/170/183-205; captured.spec.ts 30/39-43; settings.spec.ts 17-23/71-77; pwa-offline.spec.ts 99/155; no-overlap.ts 1-3/30); (b) o catalogo, as listas por especie e os bytes das secoes 2.3 e 5.3 vieram do prototipo da regra sobre a PokeAPI viva; (c) as larguras dos selos foram medidas com Playwright e a fonte Nunito 800 local; (d) o espelhamento version-group <-> Pokedex foi conferido nos dois sentidos (0 divergencias) e `kanto` = 1..151, `original-johto` = 1..251; (e) a ordem das features respeita as dependencias e a janela quebrada B1.1 -> B2.2 esta declarada, com so `published-schemas.test.ts` excluido e o Frontend depois de B2.2; (f) nenhum passo exige adivinhar nome, caminho ou valor.

Self-check: PASS (revisao forge-review aplicada: 5 warnings e 6 nits; sem endpoint: secoes 5 e 5c com o contrato dos arquivos do dataset e N/A com motivo; secao 2b N/A com motivo; todo `Consumes` existe na secao 5 com os mesmos campos; 61/61 sem orfao; toda regra posicional/quantitativa com exemplo trabalhado (regra dos jogos com a tabela de 22, juncao com Zubat/Crobat/Tyrogue/Hitmonlee/custom, orcamento com os 4 numeros e o teto, destaque da cadeia com Zubat/Tyrogue/Pichu/Charmander); caminhos absolutos e linhas conferidos; desvios do UISPEC declarados com prova; nenhum travessao no arquivo).
