# HANDOFF backend (pwa-auto-update U3 + U5a)

Commits: `99d6035a` (U3), `26906d9d` (README U3), `142e2ef7` (U5a). Nada publicado em `public/` (U6 faz isso).

## U3: formato da URL das texturas

`items.json[id].texture` = `assets/items/<ns>/<caminho>.png?v=<8 hex>`, onde `<8 hex>` = 8 primeiros hex do sha256 dos bytes do arquivo publicado. O arquivo em disco continua `public/assets/items/<ns>/<caminho>.png` (sem query no nome). Mesmos bytes = mesma query.

Exemplo: `assets/items/allthemons/badges/the_kitty_badge.png?v=baded6c2`.

Frontend (so leitura, nada precisa mudar):
- `src/components/ItemTile.tsx` `itemTextureUrl`: `startsWith("assets/")` -> `"/" + texture` (concatenacao, query preservada).
- `src/screens/Detail/EvolutionPanel.tsx` `itemTexture`: so troca o prefixo `^/?assets/items/` por "" e devolve o resto (query preservada; depois `itemTextureUrl` recoloca `/assets/items/`).
- `src/screens/Items/ItemsScreen.tsx:46` so testa se ha textura.
- Nenhum codigo deriva algo da extensao ou faz `new URL(...)`/split no caminho.
- SW (`vite.config.ts`): `urlPattern: /\/assets\/items\//` casa com query; CacheFirst usa a URL completa como chave, entao a URL nova busca de novo.
- Outros assets NAO estao no JSON como caminho: `cry` e o slug (`/assets/cries/<slug>.ogg`, `src/audio/cries.ts`), sprites `/assets/sprites/<dex>.png` (`src/screens/Home/SpeciesSprite.tsx`), sfx por nome fixo (`src/audio/sfx.ts`). Continuam sem versao; hoje vem de fontes estaveis (jar do Cobblemon, PokeAPI). Se um dia precisarem, o dataset teria que gravar o caminho (mudanca de contrato) ou o app teria que receber um mapa de hashes.

## U5a: nova rota `trainerDrop`

Forma (tipo local do pipeline em `tools/dataset/src/items/trainer-drops.ts`):

```ts
| {
    kind: "trainerDrop";
    trainers: {
      id: string;                                  // id do treinador = TrainerInfo.id (link para a pagina do treinador)
      name: string | null;                         // TrainerInfo.name; null se o treinador nao esta em trainers/*.json
      series: string | null;                       // SeriesInfo.id cujo trainersFile tem o treinador; null se nao esta
      chance: number | null;                       // 0..1 por vitoria; 1 = garantido; null = nao calculavel das tabelas
      levelRange: { min: number; max: number } | null; // condicao rctmod:level_range da pool, como no arquivo
      firstDefeatOnly: boolean;                    // condicao rctmod:defeat_count == 1 (so a 1a vitoria)
    }[];                                           // ordenado por id, sempre >= 1
  }
```

Ordem no `obtain`: depois de `fossilRevive`, antes de `none` (item so com `trainerDrop` NAO tem mais `none`).

Exemplo real (`_publish_test`):

```json
"allthemons:the_kitty_badge": {
  "obtain": [
    { "kind": "trainerDrop", "trainers": [
      { "id": "team_allthemods_satherov", "name": "Satherov", "series": "atm_team", "chance": 1,
        "levelRange": { "min": 90, "max": 100 }, "firstDefeatOnly": false }
    ] }
  ]
}
"cobblemon:master_ball": { "obtain": [ { "kind": "craftable", "recipeTypes": [...] },
  { "kind": "trainerDrop", "trainers": [ { "id": "boss_giovanni_0045", "name": "Boss Giovanni", "series": "radicalred",
    "chance": 1, "levelRange": { "min": 1, "max": 100 }, "firstDefeatOnly": true } ] } ] }
```

14 itens: 12 `allthemons:the_*_badge` (ATM Team), `allthemons:ancient_dna_sample` (Notch, tambem `fossilRevive`), `cobblemon:master_ball` (Giovanni). Todos com `name` e `series` preenchidos (os treinadores existem no site).

`levelRange`: e o valor cru da condicao `rctmod:level_range`; este agente nao confirmou a semantica (nivel do treinador ou do jogador). Satherov tem `maxTeamLevel` 90, dentro de 90..100. Sugestao para a UI: nao mostrar `levelRange` ate confirmar, ou mostrar como "condicao de nivel 90-100" sem interpretar.

### O que o frontend (U5b) precisa mudar

OBRIGATORIO antes do U6: sem isso o app rejeita `items.json` inteiro (`src/data/loaders.ts` faz `safeParse` e lanca `DatasetError("INVALID")`), ou seja, a tela de itens quebra.

