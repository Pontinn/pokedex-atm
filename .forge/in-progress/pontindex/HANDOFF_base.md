# HANDOFF - Onda 0 (Base)

Agente: forge-imp-backend (Onda 0). Inicio 2026-09-24 15:53, fim 2026-09-24 16:20.
Features: B1.1, B1.2, B1.3, B1.4, B1.5, B2.1, B2.2 (todas com commit; B1.2 com uma pendencia, ver abaixo).

## Commits

| Feature | Commit | Verificacao executada |
|---|---|---|
| B1.1 | `3728f119` | `npm run typecheck`, `npm run lint`, `npm run build` verdes; `dist/index.html` |
| B1.2 | `0460f36d` | `vercel.json` valido; `dist/` ignorado (status limpo apos build). PENDENTE: deploy de preview na Vercel (precisa de push + dataset publicado na Onda 2) |
| B1.3 | `e8a67bc0` | `dist/sw.js` + `dist/manifest.webmanifest`; preview aberto com Playwright headless interceptando `**`: 5 requests, 0 externos |
| B1.4 | `6bbff07f` | `tests/unit/build/type-css.test.ts` (snapshot) verde; 5 PNGs em `public/icons`; `gen:assets` idempotente |
| B1.5 | `07372462` | `tests/unit/build/contracts.test.ts` verde; `vitest --run --passWithNoTests`; `playwright test --list` das duas configs carrega |
| B2.1 | `865fc37c` | `tests/unit/dataset/source.test.ts` (11 testes) verde; `npm run dataset -- --only speciesCore --out tools/dataset/out/_base --skip-media --report` sai 0 |
| B2.2 | `225900a4` + fix `994cade8` | `tests/unit/dataset/species-merge.test.ts` (10 testes) verde; o mesmo comando imprime `species 1027`, `pack {"name":"All the Mons","version":"1.3.0","minecraft":"1.21.1"}`, `cobblemonVersion 1.7.3` (tambem em `tools/dataset/out/_base/report.json`) |

Suite atual: `npx vitest --run` = 4 arquivos, 27 testes, verde.

## Contagens reais observadas no snapshot `data-source/atm-1.3.0`

- Modo detectado: `snapshot` (os 7 jars obrigatorios sao diretorios). Existe um 8o jar em `mods/` (`rctapi-neoforge-1.21.1-0.15.2-beta.jar`, so `META-INF`), fora da lista obrigatoria: ignorado.
- Arquivos `data/cobblemon/species/**.json`: 1088 (Cobblemon 1025, allthemons 2, ccc 9, mega_showdown 52). 61 deles sao overrides de dex ja existente -> **1027 especies** (dex unicos: 1..1025, 9901 Piglich, 9902 Creepyon).
- `species_additions`: 366 (allthemons 11, ccc 225, mega_showdown 117, zamega 12, kubejs 1 `zzz_ccc_meltan`). Todas casaram com uma especie (0 sem alvo). Uma adicao usa `target` SEM namespace (`"pikachu"`): o alvo e resolvido com ou sem `cobblemon:`.
- Campos usados pelas adicoes: `drops` 14, `features` 36, `forms` 98, `implemented` 262, `evolutions` 6, `moves` 1, `maleRatio` 1 (resto e visual: hitbox, baseScale, behaviour, riding...).
- Formas apos o merge: 432 formas em 248 especies. Charizard: `Mega-X` e `Mega-Y` ja existem no Cobblemon base (mesmo conteudo do mega_showdown), `Gmax` vem do mega_showdown.
- Geracoes (label `gen*`): gen1 151, gen2 100, gen3 135, gen4 107, gen5 156, gen6 72, gen7 86, gen7b 2, gen8 89, gen8a 7, gen9 120, custom 2. Todas as especies do Cobblemon tem label `gen*`.
- `implemented` != true apos o merge: 0 (apos o fix 994cade8; antes zygarde e lycanroc ficavam de fora por bug, pois o base nao tem `implemented` e o override do ccc traz `true`).
- Golpes: prefixos ignorados de proposito `legacy` 12613, `special` 339, `form_change` 7; nenhum prefixo desconhecido.
- Lang: 15 camadas (pt_br/en_us de cobblemon, allthemons, ccc (so en_us, 3 chaves), legendarymonuments, mega_showdown (cobblemon + mega_showdown), zamega, rctmod). Tabela final: 12238 chaves pt, 12309 en. 230 conflitos (addon redefinindo chave do Cobblemon com outro texto): o Cobblemon venceu, amostra em `merge-report.json`.
- Nomes: 0 especies sem nome no lang. Quagsire pt = "Pântano"; Piglich pt/en = "Piglichu"; Creepyon = "Creepyon". 1 especie sem `pokedexText`.
- 932 especies com `drops`. Mareep (179): 4 drops, inclui `{item:"silentgear:sinew", percentage:25, quantityRange:null}`.
- JSON: 0 arquivos com BOM, 0 invalidos (parse estrito passa em tudo).

