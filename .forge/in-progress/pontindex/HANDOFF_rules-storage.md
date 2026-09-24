# HANDOFF - Onda 1, Regras e armazenamento (rules-storage)

Agente: forge-imp-backend (Onda 1, Regras e armazenamento). Inicio 2026-09-24 16:25. Fim 2026-09-24 16:56.

| Feature | Status | Commit | Notas |
|---|---|---|---|
| B6.6 | verde | `07994a2f` | `tests/unit/domain/history-team.test.ts` (8) |
| B7.1 | verde | `34a1bd4c` | `tests/unit/storage/storage.test.ts` (17); fix `in` -> `Object.hasOwn` no repo de treinadores foi junto em `83ee3ac6` |
| B7.2 | verde | `83ee3ac6` | `tests/unit/sync/sync.test.ts` (22, inclui property test fast-check 150 execucoes) |
| B7.3 | verde | `4c119252` | `tests/unit/storage/backup.test.ts` (4) |
| B6.1 | verde, com divergencia no exemplo da SPEC | `f504815d` | `tests/unit/domain/type-chart.test.ts` (5). Ver "Divergencias" 1 |
| B6.2 | verde | `4ff246ad` | `tests/unit/domain/stats.test.ts` (6) |
| B6.3 | verde, com divergencia no exemplo da SPEC (DECISAO PENDENTE) | `19cdde93` | `tests/unit/domain/level-cap.test.ts` (11). Ver "Divergencias" 2 |
| B6.4 | verde | `945b707a` | `tests/unit/domain/ball-ranking.test.ts` (6): Magikarp 44/2/2 exato, Charizard, peso 3500 |
| B6.5 | verde | `95e1c02f` | `tests/unit/domain/search.test.ts` (7) |
| B7.4 | verde | `16fd5b73` | `tests/unit/data/loaders.test.ts` (8) |
| extra | - | `fa6bd9ab` | `tests/unit/storage/validate-errors.test.ts` (7): reparo de docs, mapeamento de erros, persist, fallback em memoria |

Suite deste agente: 10 arquivos, 101 testes, verde (`npx vitest --run tests/unit/domain tests/unit/storage tests/unit/sync tests/unit/data/loaders.test.ts`, ~5 s). `tsc -p tsconfig.app.json` e `tsc -p tsconfig.node.json` limpos nos meus caminhos (o node tem erros SO em `tests/unit/dataset/pokeapi-media.test.ts`, de outro agente). ESLint limpo nos meus caminhos. Cobertura (v8) dos meus modulos: domain 99,5% linhas / 97,8% branches; sync 98,8% / 83,7%; storage ~88% linhas antes do teste extra.

## Divergencias da SPEC (o orquestrador decide)

1. **B6.1, exemplo "Fogo/Agua vs fire = 0.5 x 1 = 0.5"**: pela tabela literal do prototipo (`app.js:280-299`, portada sem mudanca), `fire -> fire = 0.5` e `fire -> water = 0.5`, entao um defensor Fogo/Agua recebe **0.25** de um ataque de fogo. O exemplo da SPEC esta errado (o "x 1" so vale para Charizard, fire/flying: 0.5 x 1 = 0.5, que o teste cobre). Implementei a tabela literal; o teste afirma 0.25 para fire/water e 0.5 para fire/flying.
2. **B6.3, passo "+ um Cedric -> {Maylene} -> 30"**: a regra literal do passo 4 (`available = keyTrainers.filter(isAvailable)`, `X = min(trainerLevel)`) mantem os OUTROS dois Cedric (0445/0447) disponiveis depois de derrotar um (eles continuam nao derrotados e o pre-requisito Gardenia esta satisfeito). Resultado literal: `min(22, 22, 30) = 22`, nao 30. Os valores 15/16/20/22/22/100, `none` 15 e freeroam 100 batem. Implementei a formula literal (sem inventar regra); o teste cobre 22 nesse passo e 30 no cenario em que so Maylene esta disponivel. Se a intencao for "os 3 Cedric sao alternativas (um grupo OR em `requiredDefeats` de Maylene); derrotar um retira os outros do conjunto disponivel", isso e uma regra nova a aprovar (daria exatamente 15/16/20/22/22/30/100). Nao apliquei por ser suposicao.
3. **B4.3 x B6.4, `fast_ball`/`net_ball`**: a tabela de B4.3 nao define `condition` para essas duas (so `applies`). O ranking ignora `condition` quando `applies` tem `types`, `minBaseSpeed` ou `label` (intrinsecas), entao qualquer valor que o agente de Bolas escolher funciona. Na minha fixture usei `firstTurn` como marcador.
4. **Backup com `format` desconhecido** -> `corrupted` (matriz 5c); `schemaVersion` maior que o atual -> `unsupportedVersion` (mesma regra do sync).
5. `decodeSyncCode` recebendo um frame `PDXF.` devolve erro `incomplete` (mensagem "frame: feed it to FrameCollector"); a UI deve mandar frames para o `FrameCollector` antes de decodificar (o `FrameCollector.add` tambem aceita o codigo inteiro `PDX1.` e o trata como completo).

