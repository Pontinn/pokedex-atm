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

## U7b: loot tables de todos os namespaces (`9eb3b1c5`, data-source `c4915b79`)

Schema: NENHUMA mudanca. So as rotas existentes `structureLoot` (`tables: string[]`) e `fishing` ganham conteudo:
- Fontes: `data/<ns>/loot_table/**` do jar vanilla 1.21.1, de todo jar de `mods/` e de `kubejs/data` (mesmo id: vanilla < jars < kubejs); tabela com `neoforge:conditions` que nao passam fica de fora (24).
- Itens de uma tabela: `minecraft:item`, `minecraft:tag` (tags de item de todas as fontes), `minecraft:loot_table` (referencia em qualquer namespace, recursiva com visitados, ou inline) e filhos de `alternatives`/`group`/`sequence`.
- `structureLoot.tables`: ids `<ns>:<caminho>` para os namespaces novos (ex. `legendarymonuments:chests/bell_tower_chest`); cobblemon continua sem namespace e com a regra antiga (tudo que nao e pesca, inclusive `blocks/`, `sets/`), para nao tirar rota que o site ja mostra. `lootTableLabel` do app ja tira o namespace: `legendarymonuments:chests/bell_tower_chest` -> "Chests (bell tower chest)".
- Estrutura = primeiro segmento `chests`, `archaeology`/`archeology`, `archaeological_site`, `wishing_weald`, `structures`, `ruins`/`ruin`, `village(s)`, `shipwreck_coves`, `spawners`, `pots`, `dispensers`, pastas do terralith, `*_dungeon`, `inject(ion)/chests`, ou qualquer caminho com o segmento `chests`. `fishing` = segmento `fishing` fora de `chests` (`cobblemonextrastructures:chests/fishing` e bau). `sets/`, `selectors/`, `rctmod:generic/` so por referencia.
- `_publish_test`: 949 ids iguais; `items.json` identico ao gerado da instancia real; 189 itens ganham rota de loot (182 `structureLoot`, 15 `fishing`); 14 dos 72 so com `none` cobertos; nenhuma tabela perdida; sem rota duplicada; `itemsFileSchema` aceita o arquivo inteiro.

Exemplos (`_publish_test`):
- `mega_showdown:red_orb`: `structureLoot ["legendarymonuments:chests/bell_tower_chest"]`
- `mega_showdown:sparkling_stone_dark`: `structureLoot ["mega_showdown:archaeological_site/archaeological_site_rare"]` (arqueologia)
- `cobblemon:sweet_apple`: `structureLoot ["mega_showdown:archaeology/observatory_sus"]`
- `minecraft:totem_of_undying`: `structureLoot` com 10 tabelas (`dungeons_arise:chests/...`, `legendarymonuments:chests/bell_tower_chest`)
- `mega_showdown:zygarde_core`: `structureLoot ["legendarymonuments:chests/regigigas_chest", "legendarymonuments:chests/registeel_chest"]`

Atencao UI (U7e): itens comuns agora tem MUITAS tabelas (`minecraft:diamond` 199, `iron_ingot` 194, `emerald` 166, `coal` 110). A UI mostra um chip por rotulo; talvez agrupar por namespace/pasta ou limitar com "e mais N".

## U7b needs (contrato proposto, NAO emitido)

O pipeline ja calcula estas categorias (report `loot.pendingContract`, item -> tabelas), mas o app nao tem rota para elas; emitir quebraria o zod do `items.json`. Proposta:

```ts
| { kind: "blockDrop"; tables: string[] }   // "<ns>:blocks/<bloco>", ex. "mega_showdown:blocks/mega_stone_crystal"; UI "Drop de bloco" / "Block drop", chip = bloco (caminho sem "blocks/")
| { kind: "mobDrop"; tables: string[] }     // "<ns>:entities/<mob>" (e "eternal_starlight:bosses/*", "*:inject(ion)/entities/*"); UI "Drop de criatura" / "Mob drop"
| { kind: "trainerGroupDrop"; groups: string[] } // "rctmod:trainers/groups/<grupo>"; UI "Loot aleatorio de treinadores (<grupo>)"
```