## Decisoes tomadas (registrar se algo divergir)

1. Versoes (fixas, sem `^`): alvos da §5b.1 na ultima patch do alvo (react 19.1.9, vite 6.3.7, typescript 5.8.3, vite-plugin-pwa 1.0.3, zustand 5.0.15, zod 3.24.4, idb 8.0.3, fflate 0.8.3, tsx 4.19.4, sharp 0.34.5, lucide-react 0.577.0, @playwright/test 1.63.0 igual ao global). "Ultimas estaveis" compativeis com Vite 6: vitest 3.2.7 (+ @vitest/coverage-v8), eslint 9.39.5, typescript-eslint 8.70.1, jsdom 26.1.0, fake-indexeddb 6.2.5, msw 2.15.0, fast-check 3.23.2, prettier 3.9.9, @testing-library/jest-dom 6.9.1 (6.10.0 esta deprecado). Extras necessarios: `@eslint/js`, `globals`, `eslint-plugin-react-hooks`, `@types/{react,react-dom,node,qrcode}`. Nada instalado fora do projeto.
2. npm 11 avisa `allow-scripts` para sharp, esbuild e msw (scripts de install nao rodaram), mas os binarios funcionam (conferido: sharp e esbuild carregam). Nao aprovei scripts.
3. tsconfig em 3 arquivos (padrao do template Vite): `tsconfig.json` (so references + paths), `tsconfig.app.json` (`src/`), `tsconfig.node.json` (configs, `tools/**`, `tests/**`). `strict` + `noUncheckedIndexedAccess` + `noUnused*`. Paths `@/*` e `@dataset-types` nos tres. O pipeline importa os tipos por caminho relativo (`../../../src/data/types`).
4. ESLint: regra propria `pontindex/no-literal-jsx-text` (erro fora de `src/i18n/`) e `no-restricted-syntax` contra U+2014 em literais/templates/JSX. Ambas testadas com arquivo de prova.
5. Vitest: ambiente padrao `jsdom`; `environmentMatchGlobs` manda `tests/unit/{build,dataset}/**` para `node`. O Vitest 3 imprime aviso de deprecacao dessa opcao (funciona). `tests/setup.ts` carrega `@testing-library/jest-dom/vitest` e `fake-indexeddb/auto`.
6. `playwright test --list` com 0 testes sai com codigo 1 ("No tests found"); com `--pass-with-no-tests` sai 0. Nao e erro de configuracao.
7. Merge (a) override completo (corrigido no fix `994cade8`): o base vence SO na lista fechada da SPEC (`baseStats`, `moves`, `evolutions`, `abilities`, `eggGroups`, `drops`, `catchRate`, `weight`, `height`, `maleRatio`, `preEvolution`); `forms` = uniao por name (addon substitui a forma de mesmo nome inteira); `labels` = uniao; QUALQUER outro campo presente no addon vale o do addon (53 overrides aplicam campos assim: `implemented` 22, `behaviour` 36, `hitbox` 22, `riding` 17, `baseScale` 14 e outros). `merge-report.json`: `baseFieldDiffs` = campos da lista em que o base venceu (ex. ccc dialga traz `moves: []`, o base venceu); `otherFieldDiffs` = campos aplicados do addon.
8. Merge (b) adicao: `forms` de mesmo nome sao mesclados campo a campo (a adicao vence campo a campo, campos que ela nao traz ficam); forma nova e acrescentada.
9. `--out` so e aceito dentro de `tools/dataset/out/<subpasta>/` (o staging e apagado a cada execucao) -> `E_OUT_DIR_UNSAFE` fora disso. `report.json` e gravado sempre; `merge-report.json` fica em `<out>/merge-report.json` (o SPEC cita `tools/dataset/out/merge-report.json`, que e o caso do staging padrao no nivel de `<out>`).
10. Em qualquer erro de etapa, a pasta de staging da execucao e removida (nada parcial).