1. `src/data/types.ts`, `ItemObtainRoute`: acrescentar
   `| { kind: "trainerDrop"; trainers: { id: string; name: string | null; series: string | null; chance: number | null; levelRange: { min: number; max: number } | null; firstDefeatOnly: boolean }[] }`
2. `src/data/schemas.ts`, `itemInfoSchema.obtain` (union): acrescentar
   `z.object({ kind: z.literal("trainerDrop"), trainers: z.array(z.object({ id: z.string(), name: z.string().nullable(), series: z.string().nullable(), chance: z.number().nullable(), levelRange: z.object({ min: z.number(), max: z.number() }).nullable(), firstDefeatOnly: z.boolean() })) })`
3. `src/screens/Item/item-page-model.ts` e a tela de "Como obter" do item: renderizar a fonte "Drop de treinador" no mesmo visual das outras (chip por treinador com `name ?? id`, link para o treinador via `series` + `id` quando `series != null`; `chance` 1 = "garantido", senao `%`; `firstDefeatOnly` = "so na primeira vitoria"). Conferir qualquer `switch` exaustivo em `kind` (o typecheck aponta).
4. i18n (`src/i18n/messages/item.ts`): textos PT/EN da fonte, ex. "Drop de treinador" / "Trainer drop", "garantido" / "guaranteed", "so na primeira vitoria" / "first win only".
5. Depois do U5b, no pipeline: `tools/dataset/src/items/stage.ts` pode voltar a usar `ItemInfo`/`ItemObtainRoute` (apagar `PipelineItemInfo`/`PipelineItemObtainRoute`) e `tests/unit/dataset/join.test.ts` pode tirar o filtro que retira `trainerDrop` antes do `itemsFileSchema` (comentario U5a no teste).

## Reuso para U7b (loot de todos os namespaces)

`collectRctLootTables(ctx)` (jar rctmod + kubejs, chave `rctmod:<caminho>`) e `poolChance(rolls, q)` estao exportados em `trainer-drops.ts`; a leitura de pools/entries/conditions (`itemsOfTable`) e generica. O loot de `rctmod:trainers/groups/**` (sweet_apple, tart_apple, ancient_origin_ball etc. via `rctmod:generic/**`) foi deixado de fora de proposito: e sorteado para o grupo inteiro, nao e drop de um treinador.

## Ambiente (vai afetar o U6)

A publicacao falha com `E_WRITE_FAILED` (EPERM no rename de `data/species`) enquanto algum processo observa a pasta do repo. Repro: criar pasta em `tools/dataset/out`, esperar 3 s, renomear = EPERM; o mesmo em `Projetos/` ou no scratchpad = ok. Processo suspeito: dev server Vite na porta 4191 (pid 33680 no momento). Este agente nao o parou (nao e dele). Rodadas de teste usaram um preload do scratchpad (`--require copyrename.cjs`) que troca o rename de pasta por copia + remocao.

## Frontend contract (U5b feito em `9e5cf387`; vale para U7d)

O app (`src/data/types.ts` `ItemObtainRoute`, `src/data/schemas.ts` `itemInfoSchema.obtain`) aceita agora, alem das rotas antigas:

```ts
| { kind: "trainerDrop"; trainers: { id: string; name: string | null; series: string | null; chance: number | null;
    levelRange: { min: number; max: number } | null; firstDefeatOnly: boolean }[] }   // exatamente o formato do U5a
| { kind: "unobtainable"; reason?: "creativeOnly" | "notRegistered" }                // U7d emite este
| { kind: "none" }                                                                   // ainda aceito (compatibilidade)
```

`unobtainable` (U7d):
- Forma exata: `{ "kind": "unobtainable" }` ou `{ "kind": "unobtainable", "reason": "creativeOnly" }` ou `{ "kind": "unobtainable", "reason": "notRegistered" }`. Qualquer outro `reason` (ou campo extra com outro tipo) faz o zod rejeitar o `items.json` inteiro.
- `creativeOnly`: o item existe no jogo mas so sai do modo criativo/op (ex. `cobblemon:npc_editor`, as 12 placas e 7 memorias do mega_showdown). UI: "Nao obtivel no All the Mons (so no modo criativo)" / "Not obtainable in All the Mons (creative mode only)".
- `notRegistered`: o id nao esta registrado no jogo (ex. `cobblemon:bugwort`, `cobblemon:shalour_sable`). UI: "Nao obtivel no All the Mons (nao existe no jogo)" / "Not obtainable in All the Mons (not in the game)".
- Sem `reason`: "Nao obtivel no All the Mons" / "Not obtainable in All the Mons".
- Deve ser a unica rota do item (a UI mostra as rotas na ordem do array; `unobtainable` junto de outra rota seria contraditorio).
- Todos com a dica "Nenhuma receita, drop, loot ou recompensa do pack entrega este item." e o visual tracejado (`.ob-none`).

