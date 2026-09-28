# tools/dataset

Pipeline de build do dataset do Pontindex (Node 24 + tsx). Le os dados do All the Mons e escreve JSON + midia em uma pasta de staging; so a etapa final (B2.5) publica em `public/`.

## Uso

```bash
npm run dataset                                  # pipeline completo (publica em public/data/<datasetVersion>/)
npm run dataset -- --only speciesCore --out tools/dataset/out/_base --skip-media --report
```

| Flag | Efeito |
|---|---|
| `--instance <dir>` | fonte de dados (precedencia: flag > env `ATM_INSTANCE_DIR` > `data-source/atm-1.3.0`) |
| `--skip-media` | so JSON (media e sprites retornam cedo) |
| `--offline` | PokeAPI so pelo cache em disco |
| `--report` | imprime a tabela de contagens/tamanhos (sempre grava `<out>/report.json`) |
| `--keep-old` | nao remove versoes antigas de `public/data/` ao publicar |
| `--only <etapa>` | roda `speciesCore` + so a etapa pedida; NUNCA publica |
| `--out <dir>` | staging (padrao `tools/dataset/out/_staging`); precisa ficar dentro de `tools/dataset/out/` e e apagado a cada execucao |

Etapas, na ordem (`src/index.ts`): `speciesCore` (`species/merge.ts`) -> `speciesDerive` (`species/stage-derive.ts`) -> `pokeapi` (`pokeapi/stage.ts`) -> `media` (`media/stage.ts`) -> `balls` (`balls/stage.ts`) -> `trainers` (`trainers/stage.ts`) -> `items` (`items/stage.ts`) -> `write` (`species/index-writer.ts`).

## Fonte

O modo e decidido SO por `fs.statSync(<fonte>/mods/<jar>)` dos 7 jars obrigatorios (`Cobblemon-neoforge-`, `allthemons-`, `complete-cobblemon-collection-`, `legendarymonuments-`, `mega_showdown-`, `zamega-`, `rctmod-neoforge-`): todos diretorios = snapshot (`DirSourceReader`), todos arquivos = instancia real zipada (`ZipSourceReader`), mistura = `E_SOURCE_MODE_UNKNOWN`. Todo acesso a fonte passa por `SourceReader` (`src/source-reader.ts`).

## Saida

- Staging: JSON em `<out>/data/`, midia em `<out>/assets/{cries,sfx,items,sprites}/`, `report.json` e `merge-report.json` na raiz de `<out>`.
- Cache busting (U3): `items.json` grava `texture` como `assets/items/<ns>/<caminho>.png?v=<8 hex do sha256 dos bytes publicados>`; o arquivo em disco nao muda de nome, a query muda quando os bytes mudam (`src/media/asset-version.ts`).
- Cache: `tools/dataset/.cache/<etapa>/` (`ctx.cacheDir("pokeapi" | "sprites")`), ignorado pelo git.
- Contrato: `src/context.ts` (`PipelineContext`, `COUNT_OWNERS`: cada etapa grava so as proprias contagens com `ctx.setCount`).

## Erros

Todos nomeados e com codigo de saida 1: `E_NODE_VERSION`, `E_CLI_ARGS`, `E_INSTANCE_NOT_FOUND`, `E_SOURCE_MODE_UNKNOWN`, `E_JAR_MISSING`, `E_JAR_DUPLICATE`, `E_JAR_UNREADABLE`, `E_SNAPSHOT_INCOMPLETE`, `E_JSON_INVALID`, `E_SPECIES_INVALID`, `E_OUT_DIR_UNSAFE`, `E_PUBLISH_FORBIDDEN`, `E_WRITE_FAILED`.
