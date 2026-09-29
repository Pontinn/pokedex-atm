# HANDOFF backend - spawn-bait

Para o agente de frontend. Tudo abaixo foi conferido no dataset publicado (nao so na SPEC).

## Estado

- Dataset publicado: `public/data/atm1.3.0-cobblemon1.7.3-20260929-2ef2f512/` (`current.json` aponta para ele; a pasta `...-1a7afcba` foi removida).
- Commits do backend (branch `feature/spawn-bait`): B1.1 `fd0291ab`, B1.2 `400300dd`, B1.3 `0b5f0f6b`, B1.4 `414db5a3`, B1.5 `66b0c4c2`, B2.1 `cfcfeb4f`, B2.2 `f944fd87`, B2.3 `ff9ebce9`, T1.2 `bffdb9c5`, T1.3 `2f1ab0d3`.
- Janela quebrada B1.1 -> B2.3: FECHADA. `tests/unit/data/published-schemas.test.ts` e `tests/unit/dataset/join.test.ts` voltaram a rodar (e passam). O app e o e2e podem abrir de novo. `npx vitest run` inteiro: 81 arquivos / 648 testes verdes (com os testes novos do backend).
- Contrato em `src/data/types.ts` e `src/data/schemas.ts` (congelado; nao mudar sem voltar ao backend).

## Contrato real

### `SpawnEntry.fishing` (species/<dex>.json, em `spawns[]` e nos mesmos objetos de `obtain`)

Sempre presente, imediatamente antes de `extra`. `null` quando o spawn nao tem condicao de pesca.

```ts
fishing: {
  bait: string | null;          // condition.bait, ex. "cobblemon:love_sweet" (isca exigida; e um item do catalogo)
  rodType: string | null;       // condition.rodType, ex. "cobblemon:love_rod" (a vara NAO e item do catalogo)
  rodBall: string | null;       // pokeBallId da vara, ex. "cobblemon:love_ball" (item do catalogo, usar no ItemLink)
  minLureLevel: number | null;
  maxLureLevel: number | null;
  lureMultipliers: { lureMin: number | null; lureMax: number | null; multiplier: number }[]; // so os de condicao so-Lure
} | null
```

- `extra` NAO tem mais `condition.bait/rodType/minLureLevel/maxLureLevel` nem os multiplicadores so-Lure (a chave `condition` some quando so tinha isso). Os outros multiplicadores (timeRange etc.) continuam em `extra.weightMultiplier`/`extra.weightMultipliers`.
- Numeros no snapshot (3194 spawns unicos): 143 com `minLureLevel`, 3 com `maxLureLevel` (Goomy-13 e cia., `minLureLevel 2, maxLureLevel 2`), 3 com `bait`, 6 com `rodType`, 357 `lureMultipliers` no total.
- Exemplos reais: `species/120.json` `allthemons:staryu-10` -> `{ bait: null, rodType: null, rodBall: null, minLureLevel: 1, maxLureLevel: null, lureMultipliers: [{ lureMin: 3, lureMax: null, multiplier: 3 }] }`, `extra = { weight: 1.84, condition: { minY: -60, maxY: 13 } }`; `species/194.json` `cobblemon:wooper-true-16` -> `rodType "cobblemon:love_rod"`, `rodBall "cobblemon:love_ball"`, `lureMultipliers [{2,2,x3},{3,null,x5}]`; `cobblemon:wooper-true-17` -> `bait "cobblemon:love_sweet"`; `species/340.json` whiscash-true-5/6/9 -> `rodType "cobblemon:master_rod"`, `rodBall "cobblemon:master_ball"`.

### `ItemInfo.bait` (items.json, depois de `cooking`)

```ts
bait: {
  effects: {
    kind: "typing" | "eggGroup" | "nature" | "ev" | "iv" | "biteTime" | "levelRaise" | "pokemonChance"
        | "genderChance" | "haChance" | "friendship" | "dropsReroll" | "shinyReroll" | "rarityBucket";
    subcategory: string | null;  // sem namespace: "fire", "water_1", "human_like", "atk", "male"
    chance: number;              // 0..1
    value: number | null;        // cru do arquivo (shinyReroll 5 continua 5; o texto diz "6×")
    text: { pt: string; en: string }; // tooltip do jogo ja renderizado (PT com acento; PT cai para EN)
  }[];                           // ordem do arquivo vencedor (kubejs > jar)
  seasoning: boolean;            // aceito como tempero pela Panela de Fogueira
} | null
```