## O que esta pronto para cada agente da Onda 1

Comum:
- `npm run dataset -- --only <etapa> --out tools/dataset/out/_<parte>` roda `speciesCore` (lang + 1027 especies em `ctx.species`) e depois SO a sua etapa. Nunca publica.
- Contrato em `tools/dataset/src/context.ts`: `PipelineContext` (`reader`, `source` (pack, cobblemonVersion, sources), `lang` (`text(key)` -> `{pt,en}` ou null), `species: Map<dex, MergedSpecies>`, `counts`, `media`, `levelCapConfig`, `outDir`, `report`, `flags`, `setCount(key, value)`, `cacheDir("pokeapi"|"sprites")`, `dataPath(...)`, `assetPath(...)`). `COUNT_OWNERS` diz qual etapa grava cada contagem; `setCount` lanca erro se outra etapa tentar.
- `MergedSpecies` traz tudo parseado (`types`, `baseStats` camelCase, `abilities`, `moves`, `drops` achatado, `eggGroups`, `labels`, `generation`, `name`, `pokedexText`) + crus: `evolutionsRaw`, `preEvolutionRaw`, `forms: MergedForm[]` (`name`, `source`, `aspects`, `battleOnly`, `labels`, `types`, `baseStats|null`, `abilities`, `raw`), `features`, `raw` (JSON mesclado), `origins` (campo -> origens).
- Leitura da fonte SEMPRE por `ctx.reader`: `listJars()`, `jar(id)`, `readJar(ref, prefixes)` (caminhos internos com `/`), `readTree("kubejs")` (chaves relativas a pasta pedida), `readFile("config/rctmod-server.toml")` (ausente -> `E_SNAPSHOT_INCOMPLETE`), `exists(rel)`. Helpers: `readJsonEntries(map, prefix)` e `parseJsonStrict` em `jar-reader.ts`.
- Ids de `source`/jar: `cobblemon`, `allthemons`, `ccc`, `legendarymonuments`, `mega_showdown`, `zamega`, `rctmod`, e `kubejs` para arquivos de `kubejs/`.
- Erros nomeados: `PipelineError(code, message, detail)` em `lib/errors.ts`; escrita atomica em `lib/fs-atomic.ts` (`writeJsonAtomic`, `writeFileAtomic`, `replaceDirAtomic`, `resetDir`); `lib/hash.ts` (`sha256Hex`, `sha8`); `lib/log.ts` (`DATASET_QUIET=1` silencia).
- `vitest`: arquivos em `tests/unit/dataset/*.test.ts` ja rodam em ambiente node.