## O que esta pronto (API real, para a Onda 1b e a Onda 3)

### Storage (`src/storage/index.ts`)
- `createStorageAdapter(opts?)` -> `IndexedDbAdapter` (banco `pontindex` v1, stores `documents` keyPath `key` e `backups` keyPath `id`), ou `MemoryAdapter` com notice `memoryFallback` quando nao ha IndexedDB. `await adapter.init()` no boot.
- Adapter (`DocumentStorage`): `init/read/readAll/write/writeMany/delete/exportSnapshot/importSnapshot` + `readOrDefault(key)`, `readOnly`, `migration` (`fresh|current|migrated|readOnly`), `notices`, `listSnapshots()`, `restorePreMigrationSnapshot(id)`, `clearSnapshots()`, `close()`. `opts.onNotice(n)` recebe `corrupt | repaired | blocked | readOnly | memoryFallback`.
- `read(key)` devolve `null` para doc nunca gravado. Leitura repara (5 slots no time vira 6, historico > 20 truncado, entradas invalidas descartadas) com `console.warn`; irreparavel vai para `backups` como `corrupt-<key>-<ts>` e volta o padrao.
- Escrita: `writeMany` numa transacao unica que tambem atualiza `meta.lastWriteAt`; fila serializa; valida estrito (doc invalido rejeita com `UNKNOWN`). Erros: `StorageFailure` (`QUOTA_EXCEEDED | BLOCKED | UNAVAILABLE | UNKNOWN`). Quota no meio da transacao nao altera o doc anterior (testado).
- Repositorios: `createCapturedRepository` (`getAll/listKnown/has/add/remove`; re-marcar mantem a data), `createTeamRepository` (`get/add/remove`; 7o -> `{ok:false, reason:"full"}`), `createHistoryRepository` (`get/push`), `createTrainerProgressRepository` (`get/markDefeated/unmarkDefeated/setActiveSeries/enterFreeroam/leaveFreeroam`), `createPreferencesRepository` (`get/set(patch)`). Salvar o mesmo conteudo nao escreve.
- `filterKnown(entries, datasetIndex)`, `requestPersistence()` (chamar no 1o gesto; `init` NAO chama), `getPersistenceResult()`.
- `DOC_DEFAULTS`, `defaultDoc`, `defaultDocs`, `CURRENT_SCHEMA_VERSION = 1`. Tema padrao `THEME_IDS[0]` (`classic`), idioma `pt`, som ligado, `reduceMotion: null` (segue o sistema).
- Migracoes: sem `meta` = instalacao nova = v0 -> roda 0->1 (importa `pontindex.terms`/`pontindex.sound` do localStorage e remove depois do commit), sem snapshot. `meta.schemaVersion` antigo -> snapshot `pre-migration-v<from>-<ts>` + `up` + commit numa transacao. Versao maior -> somente leitura.
- `src/storage/backup.ts`: `exportBackup`, `parseBackup(text)` (BOM aceito, > 5 MB `oversized`, app errado `foreignApp`, CRC/format/doc invalido `corrupted`), `applyBackup(adapter, file, "merge"|"replace")` (migra se antigo, `mergeDocuments`, um `writeMany`, meta local mantido), `deleteData(adapter, keys | "all")` ("all" limpa `backups`), `backupFileName(date)`, `serializeBackup(file)`.

### Sync (`src/sync/index.ts`, carregar lazy)
- `encodeSyncCode(docs, {now?, sessionId?, capacity?})` -> `{text, frames, bytes, summary}`; `decodeSyncCode(text, {now?})` -> `{ok, value: {docs, summary, schemaVersion, exportedAt}} | {ok:false, error: SyncError}` com a ordem exata de 9 passos da SPEC (um teste por passo). Ids ASCII `/^[a-z0-9_:\-.]+$/` (e "__proto__" recusado); dex > 65535 lanca `RangeError` no encode.
- `splitFrames`, `FrameCollector` (`add -> {complete, received, total, sessionId, error?: "otherSession"|"invalidFrame"}`, `assemble()`, `reset()`), `mergeDocuments(local, incoming, mode)`, `summarize(docs, datasetIndex, {knownTrainerIds?, exportedAt?})`.
- Caso maximo (1027 capturados com datas, 110 derrotados, 20 historico) gera >= 2 frames de <= 900 caracteres e reconstroi identico em qualquer ordem.