- 80 itens com `bait != null` no dataset: 70 bagas (`category: "berry"`), `minecraft:apple` e `minecraft:sweet_berries` (`category: "other"`, tag `bait`), os 5 vanilla novos, os 2 allthemodium e `cobblemon:poke_bait` (`{ effects: [], seasoning: false }`). `cobblemon:poke_snack.bait` = `null` (nao tem arquivo de efeito). Qualquer outro item = `null`.
- 79 com `seasoning: true` (as 70 bagas + apple + sweet_berries + 5 vanilla + 2 allthemodium). E essa a lista de candidatas da recomendacao (RF-08/16/55).
- Efeitos `typing`: 18 bagas (1 tipo cada); `eggGroup`: 7 bagas (Lum = `dragon` + `monster`, na ordem do arquivo).
- Reforcos (efeito `rarityBucket` ou `shinyReroll`), ordenados por id = exatamente os 7 do F1.2: `allthemodium:allthemodium_apple`, `allthemodium:allthemodium_carrot`, `cobblemon:starf_berry`, `minecraft:enchanted_golden_apple`, `minecraft:glistering_melon_slice`, `minecraft:golden_apple`, `minecraft:golden_carrot`.
- Textos reais: Occa `{ pt: "100% de probabilidade de aumentar em 10× a chance de fisgar Pokémon do Tipo Fogo", en: "100% - 10× Chance for Fire Types" }`; maca dourada encantada shinyReroll en "100% - 6× Shiny Chance", pt "100% de probabilidade de aumentar em 6× a chance de fisgar um Brilhante". O `×` e o caractere do jogo (U+00D7). O texto do jogo PT tem numero; o bloco "Iscas" nao deve mostrar esses textos (so a pagina do item).

### `craftable.potRecipes` (so 2 itens)

```ts
{ kind: "craftable"; recipeTypes: string[]; potRecipes?: {
  recipeId: string; recipeType: string; seasoningTag: string;
  ingredients: ({ kind: "item"; id: string; count: number; name: { pt: string; en: string } | null }
              | { kind: "tag"; id: string; count: number })[];
}[] }
```

- `cobblemon:poke_snack`: `recipeTypes ["cobblemon:cooking_pot"]`, 1 receita `cobblemon:campfire_pot/poke_snack`, ingredientes na ordem: tag `c:drinks/milk` x3, `minecraft:honey_bottle` x2 ("Frasco de Mel"/"Honey Bottle"), `cobblemon:vivichoke` x1 ("Brotovital"/"Vivichoke"), `cobblemon:hearty_grains` x3 ("Grãos Saudáveis"/"Hearty Grains").
- `cobblemon:poke_bait`: `recipeTypes ["cobblemon:cooking_pot_shapeless"]`, `cobblemon:campfire_pot/poke_bait`: `minecraft:honey_bottle` x1, tag `c:mushrooms` x1, `minecraft:wheat` x1 ("Trigo"/"Wheat"; `minecraft:wheat` NAO esta no catalogo: nao e link).
- Todos os outros itens craftaveis: sem a chave `potRecipes` (bytes iguais aos de antes).

## Catalogo: itens com categoria `bait` (9)

| id | nome PT / EN | categoria | tags | bait | rotas |
|---|---|---|---|---|---|
| `allthemodium:allthemodium_apple` | Maçã de Allthemodium / Allthemodium Apple | bait | bait | biteTime 0.1, rarityBucket 12, shinyReroll 10; seasoning true | craftable |
| `allthemodium:allthemodium_carrot` | Cenoura de Allthemodium / Allthemodium Carrot | bait | bait | biteTime 0.1, shinyReroll 10; seasoning true | craftable |
| `cobblemon:poke_bait` | Pokéisca / Poké Bait | bait (era other) | bait | effects []; seasoning false | craftable (+ potRecipes) |
| `cobblemon:poke_snack` | Poké-Lanche / Poké Snack | bait | bait | null | craftable (+ potRecipes) |
| `minecraft:enchanted_golden_apple` | Maçã Dourada Encantada / Enchanted Golden Apple | bait | bait | biteTime 0.1, rarityBucket 10, shinyReroll 5; seasoning true | craftable, structureLoot, blockDrop, questReward, structurePlaced, trade |
| `minecraft:glistering_melon_slice` | Fatia de Melancia Reluzente / Glistering Melon Slice | bait | bait | rarityBucket 1; seasoning true | craftable, structureLoot |
| `minecraft:glow_berries` | Bagas Brilhantes / Glow Berries | bait | bait | biteTime 0.25; seasoning true | craftable, structureLoot, blockDrop |
| `minecraft:golden_apple` | Maçã Dourada / Golden Apple | bait | bait | biteTime 0.25, rarityBucket 1, shinyReroll 1; seasoning true | craftable, structureLoot, blockDrop, questReward, structurePlaced |
| `minecraft:golden_carrot` | Cenoura Dourada / Golden Carrot | bait | bait | rarityBucket 1; seasoning true | craftable, structureLoot, structurePlaced |

