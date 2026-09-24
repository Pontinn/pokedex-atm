# CHECKLIST - Pontindex

**Feature**: Pontindex  
**Branch**: feature/pontindex  
**Baseline HEAD**: fe421ec1  
**Created**: 2026-09-24  

## Legenda

- `[ ]` pendente
- `[~]` em andamento
- `[x]` feito (commit existe)
- `[!]` bloqueado

---

## Onda 0 - Base

**Agente**: Base (Opus)  
**Modelo**: Opus  
**Inicio quando**: repo sem codigo backend  
**Arquivos exclusivos**: arquivos da raiz (`package.json`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `playwright.harness.config.ts`, `eslint.config.js`, `.prettierrc`, `.gitignore`, `.gitattributes`, `.npmrc`, `vercel.json`, `README.md`, `index.html`), `src/main.tsx`, `src/vite-env.d.ts`, `src/components/Icon.tsx`, `src/styles/fonts.ts`, `src/styles/types.generated.css`, `tools/gen/`, `src/assets/`, `public/icons/`, `public/data/.gitkeep`, `tests/setup.ts`, `tools/dataset/README.md`, saida temporaria `tools/dataset/out/_base/`, contratos compartilhados (congelados), `tools/dataset/src/{index,cli,config,context,instance,source-reader,jar-reader,lang,write,report}.ts`, `tools/dataset/src/lib/`, `species/{collect,merge}.ts`, stubs de etapa; testes `tests/unit/build/`, `tests/unit/dataset/{source,species-merge}.test.ts`, `tests/fixtures/{source,species-merge}/`  
**Pasta temporaria**: `tools/dataset/out/_base/`

### Sprint B1: Scaffolding do projeto

