# CHECKLIST MANUAL - berry-mutations

Legenda: `[ ]` pendente · `[x]` feito · `[A]` coberto por teste automatizado · `[!]` bug

## Backend

Dataset publicado: `public/data/atm1.3.0-cobblemon1.7.3-20260930-1949ea67` (commit `89840201`). Anterior: `atm1.3.0-cobblemon1.7.3-20260929-2ef2f512` (removido).

Commits: B1.1 `e5ba8bb0`, B1.2 `ff17d2ce`, B2.1 `ea3aa9a1`, B2.2 `89840201`, T1.1 `6895614b`, T1.2 `98169952`.

### Testes automatizados do backend

| Arquivo | O que cobre |
|---|---|
| `tests/unit/dataset/berry-mutations.test.ts` | `buildBerryOrigins` com fixtures sinteticas (par simetrico, assimetrico, id desconhecido, parceiro sem arquivo, 3 variantes com e sem namespace, variante desconhecida, `specific_biome` sem `biome`, ordem por code unit, `mutations` nao-objeto); `collectBerryOrigins` no snapshot comparado ao recalculo direto dos 70 arquivos crus (resultados, spawn, pares, usos, 0 avisos `W_BERRY_*`); Cheri/Lum/Liechi da SPEC 5.3; `collectBerryPlantable` inalterado (Occa) |
| `tests/unit/dataset/audit.test.ts` (2 testes novos no fim) | `buildExpected().berries` (uma por arquivo cru, Liechi `specificBiome`, Oran `allBiome`); `compare` sobre copia adulterada do dataset publicado: par removido da Lum = WRONG DATA, `berry` num apricorn = EXTRA |
| `tests/unit/dataset/join.test.ts` (describe `berry-mutations: berry origin and crossbreeding`) | pipeline completo no snapshot: so as bagas com arquivo tem `berry`, todas `category: "berry"`; resto `null`; conjuntos de origem iguais aos arquivos crus; 3 variantes; `plantable` das 110 inalterada; versao nova. O teto de bytes continua no assert existente da linha 322 |
| `tests/unit/data/published-schemas.test.ts` (1 teste novo) | dataset publicado passa no schema estrito; campo extra em `berry`/`spawn[]`/`mutationPairs[]` e `variant` fora do enum rejeitados; `berry: null` passa; item sem a chave `berry` rejeitado |

Como rodar:

- `npx vitest run tests/unit/dataset tests/unit/data` (backend inteiro)
- `npx vitest run --coverage` (limites do `vitest.config.ts`; `tools/dataset/src/**` ficou em 93,87% linhas / 84,67% branches; `berries.ts` 100% / 90,41%)
- `npx tsx tools/dataset/audit/run.ts` (auditoria no dataset publicado; reescreve `AUDIT_REPORT.md`, restaurar com `git checkout` e manter so a nota da rodada)

### Regressao das areas tocadas

- [x] Dataset regenerado a partir do snapshot (`npm run dataset -- --offline`); `public/data/current.json` aponta para `...-1949ea67` e a pasta existe.
- [x] Segunda execucao no mesmo snapshot (`--publish-dir tools/dataset/out/_bm_again`) gera a mesma `datasetVersion` e o mesmo `items.json` (sha256 igual).
- [x] Nao-perda: os 951 itens do `items.json` novo, sem a chave `berry`, sao identicos (`JSON.stringify`) aos do dataset anterior; abilities, balls, biomes, fossils, moves, series e species-index byte a byte iguais.
- [A] `items.json` passa no schema zod estrito do app sem campo descartado (`published-schemas.test.ts`).
- [A] Rota `plantable` das 110 (70 bagas + 40 apricorns/mints) igual a de antes: bagas com `preferredBiomeTags`, apricorns e mints com `[]` (`join.test.ts`; conferido tambem por id contra o dataset anterior em B1.2).
- [A] `ItemInfo.berry`: 70 bagas nao nulas, 881 itens `null`; 31 com spawn (28 preferredBiome, 2 allBiome, 1 specificBiome), 40 resultados de par, 77 pares, 154 usos, todos iguais ao recalculo dos arquivos crus (`berry-mutations.test.ts`, `join.test.ts`).
- [A] Cheri, Lum e Liechi iguais a SPEC 5.3 (`berry-mutations.test.ts`; conferido tambem byte a byte no `items.json` publicado).
- [A] Auditoria independente (`npx tsx tools/dataset/audit/run.ts`): 46768 checks (46558 + 210 novos), 0 divergencias (Rodada 6 no `AUDIT_REPORT.md`).
- [x] Byte a byte instancia real x snapshot: `items.json` igual; sha256 (publicado = snapshot = instancia = repeticao) `464846fcfeded8de70dfc810d21500e198af3fc5c812ab161bcaece91cd4d558`. Refazer: os 2 comandos de B2.2 passo 1 da SPEC + `sha256sum`. A `datasetVersion` dos dois difere por desenho (o manifest guarda tamanho/mtime das fontes).
- [A] Tamanho: `items.json` 1.533.158 bytes (<= 1.659.908, assert existente `join.test.ts:322`); era 1.499.586.
- [x] Nenhum arquivo copiado para o snapshot (os 70 `berries/*.json` ja eram identicos ao jar real); `MANIFEST.json` e `data-source/README.md` sem mudanca.
- [x] `git grep -n "Usuario\|USERPROFILE" -- src tools/dataset/src` sem resultado; nenhum travessao nos arquivos tocados.
- [x] Pipeline: `report.json` sem aviso `W_BERRY_*`; secao `berries` = `{ items 70, withSpawn 31, spawnVariants 28/2/1, mutationResults 40, pairs 77, uses 154, bothOrigins [liechi] }`.
- [x] Nenhuma chamada de rede nova no pipeline (tudo `--offline`, cache da PokeAPI local).

### Casos de borda do pipeline

- [A] Variante de spawn desconhecida: pulada com `W_BERRY_SPAWN_UNKNOWN` (inclui chave de prototipo como `toString`).
- [A] `specific_biome` sem `biome`: pulada com `W_BERRY_SPAWN_BIOME_MISSING`.
- [A] Par assimetrico: entra do mesmo jeito com `W_BERRY_MUTATION_ASYMMETRIC`.
- [A] Resultado sem arquivo de baga: nao gravado, `W_BERRY_MUTATION_UNKNOWN_ID`.
- [A] `mutations` ausente, nao objeto ou com valor nao string: sem pares.
- [A] Ordem deterministica por code unit (nao por locale).

### Papeis e acesso

- N/A: sem endpoint, sem login, sem papel (SPEC 5c). O unico "papel" (visitante) le o mesmo dataset estatico.

## Frontend

(preenchido pelo agente de frontend)