### Dominio (`src/domain/`)
- `type-chart.ts`: `TYPE_CHART`, `TYPE_IDS`, `singleMultiplier`, `effectivenessAgainst`, `groupByMultiplier` (linhas 4, 2, 0.5, 0.25, 0), `typeChartMatrix()` (formato do `type-chart.json`, para B2.5 comparar).
- `natures.ts` (`NATURES` 25, nomes pt/en do lang, `natureModifier`), `stats.ts` (`calculateHp`, `calculateOther` em aritmetica inteira, `calculateStats` -> `{atLevel, atLevel100}`, `StatRangeError.code`, `recommendedInvestment`).
- `level-cap.ts`: `requiredDefeatsSatisfied`, `isAvailable`, `computeTrainerLevel`, `computeSeriesCap({keyTrainers, defeated, config, mode, allTrainers?})` -> `{cap, x, available, reason}`, `isSeriesCompleted`, `isSeriesUnlocked(series, allSeries, defeated, config?)`, `isFreeroamUnlocked`, `defeatedSet(progress)` (uniao de todas as series), `capModeFromProgress(progress)`.
- `ball-ranking.ts`: `rankBalls(species, balls, {captured})` (so ranqueadas), `partitionBalls` -> `{ranked, guaranteed, excluded}`, `compareRanked`.
- `search.ts`: `normalizeSearch` (reexport), `parseDexQuery`, `searchSpecies(index, q, limit?)`, `searchItems(items, q, limit?)`.
- `history.ts`/`team.ts`: `HISTORY_LIMIT`, `pushHistory`, `mergeHistory`, `TEAM_SIZE`, `addToTeam`, `removeFromTeam`, `normalizeTeam`, `isTeamEmpty`.

### Dados (`src/data/`)
- `schemas.ts`: esquemas zod anotados com os tipos congelados (`datasetManifestSchema`, `speciesSummarySchema`, `speciesIndexSchema`, `speciesDetailSchema`, `typeChartSchema` (exige 18 x 18), `movesFileSchema`, `abilitiesFileSchema`, `itemsFileSchema`, `ballsFileSchema`, `seriesFileSchema`, `trainersFileSchema`, `fossilsFileSchema`, `biomeLabelsSchema`, `currentDatasetPointerSchema`, e os de item/entrada). Prontos para B2.5 importar.
- `loaders.ts`: `loadManifest` (via `/data/current.json`), `loadDatasetVersion`, `loadSpeciesIndex`, `loadSpecies(dex)`, `loadMoves`, `loadAbilities`, `loadItems`, `loadBalls`, `loadSeries`, `loadTrainers(seriesId)`, `loadTypeChart`, `loadBiomes`, `loadFossils`; `DatasetError.code` = `NOT_FOUND` (ex. sem `current.json`: tela "rode npm run dataset") | `NETWORK` | `INVALID`. Cache em memoria + dedup em voo, timeout 15 s, 2 retries (500/1500 ms) SO para `NETWORK`; falha nao fica em cache. `configureLoaders(patch)` para testes. Os caminhos saem de `manifest.files` (`speciesDir`/`trainersDir` + `/<id>.json`).
- `src/platform/{index,web}.ts`: `platform` (`isNative false`, `hasCamera()`, `canInstall()`), `setInstallPromptAvailable`.

## Fixtures (`tests/fixtures/rules-storage/`)
- `bdsp-key-trainers.json`: os 8 treinadores reais da BDSP (Roark, Mars `commander_mars_03c2`, Jupiter `commander_jupiter_041d`, Gardenia, 3 Cedric, Maylene) com `maxTeamLevel` e `requiredDefeats` conferidos no snapshot (`data/rctmod/mobs/trainers/single` e `data/rctmod/trainers`). Nota: os ids de Mars/Jupiter comecam com `commander_`, nao `team_galactic_`.
- `balls.json`: as 48 bolas (basenames de `textures/item/poke_balls/`), nomes/efeitos pt/en do lang do Cobblemon 1.7.3, regras da tabela de B4.3.
- `species-6.json`: ficha de exemplo (Charizard) valida no `speciesDetailSchema`.

## Notas
- Testes deste agente usam `// @vitest-environment node` (o jsdom custava ~20 s de setup por execucao); `fake-indexeddb/auto` importado no proprio teste.
- `__APP_VERSION__` declarado localmente em `src/storage/defaults.ts` (o tsconfig.node dos testes nao inclui `vite-env.d.ts`); fallback "0.0.0".
- Nenhum arquivo congelado foi editado. Nada escrito em `public/`.