- [x] B1.1 Projeto Vite + React + TS com qualidade
  - hash: 3728f119
  - Done when (literal da SPEC): `npm run typecheck && npm run lint && npm run build` verdes; `dist/index.html` existe.
  - notas: typecheck, lint e build verdes; dist/index.html gerado. tsconfig em 3 arquivos (tsconfig.json raiz com references + tsconfig.app.json (src) + tsconfig.node.json (tools, tests, configs)), padrao do template Vite; paths @/* e @dataset-types nos tres. Regras de lint conferidas com arquivo de prova (travessao e texto JSX literal geram erro).

- [x] B1.2 Higiene do repositorio e deploy Vercel
  - hash: 0460f36d
  - Done when (literal da SPEC): `git status` limpo apos build; deploy de preview na Vercel serve `/` e `/data/<ver>/dataset-manifest.json` com header immutable.
  - notas: vercel.json validado (JSON), dist/ ignorado (git status limpo apos build). PENDENTE: o deploy de preview na Vercel (header immutable em /data/<ver>/dataset-manifest.json) so pode ser conferido depois de push + dataset publicado (Onda 2); push nao autorizado nesta onda.

- [x] B1.3 PWA base, fontes e icones empacotados
  - hash: e8a67bc0
  - Done when (literal da SPEC): `dist/sw.js` e `dist/manifest.webmanifest` gerados; nenhum request para dominios externos ao abrir `npm run preview` (verificado com Playwright interceptando `**`).
  - notas: dist/sw.js e dist/manifest.webmanifest gerados (precache 34 entradas, ~553 KiB); preview aberto com Playwright headless interceptando ** : 5 requests, 0 externos.

- [x] B1.4 Geradores de assets (paleta de tipos, icones, mascara)
  - hash: 6bbff07f
  - Done when (literal da SPEC): `types.generated.css` contem 18 blocos; `public/icons` tem 5 PNGs; snapshot test do CSS gerado (`tests/unit/build/type-css.test.ts`).
  - notas: 18 blocos .t-/.g- + :root; 5 PNGs em public/icons; pokeball-mask.png; gen:assets idempotente (hash igual em 2 execucoes); prebuild = gen:assets; tests/unit/build/type-css.test.ts (3 testes, snapshot) verde.

- [x] B1.5 Contratos compartilhados congelados e configuracao de testes
  - hash: 07372462
  - Done when (literal da SPEC): `npm run typecheck` verde com os 5 arquivos; `tests/unit/build/contracts.test.ts`: `THEME_IDS.length === 7` e `THEME_IDS[0] === "classic"`, `heavyBallMultiplier(905) === 1`, `(1001) === 2`, `(3500) === 4`, `normalizeSearch("Pântano") === "pantano"`; `npx playwright test --list`, `npx playwright test -c playwright.harness.config.ts --list` e `npx vitest --run --passWithNoTests` sobem sem erro de configuracao.
  - notas: typecheck verde; contracts.test.ts verde (6 testes somando type-css); vitest --run --passWithNoTests ok; playwright --list das duas configs carrega sem erro (0 testes; com --pass-with-no-tests sai 0). vitest: jsdom padrao, environmentMatchGlobs manda tests/unit/{build,dataset}/** para node.

### Sprint B2: Pipeline de dados, parte 1 (especies, spawns, fosseis, evolucoes, formas)

- [x] B2.1 Leitor da fonte (snapshot ou instancia real), manifesto e escrita atomica
  - hash: 865fc37c
  - Done when (literal da SPEC): (obrigatorio, sempre; `species 1027` so aparece depois de B2.2, que fecha a Onda 0 junto com esta feature) `npm run dataset -- --only speciesCore --out tools/dataset/out/_base --skip-media --report` termina com codigo 0 e imprime `species 1027` rodando APENAS com o snapshot `data-source/atm-1.3.0` em uma maquina limpa sem o modpack (sem `--instance` e sem `ATM_INSTANCE_DIR`), com `pack = {name:"All the Mons", version:"1.3.0", minecraft:"1.21.1"}` e `cobblemonVersion = "1.7.3"` conferidos na saida do `--report` e em `tools/dataset/out/_base/report.json` (o `dataset-manifest.json` so e escrito por B2.5, Onda 2); teste unitario da deteccao com fixtures sinteticas (`mods/` so com diretorios -> snapshot; so com arquivos zip -> instancia; misto -> `E_SOURCE_MODE_UNKNOWN`; snapshot cujo `MANIFEST.json` tambem responde por `manifest.json` nao muda o modo); rodar com `ATM_INSTANCE_DIR` apontando para pasta inexistente falha com `E_INSTANCE_NOT_FOUND` sem criar `public/data/<ver>/` nem alterar `public/data/current.json`; os testes ficam em `tests/unit/dataset/source.test.ts` com fixtures em `tests/fixtures/source/`. (A paridade snapshot x instancia real por hash de `species-index.json` foi movida para B2.5, que e quem escreve esse arquivo.)
  - notas: tests/unit/dataset/source.test.ts (11 testes) verde: diretorios -> snapshot, zips -> instancia (mesmas entradas), misto -> E_SOURCE_MODE_UNKNOWN, MANIFEST.json respondendo como manifest.json no NTFS nao muda o modo, ATM_INSTANCE_DIR inexistente -> E_INSTANCE_NOT_FOUND sem tocar public/data. Comando do Done when sai 0 com pack {All the Mons, 1.3.0, 1.21.1} e cobblemonVersion 1.7.3 no --report e em tools/dataset/out/_base/report.json. Stubs das 7 etapas criados; --out restrito a tools/dataset/out/<sub>.

- [x] B2.2 Lang PT/EN e merge de especies
  - hash: 225900a4
  - Done when (literal da SPEC): teste unitario (`tests/unit/dataset/species-merge.test.ts`, fixtures em `tests/fixtures/species-merge/`: bulbasaur, charizard do Cobblemon + charizard do mega_showdown) garante `baseStats` do Cobblemon e `forms` com Mega-X/Mega-Y/Gmax; Quagsire `name.pt === "Pântano"`; `counts.species === 1027`; Mareep (`dex 179`) tem `SpeciesDetail.drops` (array achatado de `drops.entries` da adicao do allthemons, `amount: 5` descartado) contendo `{ item: "silentgear:sinew", percentage: 25, quantityRange: null }` e 4 entradas no total. (A verificacao `items.json["silentgear:sinew"].obtain` contem `{kind:"drop", from:[{dex:179,...}]}` (RF-68) pertence ao Done de B4.2, Onda 2.)
  - notas: species-merge.test.ts (8 testes) verde (fixtures + snapshot real): Charizard com baseStats do Cobblemon e formas Mega-X/Mega-Y/Gmax; Quagsire pt Pântano; 1027 especies; Mareep 4 drops com silentgear:sinew 25%. O comando do B2.1 agora imprime species 1027 (0 avisos). Merge (a) CORRIGIDO no fix 994cade8 (bug achado pelo orquestrador): o base vence SO na lista fechada da SPEC (baseStats, moves, evolutions, abilities, eggGroups, drops, catchRate, weight, height, maleRatio, preEvolution); demais campos seguem o addon (ex. implemented de zygarde/lycanroc via ccc); forms uniao por name, labels uniao. Teste de regressao em species-merge.test.ts (10 testes, suite 27/27 verde); notImplemented agora 0. Detalhes em HANDOFF_base.md.

HANDOFF: `.forge/in-progress/pontindex/HANDOFF_base.md`

**inicio**: 2026-09-24 15:53 / **fim**: 2026-09-24 16:21 / **duracao**: 28 min

---

## Onda 1 - Especies

**Agente**: Especies (Sonnet)  
**Modelo**: Sonnet  
**Inicio quando**: Onda 0 completa  
**Arquivos exclusivos**: `tools/dataset/src/species/{stage-derive,spawns,rarity,fossils,obtain,evolutions,forms}.ts`; `tests/unit/dataset/species.test.ts`, `tests/fixtures/species/`; saida temporaria `tools/dataset/out/_species/`  
**Pasta temporaria**: `tools/dataset/out/_species/`

### Sprint B2 (continuacao): Pipeline de dados, parte 1

- [x] B2.3 Spawns, raridade, fosseis e rotas "Como obter" (derivacao)
  - hash: 9718bf5e
  - Done when (literal da SPEC): em `tests/unit/dataset/species.test.ts` (fixtures em `tests/fixtures/species/`, unico arquivo de teste do agente Especies; chama `runSpeciesDerive(ctx)` com `outDir = tools/dataset/out/_species/`, equivalente a `npm run dataset -- --only speciesDerive --out tools/dataset/out/_species`, sem pipeline completo e sem escrever em `public/`): Eevee -> `primary uncommon`, `secondary [rare, ultra-rare]`, 5 entradas; Mewtwo -> `rarity.primary null`, `obtain = [fossil allthemons]`; Aerodactyl -> `[fossil, breeding]`; Charizard -> `[evolution, breeding]`; `undiscovered` sem breeding; sem rota -> `none`; `counts.fossilRoutes === 16`.
  - notas:

- [x] B2.4 Evolucoes, cadeia e formas com item necessario (derivacao)
  - hash: 9718bf5e
  - Done when (literal da SPEC): (em `tests/unit/dataset/species.test.ts`) Eevee `evolutionChain.edges.length === 8` (Espeon = friendship 160 + timeRange day; Sylveon = friendship + hasMoveType fairy), Charizard `forms` = Mega-X (`requiredItems = ["mega_showdown:charizardite_x","mega_showdown:keystone"]`), Mega-Y, Gmax (`[]`); Kadabra -> Alakazam `variant trade`; Clefairy -> Clefable `requiredItem cobblemon:moon_stone`.
  - notas:

HANDOFF: `.forge/in-progress/pontindex/HANDOFF_species.md`

**inicio**: 2026-09-24 16:25 / **fim**: 16:52 / **duracao**: 27 min

---

## Onda 1 - PokeAPI e midia

**Agente**: PokeAPI e midia (Sonnet)  
**Modelo**: Sonnet  
**Inicio quando**: Onda 0 completa  
**Arquivos exclusivos**: `tools/dataset/src/pokeapi/{client,cache,move-aliases,stage}.ts`, `tools/dataset/src/{moves,abilities}.ts`, `tools/dataset/src/media/`, `src/audio/sfx-names.ts`; `tests/unit/dataset/pokeapi-media.test.ts`, `tests/fixtures/pokeapi-media/`; saida temporaria `tools/dataset/out/_pokeapi-media/`; cache `tools/dataset/.cache/pokeapi/`  
**Pasta temporaria**: `tools/dataset/out/_pokeapi-media/`

### Sprint B3: Pipeline de dados, parte 2 (PokeAPI em build, sprites, midia)

- [x] B3.1 Cliente PokeAPI com cache e backoff
  - hash: 5f56d316
  - Done when (literal da SPEC): teste (`tests/unit/dataset/pokeapi-media.test.ts`, fixtures em `tests/fixtures/pokeapi-media/`, cache do teste em pasta temporaria do proprio teste, nunca em `.cache/` de outra etapa) com servidor fake: 2 falhas 503 depois 200 -> sucesso com 2 retries; segunda execucao nao faz rede (cache hit 100%).
  - notas:

- [x] B3.2 Golpes e habilidades
  - hash: 47b95021
  - Done when (literal da SPEC): `tests/unit/dataset/pokeapi-media.test.ts` monta um `ctx` com `runSpeciesCore` sobre o snapshot real, `outDir = tools/dataset/out/_pokeapi-media/` e cache em `tools/dataset/.cache/pokeapi/`, chama `runPokeapiStage(ctx)` (equivalente: `npm run dataset -- --only pokeapi --out tools/dataset/out/_pokeapi-media`) e confere em `tools/dataset/out/_pokeapi-media/data/`: `moves.json` tem >= 932 entradas e 0 com `type == null`; `tackle` = normal/physical/40/100/35; `abilities.json` tem 310, `blaze.name.pt === "Incêndio"`.
  - notas:

- [x] B3.4 Extracao de midia dos jars e orcamento
  - hash: 8ea3c95f
  - Done when (literal da SPEC): `tests/unit/dataset/pokeapi-media.test.ts` chama `runMediaStage(ctx)` com `outDir = tools/dataset/out/_pokeapi-media/` (equivalente: `npm run dataset -- --only media --out tools/dataset/out/_pokeapi-media`) e confere em `tools/dataset/out/_pokeapi-media/assets/`: `cries/` >= 1072 arquivos, `sfx/` = os 20 nomes de `SFX_NAMES`, `items/cobblemon/` >= 800; soma cries + sfx + texturas <= 26 MB (a faixa final de `media.totalBytes`, 18 a 26 MB com sprites, e conferida em B2.5).
  - notas:

HANDOFF: `.forge/in-progress/pontindex/HANDOFF_pokeapi-media.md`

**inicio**: 2026-09-24 16:25 / **fim**: 16:56 / **duracao**: 31 min

---

## Onda 1 - Treinadores e bolas

**Agente**: Treinadores e bolas (Sonnet)  
**Modelo**: Sonnet  
**Inicio quando**: Onda 0 completa  
**Arquivos exclusivos**: `tools/dataset/src/trainers/`, `tools/dataset/src/config-toml.ts`, `tools/dataset/src/balls/`; `tests/unit/dataset/trainers-balls.test.ts`, `tests/fixtures/trainers-balls/`; saida temporaria `tools/dataset/out/_trainers-balls/`  
**Pasta temporaria**: `tools/dataset/out/_trainers-balls/`

### Sprint B5: Pipeline de dados, parte 4 (treinadores e series)

- [x] B5.1 Treinadores e definicoes de spawn
  - hash: 4971c783
  - Done when (literal da SPEC): (em `tests/unit/dataset/trainers-balls.test.ts`, chamando `runTrainersStage(ctx)` com `outDir = tools/dataset/out/_trainers-balls/`, sem escrever em `public/`) `gym_leader_roark_0395`: `optional false`, `signatureItem cobblemon:smooth_rock`, `maxTeamLevel 14`, `series [bdsp]`; `pokemon_trainer_cedric_0445.requiredDefeats = [["gym_leader_gardenia_03d6"]]`; `gym_leader_maylene_03d8.requiredDefeats = [[cedric_0445, cedric_0446, cedric_0447]]`.
  - notas:

- [x] B5.2 Series, ordem dos treinadores-chave e config do cap
  - hash: 9bc85c18
  - Done when (literal da SPEC): (em `tests/unit/dataset/trainers-balls.test.ts`; equivalente `npm run dataset -- --only trainers --out tools/dataset/out/_trainers-balls`; confere `ctx.counts` e os arquivos em `tools/dataset/out/_trainers-balls/data/`, nunca `public/data/`) `ctx.counts.keyTrainers.bdsp === 33`; ordem BDSP comeca com `gym_leader_roark_0395`; `series.json` tem `atm_team.requiredSeries = [["bdsp"]]` e `freeroam.special === "freeroam"`.
  - notas:

### Sprint B4: Pipeline de dados, parte 3 (itens, receitas, loot, bolas)

- [x] B4.3 Pokebolas e tabela de regras
  - hash: 00466ace
  - Done when (literal da SPEC): (sem pipeline completo nem escrita em `public/`: `tests/unit/dataset/trainers-balls.test.ts` chama `runBallsStage(ctx)` com `outDir = tools/dataset/out/_trainers-balls/`, equivalente a `npm run dataset -- --only balls --out tools/dataset/out/_trainers-balls`, e le `tools/dataset/out/_trainers-balls/data/balls.json`) `balls.json.length === 48` (igual ao numero de texturas em `poke_balls/`) e `counts.balls` bate; `net_ball.rule.applies.types` = `[water, bug]`; `ancient_gigaton_ball.rule` = `{kind:"flat", multiplier:2}` e `ancient_wing_ball.rule` = `{kind:"flat", multiplier:1.5}`; `heavy_ball.rule` = `{kind:"conditional", bestMultiplier:4, worstMultiplier:1, condition:"heavyTarget"}` sem `applies`; `park_ball` = `conditional 2.5/1 forestOrPlains`; `sport_ball` = `flat 1.5`; `dusk_ball.effect.pt` = "3.5× se o Pokémon estiver no Nível de Luz 0, e 3× se estiver no Nível de Luz 1-7".
  - notas:

HANDOFF: `.forge/in-progress/pontindex/HANDOFF_trainers-balls.md`

**inicio**: 2026-09-24 16:25 / **fim**: 16:55 / **duracao**: 30 min

---

## Onda 1 - Regras e armazenamento

**Agente**: Regras e armazenamento (Opus)  
**Modelo**: Opus  
**Inicio quando**: Onda 0 completa (importa contratos congelados de B1.5)  
**Arquivos exclusivos**: `src/domain/` (exceto `normalize.ts` e `ball-rules-types.ts`), `src/storage/` (exceto `types.ts`), `src/sync/`, `src/data/{loaders,cache,schemas}.ts`, `src/platform/`; `tests/unit/{domain,storage,sync,data}/`, `tests/fixtures/rules-storage/`  
**Pasta temporaria**: nenhuma (modulos puros; fixtures em `tests/fixtures/rules-storage/`)  

### Sprint B6: Modulos de dominio (regras puras, sem UI)

- [x] B6.1 Tabela de tipos e efetividade
  - hash: f504815d
  - Done when (literal da SPEC): testes dos exemplos acima (`tests/unit/domain/type-chart.test.ts`). A igualdade com o `type-chart.json` gerado so e conferida em B2.5 (Onda 2, `tests/unit/dataset/join.test.ts`), porque o arquivo nao existe na Onda 1.
  - notas:

- [x] B6.2 Stats, naturezas e recomendacao de IV/EV
  - hash: 4ff246ad
  - Done when (literal da SPEC): testes 299/328/269/404 e Charizard/Mew.
  - notas:

- [x] B6.3 Level cap (Radical Cobblemon Trainers)
  - hash: 19cdde93
  - Done when (literal da SPEC): testes com fixtures reais dos 7 treinadores acima reproduzem 15/16/20/22/22/30/100, mais AND/OR de `requiredDefeats`, `none` e `freeroam`.
  - notas:

- [x] B6.4 Ranking de Pokebolas
  - hash: 945b707a
  - Done when (literal da SPEC): teste Magikarp reproduz exatamente o ranking completo acima (44 posicoes na ordem, 2 excluidas, 2 garantidas); teste Charizard (`weight` 905 hg = 90,5 kg, speed 100): Fast Ball 4x incondicional logo apos Love 8x e Quick 5x e ANTES das 4x condicionais; Heavy Ball presente como 1x incondicional (faixa `<= 1000` hg), no bloco de 1x entre `Heal Ball` e `Luxury Ball` pela ordem EN; teste de peso 3500 hg -> Heavy 4x incondicional.
  - notas:

- [x] B6.5 Busca
  - hash: 95e1c02f
  - Done when (literal da SPEC): testes "025"/"pantano"/"charizar"/"9902".
  - notas:

- [x] B6.6 Historico e time
  - hash: 07994a2f
  - Done when (literal da SPEC): testes 21o item / duplicado ao topo / 7o no time.
  - notas:

### Sprint B7: Persistencia, sincronizacao, backup e loaders

- [x] B7.1 StorageAdapter, IndexedDB, migracoes e repositorios
  - hash: 34a1bd4c
  - Done when (literal da SPEC): testes: round-trip dos 6 docs; migracao 0->1 importa `pontindex.terms`; snapshot criado e `restorePreMigrationSnapshot` reverte; escrita com `QuotaExceededError` simulado nao corrompe o doc anterior (leitura apos falha = valor antigo); `filterKnown` esconde dex 99999 sem apaga-lo.
  - notas:

- [x] B7.2 Codec de sincronizacao e mesclagem
  - hash: 83ee3ac6
  - Done when (literal da SPEC): property test (`fast-check`) de round-trip `decode(encode(x)) == x` para docs aleatorios, igualdade modulo precisao de segundo nos timestamps (inclui times com `null` em qualquer posicao, ex. `[6,null,94,null,null,149]`, que voltam identicos); texto de 200.001 caracteres -> `oversized` sem decodificar; payload que infla alem de 512 KB -> `oversized`; caso maximo (1027 capturados, 110 derrotados) gera >= 2 frames e reconstroi identico; exemplo A/B do PRD; CRC corrompido -> `corrupted`; magic errado -> `foreignApp`; `formatVersion 9` -> `unsupportedVersion`.
  - notas:

- [x] B7.3 Backup exportar/importar
  - hash: 4c119252
  - Done when (literal da SPEC): round-trip export -> `deleteData("all")` -> import = docs identicos (deep equal, exceto `meta.lastWriteAt`).
  - notas:

- [x] B7.4 Loaders do dataset com cache e retry
  - hash: 16fd5b73
  - Done when (literal da SPEC): testes com `fetch` mockado (`tests/unit/data/loaders.test.ts`; `schemas.ts` aceita uma ficha de exemplo de `tests/fixtures/rules-storage/`): cache hit nao refaz request; 2 falhas + sucesso; JSON invalido -> `INVALID`.
  - notas:

HANDOFF: `.forge/in-progress/pontindex/HANDOFF_rules-storage.md`

**inicio**: 2026-09-24 16:25 / **fim**: 16:56 / **duracao**: 31 min

---

## Onda 1b - Frontend fundacao

**Agente**: forge-imp-frontend  
**Modelo**: Opus  
**Inicio quando**: (a) um agente da Onda 1 terminou (teto 4 simultaneos) E (b) B7.1 verde no checklist  
**Arquivos exclusivos**: `src/styles/{tokens,themes,base,components}.css`, `src/styles/theme-meta.ts`, `src/i18n/`, `src/navigation/`, `src/state/preferences-store.ts`, `src/components/{Watermark,TypeChip,TypeIcon,TermsToggle,ScreenRouter}.tsx`; `tests/unit/ui-foundation/`, `tests/harness/`, `tests/harness/foundation.spec.ts`, `tests/fixtures/ui-foundation/`  
**Pasta temporaria**: nenhuma (fixtures em `tests/fixtures/ui-foundation/`, harness em `tests/harness/`)  

### Sprint F1: Fundacao visual, i18n, navegacao e shell

- [x] F1.1 Tokens, temas e paleta por tipo
  - hash: a3bfc480
  - Done when (literal da SPEC): em `tests/harness/foundation.spec.ts` (Playwright `headless: true`, sem `slowMo`, sem timers) a pagina `tests/harness/foundation.html`, para cada um dos 7 ids de `THEME_IDS`, seta `data-theme` e `getComputedStyle(document.documentElement)` devolve os valores da tabela de tokens do UISPEC 3.3 (esperados em `tests/fixtures/ui-foundation/`), incluindo `--surface` = `#111111` no `black` e `--scroll-thumb`; um `.t-fire` do harness tem `--tc` = cor base de fogo de `cores.json`; o `.watermark` tem `mask-image` com `pokeball-mask`; `tests/unit/ui-foundation/tokens.test.ts`: `applyTheme("inexistente")` deixa `data-theme="classic"` (sem store). O caso "tema SALVO inexistente no IndexedDB cai para `classic`" e testado em F1.2, depois que o `preferences-store` existe. As comparacoes visuais com `ui-refs/` foram movidas: tema `classic` = `desktop-home.png` (F2.2) e `desktop-detail-charizard-full.png` (F4.1); os outros 6 temas = `theme-<azul|branco|laranja|preto|roxo|verde>-home.png` e `theme-<...>-detail-charizard.png` em T1 (`tests/e2e/responsive.spec.ts`), pois `ui-refs/` nao tem `theme-classico-*`.
  - notas:

- [x] F1.2 i18n e toggle de termos por card
  - hash: e2bc3ad0
  - Done when (literal da SPEC): `tests/unit/ui-foundation/i18n.test.ts`: toda chave de `MESSAGES` tem `pt` e `en` nao vazios (completude do dicionario); nenhuma das chaves excluidas (`detail.noSpawn`, `detail.noSpawnDesc`, `evo.methods`, `captured.progress`, `home.lastCaught`, `ip.noDesc`) existe; `t("chave.inexistente")` lanca em dev; interpolacao `{n}`; `TermsToggle` com `cardKey="moves"` grava o override pelo repositorio (com `fake-indexeddb`) e so o card consumidor re-renderiza (contador de render); trocar `uiLanguage` nao altera `termsOverrides`; o `preferences-store` hidratado com `theme: "inexistente"` (doc gravado via `fake-indexeddb`) chama `applyTheme` (F1.1) e resulta em `data-theme="classic"` com aviso; `npm run lint` verde com a regra `no-literal-jsx-text` (B1.1) sobre `src/`. A comparacao com `desktop-settings-full.png` (bloco de idioma/termos) foi movida para F10.1, onde a tela existe.
  - notas:

- [x] F1.3 Pilha de navegacao com historico real
  - hash: 311fbd0a
  - Done when (literal da SPEC): `tests/unit/ui-foundation/navigation.test.ts`: `navigate` A -> B -> C e `goBack` duas vezes restaura `current.ui` de B e A exatamente (ex. `moveTab: "tm"`, `openMoveRows: ["flamethrower"]`) e o `scroll` salvo; pilha limitada a 40 (41o push descarta o mais antigo); `goBack` com pilha vazia vai para `home`; `updateUi` nao faz push; o gancho de som e chamado 1 vez por `navigate` (spy via `setNavigationSoundHook`) e o padrao no-op nao lanca; `tests/harness/foundation.spec.ts` (Playwright `headless: true`, sem `slowMo`, sem timers) no harness com telas ficticias rolaveis: navegar, rolar 800 px, navegar, `page.goBack()` (popstate) restaura o scroll com tolerancia de 2 px (`expect.poll`) e Alt+Seta esquerda tambem volta. Os fluxos reais foram movidos: "Dex com filtro Fogo + scroll > ficha > Voltar" para F4.1 (primeira feature com Dex e ficha) e "Charizard > Golpes TM > scroll > item > Voltar" para F9.3 (primeira com a pagina de item), ambos repetidos em T1 `tests/e2e/navigation.spec.ts`.
  - notas:

HANDOFF: `.forge/in-progress/pontindex/HANDOFF_frontend-foundation.md`

**inicio**: 2026-09-24 16:53 / **fim**: 17:10 / **duracao**: 17 min

---

## Onda 2 - Juncao

**Agente**: Juncao (Sonnet)  
**Modelo**: Sonnet  
**Inicio quando**: Onda 1 completa  
**Arquivos exclusivos**: `tools/dataset/src/{sprites,artwork-ids,biomes,type-chart,biome-labels.pt}.ts`, `tools/dataset/src/pokeapi/stage.ts` (acrescenta B3.3), `tools/dataset/src/items/`, `tools/dataset/src/species/index-writer.ts`, `tools/dataset/.cache/sprites/`, reuso de `.cache/pokeapi/`, `tools/dataset/out/_staging/`, UNICOS escritores de `public/data/` e `public/assets/`; `tests/unit/dataset/join.test.ts`, `tests/fixtures/join/`  
**Pasta temporaria**: `tools/dataset/out/_staging/`

### Sprint B3 (continuacao): Pipeline de dados, parte 2

- [x] B3.3 Sprites 96px e ids de artwork por forma
  - hash: a9c57660
  - Done when (literal da SPEC): 1025 PNGs em `<outDir>/assets/sprites/` (publicados em `public/assets/sprites` por B2.5, mesma onda; cache em `tools/dataset/.cache/sprites/`) (`ctx.media.register("sprites", ...)` e `ctx.counts.sprites`); Charizard Mega-X `artworkId === 10034` (teste em `tests/unit/dataset/join.test.ts`).
  - notas:

### Sprint B4 (continuacao): Pipeline de dados, parte 3

- [x] B4.1 Catalogo de itens com categoria e textura
  - hash: 2201334b
  - Done when (literal da SPEC): `items.json` >= 932 entradas; `cobblemon:potion` tem descricao pt/en e textura; `cobblemon:aguav_berry` tem `tags` contendo `bait`.
  - notas:

- [x] B4.2 Rotas de obtencao do item e "Usado em"
  - hash: 2201334b
  - Done when (literal da SPEC): `cobblemon:fire_stone.obtain` contem `craftable` e `usedIn.evolutions` contem `{from:133,to:136}`; `cobblemon:old_amber_fossil.usedIn.fossils` contem 142; `allthemons:pika_star.usedIn.fossils` contem 150; `items.json["silentgear:sinew"].obtain` contem `{kind:"drop", from:[{dex:179,...}]}` (RF-68, Mareep, vindo de B2.2).
  - notas:

### Sprint B2 (finalizacao): Pipeline de dados, parte 1

- [x] B2.5 Escrita do indice, fichas, tabela de tipos e biomas (pipeline completo com publicacao)
  - hash: 7e9f9f86
  - Done when (literal da SPEC): (testes em `tests/unit/dataset/join.test.ts`, fixtures em `tests/fixtures/join/`) `speciesDetailSchema` de `src/data/schemas.ts` valida 100% dos `species/*.json`; `species-index.json` tem 1027 entradas e `searchKey` de Quagsire contem `pantano`. (CONDICIONAL, movido de B2.1) Somente se `ATM_INSTANCE_DIR` apontar para uma instancia real disponivel na maquina: rodar o pipeline com ela produz um `species-index.json` identico ao do snapshot (paridade por hash); sem instancia real, o teste e marcado `skip` com o motivo e NAO bloqueia o Done.
  - notas:

HANDOFF: `.forge/in-progress/pontindex/HANDOFF_join.md`

**inicio**: 2026-09-24 17:12 / **fim**: 17:58 / **duracao**: 46 min

---

## Onda 2b - Auditoria de dados

**Agente**: Auditoria (independente)  
**Modelo**: Opus  
**Inicio quando**: Onda 2 verde (dataset publicado)  
**Arquivos exclusivos**: `tools/dataset/audit/`, `tests/unit/dataset/audit.test.ts`; so leitura do resto  

- [x] A1 Auditoria do dataset contra os arquivos originais
  - hash: cd96c8ac f5dce003 (ferramenta), 6d99aa07 de87b5e7 (relatorios)
  - Done when: checagem exaustiva das 1027 especies (campos mecanicos) + bolas, itens e treinadores-chave; amostra manual de 50 especies campo a campo (PT/EN); `AUDIT_REPORT.md` sem divergencia aberta (ou aceita pelo Pontin)
  - notas:

HANDOFF: `.forge/in-progress/pontindex/HANDOFF_audit.md`

**inicio**: 2026-09-24 17:15 / **fim**: 18:24 / **duracao**: 50 min (rodada 1) + 9 min (rodada 2, agente novo). Rodada 2: 0 divergencias em 42.992 checagens; amostra manual 0 diferencas.

---

## Onda 3 - Frontend

**Agente**: Frontend (forge-imp-frontend)  
**Modelo**: Opus  
**Inicio quando**: Onda 1b verde; F1.4 apos B7.1 e B3.4; F2 em diante com a Onda 2 verde (dataset real) e a Onda 2b (auditoria) sem divergencia aberta; backend verde nas dependencias de cada feature  
**Arquivos exclusivos**: `src/` de UI restante (telas F1.4-F12.1); `tests/harness/no-overlap.ts` (criado em F1.4); testes das features F1.4-F12.1 (`tests/e2e/<tela>.spec.ts`, `tests/unit/ui-screens/`)  
**Pasta temporaria**: nenhuma  

### Sprint F1 (finalizacao): Fundacao visual, i18n, navegacao e shell

- [x] F1.4 Shell desktop e mobile, boot, tabbar/sheet e som (paginas reais)
  - hash: f0d5b4fa
  - Done when (literal da SPEC): `mobile-boot-lid-closed.png`, `mobile-nav-mais-sheet.png`; `desktop-home.png` e `mobile-home.png` comparados SO na regiao do shell (sidebar no desktop; topbar-aparelho e tabbar no mobile), com a area de conteudo `#main` mascarada (`toHaveScreenshot({ mask: [page.locator("#main")] })`), porque a Home real so existe em F2; teste: com som ligado, abrir o app toca `pokedex_open` (spy); `navigate` toca `pokedex_click_short` pelo gancho; com "Reduzir animacoes" ligado, `getComputedStyle(watermark).animationDuration === "0.001s"`. Cria `tests/harness/no-overlap.ts` (`expectNoOverlap`, regra geral "Sem sobreposicao de texto") e aplica no shell (tabbar, sheet "Mais", cabecalho) a 360 px, 390 px e 1280 px, PT e EN.
  - notas:

### Sprint F2: Home, busca e blocos de time e historico

- [x] F2.1 Busca com autocomplete
  - hash: 04fe3b34
  - Done when (literal da SPEC): testes: "025"/"25"/"0025" -> Pikachu; "pantano" com UI em ingles -> Quagsire; "charizar" -> Charizard; dropdown de autocomplete: sem captura de referencia (nenhuma imagem em `ui-refs/` cobre o dropdown aberto); validar contra as regras `.search-dd` de `style.css:353-354`.
  - notas:

- [x] F2.2 Time, historico e resumo de capturados na Home
  - hash: 2b93c758
  - Done when (literal da SPEC): `desktop-home.png` (tambem e a referencia do tema `classic` para a Home, movida de F1.1); testes: 7o Pokemon -> aviso e nao adiciona; 21o no historico -> o mais antigo sai; reload mantem time e historico (fake-indexeddb).
  - notas:

### Sprint F3: Pokedex (lista virtualizada e filtros)

- [ ] F3.1 Grade virtualizada e card de Pokemon
  - hash:
  - Done when (literal da SPEC): com 1027 itens, o DOM contem <= 60 `.pcard` simultaneos (teste Playwright conta nos); `desktop-dex-grid.png`; a 360 px e 390 px nenhum badge quebra o proprio texto (a LINHA de selos pode quebrar, regra "Sem sobreposicao de texto") (teste de largura, RNF-09).
  - notas:

- [ ] F3.2 Filtros combinaveis
  - hash:
  - Done when (literal da SPEC): Fogo + gen1 -> somente Fogo gen1; "item" -> so especies com evolucao por item; remover filtro nao remonta `DexScreen` (teste com `data-mount-id`). + barra de busca igual a da Home combinada com os filtros (decisao do Pontin; ver SPEC F3.2 passo 4)
  - notas:

### Sprint F4: Ficha do Pokemon (parte 1: hero, stats, fraquezas, evolucao, habilidades, golpes)

- [ ] F4.1 Hero card, selos, shiny, grito e acoes
  - hash:
  - Done when (literal da SPEC): `desktop-detail-charizard-full.png` (hero; tambem e a referencia do tema `classic` para a ficha, movida de F1.1), `desktop-detail-mewtwo-legendary-full.png` sem o badge "NAO NASCE NO MUNDO", `desktop-detail-mew-mythical-full.png`; teste: raios `::before` tem `width: 240%` e `border-radius: 50%`; e2e movido de F1.3 (primeira feature com Dex e ficha reais): "Dex com filtro Fogo + scroll > ficha > Voltar" restaura filtro e scroll (tolerancia 2 px, `expect.poll`, sem timers). Hero sem sobreposicao: `expectNoOverlap` no hero a 360 px, 390 px e 1280 px, em PT e EN, com o caso mais longo de selos (Lendario + raridade `ultra-rare`, e Mitico) e os botoes shiny/grito; nenhum selo cruza os botoes.
  - notas:

- [ ] F4.2 Stats, fraquezas/resistencias e habilidades
  - hash:
  - Done when (literal da SPEC): Charizard: Pedra x4, Agua x2, Eletrico x2, Fogo x1/2, Terra x0 (imune); `desktop-detail-charizard-resistances.png`.
  - notas:

- [ ] F4.3 Cadeia de evolucao clicavel
  - hash:
  - Done when (literal da SPEC): Eevee mostra 8 ramos com metodos reais (Espeon = Amizade 160 + de dia; Sylveon = Amizade 160 + golpe de Fada; Jolteon = Pedra do Trovão clicavel); Charizard linear 16/36.
  - notas:

- [ ] F4.4 Golpes com abas e descricao
  - hash:
  - Done when (literal da SPEC): `desktop-detail-charizard-moves-tm.png`; trocar aba mantem scroll da tela e nao remonta `DetailScreen`.
  - notas:

### Sprint F5: Ficha do Pokemon (parte 2: onde encontrar, como obter, formas, melhor bola, calculadoras)

- [ ] F5.1 Onde encontrar, raridade, drops e Como obter
  - hash:
  - Done when (literal da SPEC): Eevee mostra 5 entradas com bucket principal Incomum e secundarios Raro/Ultra-raro; Mewtwo mostra "Como obter: Fóssil (Pika Star / Ancient DNA Sample)" e nenhum aviso generico; especie sem rota mostra `.ob-none`.
  - notas:

- [ ] F5.2 Abas de forma com item necessario
  - hash:
  - Done when (literal da SPEC): `desktop-detail-charizard-mega-x-form.png`: Mega X exibe Charizardite X + Keystone clicaveis.
  - notas:

- [ ] F5.3 Melhor Pokebola na ficha
  - hash:
  - Done when (literal da SPEC): Magikarp: Net Ball (3x) acima da Poké Ball; Dusk Ball exibe "3.5x com luz 0".
  - notas:

- [ ] F5.4 Calculadoras (stats e efetividade)
  - hash:
  - Done when (literal da SPEC): base 100/L100/IV31/EV252 neutro = 299, favoravel = 328, desfavoravel = 269; Charizard recomenda IV 31 em Sp. Atk (109) e Speed (100); Fogo/Agua vs Fogo = x1/2.
  - notas:

### Sprint F6: Captura (animacao) e lista de capturados

- [ ] F6.1 Animacao de captura
  - hash:
  - Done when (literal da SPEC): capturas `capture-outros-01-start` ... `08-final-reveal`, `capture-legendario-*`, `capture-mitico-*`; teste (Vitest, fake timers do Vitest no hook, nao no Playwright): a timeline dispara os 7 sons na ordem `poke_ball_throw_1`, `poke_ball_shake_1`, `poke_ball_shake_2`, `poke_ball_shake_3`, `poke_ball_open`, `poke_ball_shake_critical`, `poke_ball_capture_succeeded`, e fechar o overlay toca o 8o, `pokedex_close` (spy).
  - notas:

- [ ] F6.2 Lista de capturados
  - hash:
  - Done when (literal da SPEC): `desktop-captured-list.png` com "X de 1.027" (formatado pelo `Intl.NumberFormat` do idioma); reload mantem a lista.
  - notas:

### Sprint F7: Comparar

- [ ] F7.1 Comparar dois Pokemon
  - hash:
  - Done when (literal da SPEC): `desktop-compare.png`; swap inverte os lados sem perder scroll.
  - notas:

### Sprint F8: Treinadores e timeline

- [ ] F8.1 Picker de series, serie ativa e Modo Livre
  - hash:
  - Done when (literal da SPEC): `atm_team` aparece bloqueada com "Requer: Diamante brilhante/Pérola reluzente" ate a BDSP ficar completa; Modo Livre bloqueado sem serie concluida; escolha persiste no reload.
  - notas:

- [ ] F8.2 Linha do tempo, cap vigente e derrotados
  - hash:
  - Done when (literal da SPEC): BDSP sem derrotados = cap 15; Roark derrotado = 16; Mars = 20; Jupiter = 22; apos Gardenia os 3 Cedric aparecem como "Próximo" e o cap exibido e 22; apos um Cedric, Maylene = 30; `desktop-trainers-expanded-full.png`.
  - notas:

### Sprint F9: Colecoes (Pokebolas e itens)

- [ ] F9.1 Grade de Pokebolas
  - hash:
  - Done when (literal da SPEC): `desktop-balls-full.png`; `balls.json.length` cards com filtro "Todas" (48 no dataset atual; nunca um numero fixo no codigo).
  - notas:

- [ ] F9.2 Grade de itens com busca PT/EN
  - hash:
  - Done when (literal da SPEC): `desktop-items-grid.png` (referencia vale para grade, cores, icones e abas; o cabecalho do `.item-card` e MASCARADO na comparacao, porque o layout mudou: tag acima do nome, ver UISPEC nota de 2026-09-24); buscar "pocao" acha "Poção/Potion" com card em EN. Card de item: tag da categoria acima do nome; `expectNoOverlap` na grade de itens a 360 px, 390 px e 1280 px, PT e EN, incluindo nomes longos (ex. "Choice Scarf", "Leftovers"), sem o nome quebrar por falta de espaco causada pela tag.
  - notas:

- [ ] F9.3 Pagina do item
  - hash:
  - Done when (literal da SPEC): e2e movido de F1.3 (criterio de aceite, primeira feature em que a pagina de item existe): "Charizard > Golpes TM > scroll > item > Voltar" restaura aba, scroll (tolerancia 2 px) e linhas abertas (Playwright `headless: true`, sem `slowMo`, `expect.poll`); `desktop-item-page-full.png` (Poção); Fire Stone lista "Usado em: Eevee -> Flareon, Vulpix -> Ninetales, Growlithe -> Arcanine"; item sem rota mostra "Sem rota confirmada".
  - notas:

### Sprint F10: Configuracoes

- [x] F10.1 Preferencias visuais e de som
  - hash: 048f5b9c
  - Done when (literal da SPEC): `desktop-settings-full.png` (inclui o bloco de idioma/termos, comparacao movida de F1.2); criterio "Preto + Inglês + som off + reduzir on" persiste apos reload.
  - notas:

- [x] F10.2 Backup, apagar dados e restaurar snapshot
  - hash: 58419b91
  - Done when (literal da SPEC): round-trip exportar -> instalacao limpa -> importar = 5 entidades identicas (teste e2e com dois contextos de navegador); apagar so historico mantem as outras 4.
  - notas:

### Sprint F11: Sincronizacao

- [x] F11.1 Gerar codigo
  - hash: b319f0e3
  - Done when (literal da SPEC): com 1027 capturados + tudo, gera n frames (n >= 2) e o texto completo; com 20 capturados gera 1 QR; nenhuma requisicao de rede durante a acao (teste Playwright intercepta `**/*` e falha se houver).
  - notas:

- [x] F11.2 Receber codigo, resumo e mesclar/substituir
  - hash: bd2468be
  - Done when (literal da SPEC): criterio de aceite dos dois dispositivos (A/B) reproduzido em teste unitario de `mergeDocuments` e em e2e com dois contextos; codigo corrompido -> erro e IndexedDB identico (snapshot antes/depois).
  - notas:

### Sprint F12: PWA avancada

- [ ] F12.1 PWA instalavel e cache
  - hash:
  - Done when (literal da SPEC): `navigator.serviceWorker.controller` presente no 2o load; recarregar offline (Playwright `context.setOffline(true)`) mantem Home, Dex e uma ficha ja aberta.
  - notas:

HANDOFF: `.forge/in-progress/pontindex/HANDOFF_frontend.md`

**inicio**: / **fim**: / **duracao**:

---

## Onda 4 - Testes

**Agente**: Testes  
**Modelo**: Sonnet  
**Inicio quando**: Tudo acima verde  
**Arquivos exclusivos**: `tests/` restantes  
**Pasta temporaria**: `test-results/`, `playwright-report/`

### Sprint T1: Testes e2e, cobertura, visual

- [ ] T1 Testes e2e, visual snapshot, cobertura e documentacao final
  - hash:
  - Done when (literal da SPEC): ver SPEC Sprint T1 (matriz de testes); todos os testes definidos la verdes, headless, sem slowMo nem timers
  - notas:

HANDOFF: `.forge/in-progress/pontindex/HANDOFF_tests.md`

**inicio**: / **fim**: / **duracao**:

---

## Fase 2 - NAO executar agora

Sprints P1-P3 da SPEC (so depois que o Pontin testar e aprovar o site):

- [ ] P1 Electron (Windows .exe)
- [ ] P2 Capacitor 8 (Android .apk)
- [ ] P3 Atualizador automatico e botao "Baixar app"

---

## Notas por fase

(Preenchidas durante execucao com desvios, blocadores e decisoes)
- Onda 1 (2026-09-24, consolidado pelo orquestrador a partir dos HANDOFF_*): B2.3+B2.4 num commit so (dependencia real, aceito). Achados verificados nos dados e corrigidos na SPEC: Mewtwo e Charizard tem spawn proprio; BDSP tem 43 treinadores-chave (kubejs torna 10 revanches obrigatorias); cap apos UM Cedric continua 22 pela regra do bytecode (OPEN: conferir no jogo); Fogo/Agua vs fogo = x0.25. PokeAPI: 797 golpes (Z-Moves/G-Max fora, nenhuma especie aprende), alias visegrip->vice-grip. Texturas mantem subpasta (65 colisoes de nome). Gap no contrato congelado: BallCondition sem valor para fast_ball e net_ball (cast documentado; estender a uniao na Onda 2).

- Onda 0 (2026-09-24): B1.2 commitado, mas a parte do Done when que exige deploy de preview na Vercel fica PENDENTE (depende de push, nao autorizado, e do dataset publicado na Onda 2). Decisoes e desvios da Onda 0 listados em HANDOFF_base.md (secao Decisoes).

---

## Bugs encontrados

| Fase/Feature | Descricao | Causa | Fix / commit |
|---|---|---|---|
| Onda 0 / B1.1 | `eslint.config.js` acusou a si mesmo: a constante com o travessao escrita como string literal caia na propria regra | literal com U+2014 no config | caractere montado com `String.fromCharCode(0x2014)`, no mesmo commit 3728f119 |
| Onda 0 / B2.2 | Merge (a) fazia o base vencer em TODOS os campos exceto forms/labels; zygarde e lycanroc ficavam nao implementados | lista de base-wins da SPEC tratada como aberta | so a lista fechada da SPEC fica com o base, o resto segue o addon; fix 994cade8 |
| Onda 0 / B1.5 | `npx playwright test --list` sai 1 sem testes | comportamento padrao do Playwright (No tests found), nao e erro de config | conferido com `--pass-with-no-tests` (sai 0); nada a corrigir |

(Preenchida durante execucao)

---

**Gerado em**: 2026-09-24  
**SPEC**: commit fe421ec1  
**Verificacao**: sem em dash (U+2014) em qualquer linha