`trainerDrop` na UI:
- Linha "Drop de treinador" / "Trainer drop", texto "Cai ao vencer:", um chip por treinador na ordem do array: nome (`name ?? id`) + chance (`chance` 0..1 -> "100%", "12.5%"; `null` -> sem numero), pilula com o titulo da serie (`series.json` `title`, fallback id humanizado) e pilula "so na 1a vitoria" / "first win only" quando `firstDefeatOnly`.
- Chip com `series != null` e um botao: abre Treinadores com `ui.seriesId = series` e `ui.openTrainerId = id` (a tela mostra essa serie sem trocar a serie ativa do usuario, com aviso e botao "Voltar para a serie ativa", acordeao do treinador aberto e scroll ate ele). `series == null` -> chip sem link. O link so abre o treinador se `id` estiver em `keyTrainerIds` da serie e nao for `optional` (a linha do tempo so lista treinadores-chave); hoje Satherov e Boss Giovanni sao.
- `levelRange` NAO e exibido: a semantica (nivel do treinador ou do jogador) nao foi confirmada. Se o pipeline confirmar, avisar para a UI rotular.

Depois deste commit o pipeline pode fazer o item 5 do U5a: `tools/dataset/src/items/stage.ts` volta a usar `ItemInfo`/`ItemObtainRoute` (apagar `PipelineItemInfo`/`PipelineItemObtainRoute`) e `tests/unit/dataset/join.test.ts` tira o filtro que retira `trainerDrop` antes do `itemsFileSchema`. Este agente nao mexeu em `tools/dataset/**` nem em `tests/unit/dataset/**`.

## U7a: receitas de todos os namespaces (`4ebd8568`, data-source `3124643d`)

Schema: NENHUMA mudanca. A rota continua `{ kind: "craftable", recipeTypes: string[] }` (tipos ordenados, sem repeticao). O que muda e o conteudo:
- `recipeTypes` agora traz tipos de qualquer mod (89 tipos distintos no catalogo), ex. `create:sequenced_assembly`, `oritech:assembler`, `pneumaticcraft:pressure_chamber`, `mekanism:sawing`, `botanypots:crop`, `productivebees:advanced_beehive`, `theurgy:incubation`, `immersiveengineering:cloche`. `recipeLabels` (`src/screens/Item/item-page-model.ts`) ja cai no `humanizeId` para tipo sem rotulo; opcional (U7e): rotulos PT/EN para os mais comuns (Create, Oritech, Mekanism, PneumaticCraft, Botany Pots, Productive Bees, Cooking Pot).
- Sem ingredientes nem estacao alem do tipo (o schema nao tem campo para isso; se a UI quiser mostrar ingredientes, precisa de um campo novo, ex. `recipes: { type, id, inputs[] }[]`).
- 500 itens ganham `craftable`; 276 dos 360 sem rota. Nenhum perde a rota; 46 bolas perdem so `minecraft:crafting_shaped` (o ATM remove esse crafting no kubejs).

Exemplos (`_publish_test`):
- `mega_showdown:zygarde_cube`: `["minecraft:crafting_shaped", "oritech:assembler"]` (o assembler vem de `kubejs/server_scripts/mods/Oritech/recipes.js:99`)
- `mega_showdown:stellar_tera_shard`: `["productivebees:advanced_beehive"]` (abelha terabeegos do jar allthemons)
- `allthemons:allthemodium_apricorn_bits`: `["create:cutting", "mekanism:sawing", "oritech:atomic_forge", "pneumaticcraft:assembly_drill"]`
- `minecraft:clock`: `["create:sequenced_assembly", "minecraft:crafting_shaped", "productivemetalworks:item_casting"]`
- `cobblemon:poke_ball`: `["create:sequenced_assembly", "oritech:assembler", "pneumaticcraft:pressure_chamber"]` (antes `["minecraft:crafting_shaped"]`, removido pelo kubejs)

Report (`report.json`, secao `recipes`): `droppedForCatalog` (receitas de itens do catalogo descartadas por condicao), `removedByKubejs` (com `arquivo:linha` do filtro), `kubejsRemovalsUnparsed`, `kubejsAddedForCatalog`, `kubejsAdditionsUnparsed` (inclui `recipes.summoningrituals.altar`, que fica para o U7c).

Pendente para U7b/U7c/U7d: 72 itens ainda so com `none`.