- blockDrop: 62 itens do catalogo, entre eles 2 so com `none` (`mega_showdown:mega_stone` <- `blocks/mega_stone_crystal`, `mega_showdown:wishing_star` <- `blocks/wishing_star_crystal`). Bloco que derruba o proprio bloco (39 itens, ex. `mega_showdown:max_mushroom`) nao e rota (circular) e fica em `loot.blockSelfDrops`; `max_mushroom` precisa da prova de worldgen (U7c). Quando `blockDrop` existir, as 146 entradas `blocks/...` do cobblemon que hoje vao em `structureLoot` devem migrar para ele.
- mobDrop: 70 itens (ex. `minecraft:totem_of_undying` <- `minecraft:entities/evoker`).
- trainerGroupDrop: 440 itens (ex. `cobblemon:sweet_apple` em 37 grupos). Nao cabe no `trainerDrop`: qual treinador pertence a qual grupo nao esta em nenhum arquivo de dados (nem `trainers/*.json`, nem `mobs/trainers/**`); so no codigo do rctmod (`DataPackManager.class`). Listar cada treinador exigiria inferir a regra do codigo (proibido: nada de rota inventada). Por isso a proposta e mostrar o grupo, nao o treinador.
- `gameplay` (25 itens: pescaria fora de `fishing/`, escambo de piglin, presente de gato, heroi da vila...) e `other` (259: `botanytrees:tree_drops`, `cobbleloots:loot_ball`, `aquaculture:box`, `cobblemonraiddens:raid`, `supplementaries:loot`...) ficam so no report; nenhum dos 58 itens ainda so com `none` depende deles.

## Frontend contract v2 (orquestrador, 2026-09-28, para U7c/U7d e U7e em paralelo)
Tipos novos de `obtain` (item). O pipeline so emite estes formatos; o frontend aceita exatamente estes (zod estrito). `LocalizedText` = `{ pt: string, en: string }` (PT cai para EN quando o jogo nao tem PT). Nomes vem do lang do pack (jar + kubejs por cima), nunca inventados.
- `{ kind: "blockDrop", blocks: { id: string, name: LocalizedText | null }[] }` quebrar um bloco que solta o item (bloco que so solta ele mesmo NAO conta). Mover para ca os `blocks/...` do cobblemon que hoje estao em `structureLoot`.
- `{ kind: "mobDrop", mobs: { id: string, name: LocalizedText | null }[] }` mobs (entities/...), inclusive global loot modifiers de bosses.
- `{ kind: "questReward", quests: { chapter: LocalizedText | null, title: LocalizedText | null }[] }` recompensas do FTB Quests.
- `{ kind: "shop", shop: "battleTowerBp", price: number | null }` loja de BP da Battle Tower.
- `{ kind: "structurePlaced", structures: { id: string, name: LocalizedText | null }[] }` item ja colocado em estrutura `.nbt` (vitrine, moldura, recompensa de trial spawner).
- `{ kind: "ritual", rituals: string[] }` Summoning Rituals (kubejs).
- `{ kind: "trade", traders: ("wanderingTrader" | "villager")[] }`.
- `{ kind: "worldgen", features: string[] }` gerado no mundo (ex. max_mushroom), so com prova.
- `{ kind: "special", note: LocalizedText, evidence: string }` mecanica pontual provada por arquivo/config (ex. Tera Shard pela config `teraShardDropRate`, leite de Miltank por `pokemon_interactions`, concreto em pó na agua). `evidence` = caminho do arquivo:chave; o texto de `note` e curto, factual, pt-BR natural, sem travessao.
- `{ kind: "unobtainable", reason?: "creativeOnly" | "notRegistered" }` (ja existe, ver contrato v1) so quando nao ha NENHUMA outra rota.
- `none` deixa de ser emitido (fica aceito no schema so por compatibilidade).
Fora por enquanto: `trainerGroupDrop` (U7b needs: grupo -> treinadores so existe no codigo do rctmod).
UI: listas longas (ex. diamante com 199 tabelas) agrupadas ou com "e mais N" / "and N more"; mesmo visual das fontes existentes; rotulos PT/EN.

