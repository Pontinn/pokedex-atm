# CHECKLIST MANUAL - spawn-bait

Legenda: `[ ]` pendente · `[x]` feito · `[A]` coberto por teste automatizado · `[!]` bug

## Backend

Dataset publicado: `public/data/atm1.3.0-cobblemon1.7.3-20260929-2ef2f512` (commit `ff9ebce9`). Anterior: `atm1.3.0-cobblemon1.7.3-20260929-1a7afcba` (removido).

### Regressao das areas tocadas

- [x] Dataset regenerado a partir do snapshot (`npm run dataset -- --offline`); `public/data/current.json` aponta para `...-2ef2f512` e a pasta existe.
- [A] Segunda execucao no mesmo snapshot gera a mesma `datasetVersion`, o mesmo `items.json` e os mesmos 1027 `species/*.json` (feito em B2.3 com `--publish-dir tools/dataset/out/_sb_again`).
- [A] `items.json` e `species/*.json` passam nos schemas zod estritos do app (`published-schemas.test.ts`), sem campo descartado.
- [A] `items.json`: 951 itens; os 8 ids novos com textura e tag `bait`; 9 itens com categoria `bait` (os 8 + `cobblemon:poke_bait`); bagas continuam `berry`, `minecraft:apple`/`sweet_berries` continuam `other` com tag `bait`; `allthemons:mythical_pecha_berry` ausente.
- [A] `ItemInfo.bait`: efeitos com `kind` camelCase, `subcategory` sem namespace, texto do tooltip do jogo PT/EN; `minecraft:enchanted_golden_apple` com os valores do kubejs (biteTime 0.1, rarityBucket 10, shinyReroll 5, texto "6×"); `cobblemon:poke_bait.bait = { effects: [], seasoning: false }`; item sem arquivo de efeito = `bait: null`.
- [A] `craftable.potRecipes` so em `cobblemon:poke_snack` (leite 3, mel 2, Brotovital 1, Grãos Saudáveis 3) e `cobblemon:poke_bait` (mel 1, `c:mushrooms` 1, Trigo 1).
- [A] `SpawnEntry.fishing` presente em todo spawn (null sem condicao de pesca); Staryu-10, Wooper-16/17, Goomy-13 e Whiscash iguais a SPEC 5.3; nenhum `minLureLevel`/`maxLureLevel`/`rodType`/`bait` sobrando em `extra.condition`.
- [A] Auditoria independente (`npx tsx tools/dataset/audit/run.ts`): 46558 checks, 0 divergencias (Rodada 5 no `AUDIT_REPORT.md`).
- [x] Byte a byte instancia real x snapshot: `items.json` e os 1027 `species/*.json` iguais; sha256 do `items.json` (publicado = snapshot = instancia) `6bca7e9d942632f828cd825f5139997c070a5732d0d4510efe768bb578118a95`. Refazer: os 2 comandos de B2.1 da SPEC + `cmp`. A `datasetVersion` dos dois difere por desenho (o manifest guarda tamanho/mtime das fontes e contagem de gritos).
- [A] Texturas publicadas: `public/assets/items/minecraft/{golden_apple,enchanted_golden_apple,golden_carrot,glistering_melon_slice,glow_berries}.png` e `public/assets/items/allthemodium/allthemodium_{apple,carrot}.png`; `?v=<sha8>` confere com os bytes.
- [x] 7 PNGs novos conferidos visualmente (maca dourada, maca dourada encantada sem brilho, cenoura dourada, fatia de melancia reluzente, bagas brilhantes, maca e cenoura de allthemodium).
- [A] Metas RNF-01/02: `items.json` 1.499.586 bytes (<= 1.659.908); species 5.246.713 bytes (<= 5.693.585); 931 texturas distintas (<= 931, < 1200).
- [x] Snapshot: 13 arquivos de textura (B1.5) + 41 fontes (B2.1) copiados com bytes identicos e registrados em `data-source/atm-1.3.0/MANIFEST.json` (`additions`) e `data-source/README.md`.
- [x] `git grep -n "USERPROFILE\|Usuario" -- data-source tools src` sem resultado (RNF-09).

### Testes automatizados do backend

| Arquivo | O que cobre |
|---|---|
| `tests/unit/dataset/spawn-bait.test.ts` | `fishing.ts` (so-Lure, `fishingOf` com os exemplos da SPEC 5.3, `collectPokeRods`, `extra` sem o que foi tipado); `bait.ts` (tooltip do jogo: typing, eggGroup, biteTime, shinyReroll, nature, genderChance, haChance, template ausente, PT caindo para EN; `normalizeBaitEffects`; `collectBaitEffects` com kubejs vencendo; `buildSeasoningSet`; `loadSeasoningExtra`); `pot-recipes.ts` (shaped, shapeless, formatos desconhecidos); `buildCatalog` com `baitItemIds`; `publishModItemTextures` |
| `tests/unit/dataset/recipes.test.ts` | `gatherRecipes` + `reportRecipes` = mesmo report de `collectRecipes`; `potRecipes` so Poke-Lanche e Pokeisca |
| `tests/unit/dataset/audit.test.ts` | esperado da auditoria: 80 itens de isca, tempero do allthemodium pelo script do kubejs, 2 receitas da panela, pesca do Staryu-10 e Wooper-16 |
| `tests/unit/dataset/join.test.ts` | pipeline completo no snapshot: 951 itens, 9 com categoria `bait`, efeitos, `potRecipes`, `fishing`, bytes e texturas (RNF-01/02), versao nova |
| `tests/unit/data/published-schemas.test.ts` | dataset publicado passa nos schemas estritos; campo extra em `potRecipes`/`fishing` rejeitado |

Como rodar:

- `npx vitest run tests/unit/dataset tests/unit/data` (backend inteiro)
- `npx vitest run --coverage` (limites do `vitest.config.ts`; `tools/dataset/src/**` ficou em 93,77% linhas / 84,56% branches)
- `npx tsx tools/dataset/audit/run.ts` (auditoria no dataset publicado; reescreve `AUDIT_REPORT.md`, restaurar com `git checkout` e manter so a nota da rodada)