Por agente:
- **Especies (B2.3, B2.4)**: preencher `tools/dataset/src/species/stage-derive.ts` (`runSpeciesDerive`, stub vazio). Contagens suas: `spawnEntries`, `fossilRoutes`. Pasta de saida `tools/dataset/out/_species/`. Teste `tests/unit/dataset/species.test.ts`, fixtures `tests/fixtures/species/`.
- **PokeAPI e midia (B3.1, B3.2, B3.4)**: stubs `tools/dataset/src/pokeapi/stage.ts` (`runPokeapiStage`) e `tools/dataset/src/media/stage.ts` (`runMediaStage`; retornar cedo com `ctx.flags.skipMedia`). Cache: `ctx.cacheDir("pokeapi")` (= `tools/dataset/.cache/pokeapi/`, ignorado). Contagens: `moves`, `abilities` (etapa `pokeapi`); `cries`, `itemTextures` (etapa `media`); midia via `ctx.media.register(...)` e arquivos em `ctx.assetPath("cries"| "sfx" | "items" | ...)`. Saida `tools/dataset/out/_pokeapi-media/`.
- **Treinadores e bolas (B5.1, B5.2, B4.3)**: stubs `tools/dataset/src/trainers/stage.ts` (`runTrainersStage`) e `tools/dataset/src/balls/stage.ts` (`runBallsStage`). `ctx.levelCapConfig` e seu (B5.2). Contagens: `trainers`, `keyTrainers`, `series` (etapa `trainers`), `balls` (etapa `balls`). `@iarna/toml` ja instalado. `HEAVY_BALL_BANDS`/`heavyBallMultiplier` prontos em `src/domain/ball-rules-types.ts`. Saida `tools/dataset/out/_trainers-balls/`.
- **Regras e armazenamento (B6, B7)**: contratos prontos em `src/data/types.ts` (todos os tipos de §5.1.3/5.1.5/5.1.6, mais aliases de arquivo `SpeciesIndexFile`, `MovesFile`, `ItemsFile`, `BallsFile`, `SeriesFile`, `FossilsFile`, `CurrentDatasetPointer`, `LocalizedText`, `BaseStats` etc.), `src/storage/types.ts` (`DocKey`, `DocMap`, docs, `StorageAdapter`, `BackupFile`, `SafetySnapshot`, `StorageError`/`StorageErrorCode`), `src/styles/themes.ts` (`THEME_IDS`, `ThemeId`), `src/domain/normalize.ts` (`normalizeSearch`). `fake-indexeddb/auto` ja carregado no `tests/setup.ts`; ambiente jsdom padrao.
- **Frontend fundacao (Onda 1b)**: `npm run test:harness` (config `playwright.harness.config.ts`, `testDir: tests/harness`, dev server Vite 5173). `src/components/Icon.tsx` reexporta os icones lucide do prototipo; `src/styles/fonts.ts` importa as fontes; `src/styles/types.generated.css` (`.t-<tipo>`, `.g-<tipo>`, vars `--t-*`, `--type-*-a/b`); assets em `src/assets/` (`pokeball.webp`, `pokeball-mask.png`, `types/<18>.svg`).

## NAO tocar (congelados nas Ondas 1 e 1b; mudanca volta ao orquestrador)

`src/data/types.ts`, `src/storage/types.ts`, `src/styles/themes.ts`, `src/domain/ball-rules-types.ts`, `src/domain/normalize.ts`, `tools/dataset/src/context.ts`, `tools/dataset/src/index.ts`, `tools/dataset/src/cli.ts`, `tools/dataset/src/write.ts` (`publish`, so B2.5 chama), `package.json` e `package-lock.json` (todas as dependencias ja instaladas), `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `playwright.harness.config.ts`, `eslint.config.js`. Tambem sao da Onda 0 (nao editar sem pedir): `tools/dataset/src/{config,instance,source-reader,jar-reader,lang,report}.ts`, `tools/dataset/src/lib/`, `tools/dataset/src/species/{collect,merge}.ts`, `tests/unit/build/`, `tests/unit/dataset/{source,species-merge}.test.ts`, `tests/fixtures/{source,species-merge}/`.

## Pendencias / escalar

- B1.2: o "Done when" pede um deploy de preview na Vercel servindo `/data/<ver>/dataset-manifest.json` com header immutable. Isso depende de push (nao autorizado nesta onda) e do dataset publicado (Onda 2). `vercel.json` esta pronto e validado localmente.
- `environmentMatchGlobs` gera aviso de deprecacao no Vitest 3 (sem impacto). Trocar por `test.projects` exigiria editar `vitest.config.ts` (congelado); nao e necessario agora.