## U7c: fontes novas (contrato v2) (`180f3f7c`, `700deaeb`; data-source `45502291`, `34d8fd19`)
Formas emitidas exatamente como o "Frontend contract v2" (tipos compartilhados de `src/data/types.ts`, commit `336cad00`; o pipeline nao tem tipo local). Ordem no `obtain`: craftable, drop, plantable, structureLoot, fishing, blockDrop, mobDrop, fossilRevive, trainerDrop, questReward, shop, structurePlaced, ritual, trade, worldgen, special (`unobtainable` so sozinho).
- `blockDrop` (86 itens): `blocks[].id` = `<ns>:<bloco>` da tabela `<ns>:blocks/<bloco>`; bloco que so derruba ele mesmo nao conta. Os `blocks/...` do cobblemon sairam do `structureLoot` (26 itens perdem so esse chip, ex. `cobblemon:blunder_policy` com `blocks/blunder_policy`, que era o proprio bloco; nenhum fica sem rota). `name` = `block.<ns>.<caminho>` do lang (en obrigatorio, pt cai para en): 100 com nome, 443 null (o pipeline so le o lang dos 6 namespaces do app; bloco de outro mod fica null, a UI cai no id humanizado).
- `mobDrop` (72): `mobs[].id` = `<ns>:<mob>` (`entities/<mob>[/variante]`, `bosses/<mob>`, `inject/entities/<mob>` vira `minecraft:<mob>` se a tabela vanilla existe; tabela de mob referenciada por outra so conta pela que a usa). Global loot modifiers com `addition.id` e SO condicao `neoforge:loot_table_id` entram (kubejs `allthemons:cataclysm_red_orb`/`blue_orb`: `mega_showdown:red_orb` <- `cataclysm:ignis`, `cataclysm:maledictus`; `zamega:ange` no bau do calyrex); os dos jars com outra condicao (productivebees "morto por abelha") ficam de fora. Os 281 mobs vem com `name: null` (entity lang dos mods de fora nao e lido; o kubejs so traz pt, e en nunca recebe texto pt).
- `questReward` (209): `{ chapter, title }` de `config/ftbquests/quests/lang/{pt_br,en_us}.snbt` (sem codigo de cor; quest sem titulo proprio = `title: null`, no jogo o titulo e o do item da tarefa). Recompensa `item` e `random`/`loot`/`choice` via `reward_tables` (table_id long -> id hex, conferido: `299590067093682297` = `reward_tables/powah_orb.snbt`).
- `shop` (79): `price` = `bp_cost` (menor valor se repetido). `load_default_items: true` + `_default_items` do config; `items[]` sobrescreve o padrao de mesmo `id`.
- `structurePlaced` (152): `structures[].id` = id do template `.nbt` (`legendarymonuments:hoopa_pyramid`, `allthemons:bee_gym_102`...), `name: null` sempre (nao ha lang de estrutura; UI humaniza). Loja de NPC (`CobbleMerchantShop`/`Offers`) e equipamento de mob ficam de fora.
- `ritual` (3): `allthemons:imbued_pokemon_egg`, `allthemons:shiny_pika_star`, `allthemons:pika_star` (ritual `allthemons:regional_pika_star`). `rituals` = ids do `.id(...)` do kubejs (UI humaniza).
- `trade` (6): so `wanderingTrader` (Apotheosis `wanderer_trades`: blaze_powder, diamond, ender_eye, iron_ingot, prismarine_shard, totem_of_undying). `villager` nunca emitido (nenhuma prova lida de troca de aldeao para item do catalogo).
- `worldgen` (15): `features` = configured feature (`mega_showdown:max_mushroom`, `allthemons:rainbow_apricorn_tree` para as apricorns, `create:striated_ores_*`...).
- `special` (21): 18 tera shards + stellar (`config/mega_showdown/config.json:teraShardDropRate` / `:stellarShardDropRate`, nota com a taxa crua "taxa 10") e `cobblemon:moomoo_milk`, `minecraft:honey_bottle` (`data/cobblemon/pokemon_interactions/<especie>.json:interactions[i]`). A nota de interacao cita o item segurado pelo id cru ("com minecraft:glass_bottle na mão"): o lang do minecraft nao esta no data-source.
Exemplos (`_publish_test`): `cobblemon:metal_alloy` = `[{kind:"shop",shop:"battleTowerBp",price:5}]`; `mega_showdown:flame_plate` = `structurePlaced`; `mega_showdown:wishing_star` = `blockDrop [{id:"mega_showdown:wishing_star_crystal"}]` + `questReward`; `mega_showdown:red_orb` = `mobDrop [cataclysm:ignis, cataclysm:maledictus]`; `cobblemon:moomoo_milk` = `questReward [{chapter:{pt:"CobbleWorkers e Cultivo",en:"CobbleWorkers & Farming"},title:{pt:"Eca, PokéLeite",en:"Ew PokeMilk"}}]` + `special`.
UI: listas longas (questReward com 10+ quests, structurePlaced com muitos templates, blockDrop das apricorns) precisam de "e mais N".