- Os 8 novos (todos menos `poke_bait`) entraram no catalogo (951 itens, antes 943) e tem textura: `assets/items/minecraft/<id>.png`, `assets/items/allthemodium/allthemodium_{apple,carrot}.png`, `assets/items/cobblemon/food/poke_snack.png` (sempre com `?v=<sha8>`). A maca dourada encantada usa o PNG da maca dourada (sem o brilho, que o jogo desenha em tempo real).
- `cooking` = `null` em todos os 9 (o `poke_snack` nao tem mais `effectNote`).
- Aba "Iscas": pela tag `bait` entram tambem as 70 bagas, `minecraft:apple` e `minecraft:sweet_berries` (categoria propria mantida).

## Desvios da SPEC (todos registrados no checklist)

1. B2.1: as `datasetVersion` da instancia real e do snapshot NAO podem ser iguais: o hash inclui o `dataset-manifest.json`, que guarda `sources` (tamanho/mtime dos jars) e `counts.cries`/`media` (o snapshot tem so parte dos gritos). Isso vem do U11 e nao muda com esta feature. O que o RF-44 pede foi cumprido: `items.json` (sha256 `6bca7e9d942632f828cd825f5139997c070a5732d0d4510efe768bb578118a95`) e os 1027 `species/*.json` iguais byte a byte; o publicado e identico aos dois.
2. `collectBaitEffects`/auditoria: 80 itens, nao 81 (81 sao arquivos: 78 do jar + 3 do kubejs, `enchanted_golden_apple` nos dois). "72 bagas" da SPEC = 70 bagas `berry` + apple + sweet_berries.
3. `renderBaitTooltip` e `normalizeBaitEffects` ganharam parametros opcionais (`report`, `itemId`) para os avisos; `baitTypePath(kind)` exportado (kind -> path do tipo do jogo).
4. Auditoria: a conferencia do arquivo de textura passou a olhar tambem a raiz do `--publish-dir` (antes so `public/`), para auditar um dataset de teste.
5. B1.1 tocou fixtures de `tests/unit/ui-screens/*`, `tests/e2e/item-obtain-v2.spec.ts` e `tests/unit/domain/ball-ranking.test.ts` (so `bait: null`/`fishing: null`, lista da propria SPEC B1.1).
6. T1.2/T1.3 foram escritos agora (logo depois de B2.3), nao na Sprint T1 final: sao so de pipeline/contrato. T1.6 (regressao completa) fica para o fim, com o frontend; os passos de backend dele (auditoria 0, byte a byte, determinismo, `git grep` sem caminho de usuario) ja rodaram verdes em B2.3.

## O que o frontend precisa saber

- `ItemLink` para `rodBall` e `bait` do spawn: os dois sao ids do catalogo (`cobblemon:love_ball`, `cobblemon:master_ball`, `cobblemon:love_sweet`). `rodType` nao e item.
- Recomendacao: candidatas = `items[id].bait?.seasoning === true`; `typing` usa `subcategory` = id do tipo (`fire`, `water`...), `eggGroup` usa o id do grupo (`water_1`, `human_like`, `dragon`...), iguais aos de `SpeciesDetail.types`/`eggGroups`.
- Rotulo de ingrediente por tag: `c:drinks/milk` e `c:mushrooms` (sem nome do jogo; usar `ip.ingredientTag.*`). Ingrediente `item` com `name === null` seria possivel (nao ha hoje).
- O dataset novo ja esta em `public/`; nada a regenerar no frontend. Nao publicar de novo sem o backend.