## U7d: catalogo sem fantasmas, `unobtainable`, zero `none` (`be290046`)
- Causas corrigidas de forma generica (`catalog.ts`/`stage.ts`): chave de lang com sufixo (`.tooltip`) nao cria id (`allthemons:badge` saiu); id so referenciado (treinador/evolucao/forma/fossil) sem textura e sem nenhuma rota = nao registrado, fica fora do `items.json` com aviso `W_ITEM_REFERENCE_UNKNOWN`: `karrablast`, `shelmet` (parceiros de troca em `evolutions[].requiredItem`, ex. dex 588, e item de treinador), `mega_showdown:darkinium-z`, `mega_showdown:mimikium-z` (typo no kubejs), `mega_showdown:baxcalibrite` (so o lang do jar mega_showdown tem a chave; `MegaShowdownItems.class` nao registra e nao ha modelo; o real e `zamega:baxcalibrite`, que segue no catalogo com `craftable`). 949 -> 943 ids.
- Treinadores e especies NAO foram alterados: continuam citando o id do arquivo (o jogo nao consegue dar um item inexistente; remapear seria inventar). FRONTEND precisa conferir: `ItemChip` (`src/screens/Trainers/TrainerTeam.tsx`) ja mostra `humanizeId(id)` sem o item no items.json, mas continua clicavel e abre a pagina de um item que nao existe; sugestao: sem `items[id]`, chip sem link. Mesmo cuidado no `EvolutionPanel` com `requiredItem: "shelmet"`/`"karrablast"` (troca com esse Pokemon).
- `unobtainable` (22, sempre a unica rota): `notRegistered` 2 (`cobblemon:bugwort`, `cobblemon:shalour_sable`; prova em `tools/dataset/curated/item-not-registered.json`, conferida nos `CobblemonItems.class`/`CobblemonBlocks.class` do jar), `creativeOnly` 20 (`cobblemon:npc_editor`, 12 placas, 7 memorias).
- Zero `none`, zero item sem rota, zero `unobtainable` junto de outra rota (asserts no `join.test.ts`).
Prova: `_publish_test` (snapshot) = instancia real byte a byte no `items.json`; os outros arquivos de dados iguais ao `public/`. Itens por tipo: craftable 802, structureLoot 417, drop 241, questReward 209, structurePlaced 152, plantable 110, blockDrop 86, shop 79, mobDrop 72, unobtainable 22, fishing 21, special 21, fossilRevive 17, worldgen 15, trainerDrop 14, trade 6, ritual 3.
Os 58 que eram so `none`: 6 fantasmas removidos; ritual 2 (imbued_pokemon_egg, shiny_pika_star); shop (metal_alloy, scroll_of_darkness, scroll_of_waters, shell_helmet, cornerstone/hearthflame/wellspring_mask, legend_plate, reveal_glass, star_core, blank_z, prison_bottle, mega_stone, max_mushroom); structurePlaced (bug/dragon/electric/fairy/fighting/ice/psychic/water_memory, flame/iron/mind/splash_plate, blank_z, prison_bottle, max_mushroom); questReward + special moomoo_milk; blockDrop mega_stone e wishing_star; worldgen max_mushroom; unobtainable 22 (bugwort, shalour_sable, npc_editor, 12 placas, 7 memorias).

## U8: nomes e texturas do jogo (`d11b8a16`, data-source `cd47900a`)
- Codigo: `tools/dataset/src/items/ref-names.ts` (tabela de nomes separada do `ctx.lang`, que continua definindo o catalogo: lang en_us/pt_br de todo jar de `mods/` por nome de arquivo, o primeiro vence, depois o Minecraft 1.21.1: en_us do jar do cliente, pt_br do asset store do launcher via `versions/1.21.1/1.21.1.json` -> `assets/indexes/17.json` -> `assets/objects/2f/2fc383...`; snapshot `vanilla/assets/minecraft/lang/pt_br.json`). Resolucao de uma chave: `ctx.lang` (6 namespaces do app + kubejs por cima) > jars > vanilla. en obrigatorio, pt cai para en, en nunca recebe pt (D6). `tools/dataset/src/media/vanilla-textures.ts`: textura dos `minecraft:*` pelo modelo do item.
- Formas do `items.json` NAO mudaram (mesmo contrato v2): so `name` das refs sai de null, `name` dos itens minecraft ganha o PT e `texture` deixa de ser null.
- `_publish_test` (snapshot) = instancia real byte a byte no `items.json`; 943 ids iguais ao baseline do HEAD anterior (U7d). Diferencas contra o baseline: `name` de 112 itens (110 `minecraft:*` + `allthemodium:unobtainium_block` "Bloco de Unobtainium"/"Block of Unobtainium" e `cobblemon:big_root` "Raiz Grande"/"Big Root", ambos pela chave `block.` do jar), `texture` dos 110 minecraft, `obtain` de 92 itens so por nomes de ref e notas `special` (nenhuma rota ganha ou perde).
- Nomes de ref (ids unicos / ocorrencias): `blockDrop` 510 de 515 (534 de 543 ocorrencias, antes 100); `mobDrop` 176 de 177 (278 de 281, antes 0); `structurePlaced` 2 de 162 (`the_bumblezone:honitel`, `the_bumblezone:pirate_ship`, chave `structure.<ns>.<caminho>`).
- Continuam null (nenhuma chave en em nenhum lang do pack, conferido nos 398 jars + vanilla + kubejs): blocos `cobblemon:full__heal` (tabela `blocks/full__heal`, nao e bloco), `cobblemon:revival_herb` (sem `block.cobblemon.revival_herb`), `occultism:otherworld_leaves_natural`, `occultism:otherworld_sapling_natural`, `occultism:otherflower_natural` (variantes de worldgen sem lang); mob `dungeons_arise:gladiator_loot` (tabela `entities/gladiator_loot`, nao e mob); 160 estruturas: o id e o template `.nbt` (peca de gym, sala, gametest do create...) e o jogo nao tem nome para template. A UI segue humanizando o id.
- Itens minecraft: 110 de 110 com PT do jogo (ex. `minecraft:apple` = Maçã/Apple) e textura `assets/items/minecraft/<item>.png?v=<sha8>`. 89 por `layer0` do modelo do item; 21 itens de bloco (3D no jogo) com uma face do modelo do bloco: `all` (blue_ice, blue_wool, brown_wool, calcite, dirt, gravel, light_blue_wool, mud, sand, stone, terracotta, white_concrete, white_wool), `side` (acacia_log, basalt, bone_block, cactus, ochre/pearlescent/verdant_froglight), `front` (jack_o_lantern). Nenhuma animada. Excecao visual: `minecraft:vine` e `minecraft:lily_pad` sao texturas em cinza que o jogo tinge pela cor do bioma/fixa em codigo; publicadas como estao no jar (sem cor inventada). Categoria continua `other`.
- `special`: notas das interactions usam o nome do item segurado: `cobblemon:moomoo_milk` = "Interagir com Miltank com Frasco de Vidro na mão." / "Interact with Miltank holding Glass Bottle."; idem `minecraft:honey_bottle` (Vespiquen). Id sem nome no lang (ou tag) fica como no arquivo.
- Report (`items`): `refNames` (por tipo, nomeados + lista dos null) e `vanillaTextures` (publicadas, `blockFace`, `animated`, `missing`). Avisos novos: `W_NAME_LANG_INVALID` (so na instancia: `hostilenetworks` pt_br.json e JSON invalido, o jogo tambem nao carrega), `W_NAME_LANG_VANILLA_MISSING`, `W_VANILLA_TEXTURE_UNRESOLVED`, `W_VANILLA_TEXTURES_MISSING`.
- Pre-existente, fora do U8: `series.json` difere entre instancia e snapshot (titulo `trainer_type.rctmod.*` so no kubejs da instancia: "Equipe ATM"/"ATM Team" vs "Atm Team"). O snapshot e igual ao `public/`.
- Incidente: uma rodada na instancia real sem `--publish-dir` publicou em `public/`; revertido na hora (`git checkout -- public` + remocao dos 1149 arquivos novos); `git status public` limpo.
- Testes: `tests/unit/dataset/ref-names.test.ts` (fixtures: precedencia, D6, chaves, notas, leitura do jar, pt_br do asset store, escolha de textura) e U8 no `join.test.ts`.
