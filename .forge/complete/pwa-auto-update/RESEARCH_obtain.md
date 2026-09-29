# Obtain research: the 360 items with only `{kind:"none"}`

Pack: All the Mons 1.3.0 (real instance `C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons/`, 398 jars).
Per-id details (mechanism, evidence path:key, confidence, notes): `obtain-research.json` (same folder, all 360 ids).
Scripts used (re-runnable, read-only): `scan.py` (raw id grep over all jars' `data/**`, kubejs, config, datapacks), `rec.py` (recipe RESULT index over every namespace), `build.py` (merge + classify).

## Summary

| Result | ids |
|---|---|
| Has at least one real route | 332 |
| Phantom ids (not items; should leave the catalog) | 6 |
| Unobtainable (not registered / creative only) | 3 |
| No route found after full search | 19 |

Confidence: 327 high, 33 medium (all medium = structure-placed-only, not registered, or no route).

## Why the pipeline missed them (the root causes)

1. `tools/dataset/src/items/recipes.ts` only reads `data/cobblemon/recipe/` (constant `RECIPE_PREFIX`). Every other namespace is ignored: `data/mega_showdown/recipe/`, `data/allthemons/recipe/` (Create / Oritech / PneumaticCraft / Mekanism / MekMM / Botany Pots types), `data/zamega/recipe/`, `data/legendarymonuments/recipe/`, `data/productivebees/recipe/`, vanilla (client jar). It also does not read kubejs `server_scripts` (adds and removes).
2. `tools/dataset/src/items/loot.ts` only reads `data/cobblemon/loot_table/` and only expands `cobblemon:sets/*`. It misses `mega_showdown`, `legendarymonuments`, `allthemons` block tables, `rctmod` trainer tables in `kubejs/data/rctmod/loot_table/trainers/**`, and vanilla.
3. There is no source for anything that is not a recipe or loot table: FTB Quests rewards, the Battle Tower BP shop config, items pre-placed in structure `.nbt`, NeoForge global loot modifiers, Summoning Rituals (kubejs), Cobblemon `pokemon_interactions`, and code drops.
4. The catalog (`catalog.ts`) adds phantom ids: a lang tooltip key (`item.allthemons.badge.tooltip` becomes `allthemons:badge`) and typos in trainer held items (`karrablast`, `shelmet`, `darkinium-z`, `mimikium-z`, `mega_showdown:baxcalibrite`).

## Mechanisms (sorted by coverage)

Counts are "ids with at least one route of this kind". An id can appear in several rows.

### 1. Recipes in any namespace (275 ids, 204 have ONLY this)
- **Location:** `data/<any_ns>/recipe/**/*.json` (1.21 singular `recipe/`; also accept `recipes/`) in every jar of `mods/` plus `kubejs/data/<ns>/recipe/`.
- **Types seen for these ids:** `minecraft:crafting_shaped` (mega_showdown 191, zamega 11, allthemons 3), `minecraft:crafting_shapeless`, `cobblemon:cooking_pot`, `create:sequenced_assembly|pressing|cutting|deploying|filling`, `oritech:assembler|atomic_forge|refinery|grinder`, `pneumaticcraft:pressure_chamber|assembly_drill`, `mekanism:sawing|metallurgic_infusing|injecting|crushing|painting`, `mekmm:lathe|stamper`, `botanypots:crop`, `productivebees:advanced_beehive` (terabeegos bee makes tera shards), `productivemetalworks:*`, `immersiveengineering:bottling_machine`, `occultism:crushing`.
- **Generic parse:** walk the JSON and collect ids under result-like keys (`result`, `results`, `output`, `outputs`, `output_item`, `result_item`, `item_output`, `main_output`, `secondary_outputs`), each either a string or an object `{id|item}`, while skipping input keys (`ingredients`, `key`, `ingredient`, `input(s)`, `base`, `addition`, `template`). This one rule matched every type above. Honor `neoforge:conditions` `mod_loaded` against the jar list: `tconstruct` and `energizedpower` are not installed, so drop those. Store `recipe.type` as `recipeTypes` (the UI already has this field).
- **kubejs removals to apply:** `kubejs/server_scripts/mods/Cobblemon/Recipes.js:5` `remove({type:"minecraft:crafting_shaped", output:"#cobblemon:poke_balls"})`, plus lines 12-15 (by id: `createmonballsoverhaul:sequenced_assembly/balls/ancient_origin_ball`, `.../master_ball`, `legendarymonuments:gs_ball_craft`, `meltan_box_craft`). Generic approach: regex `\.remove\(\s*(\{[^}]*\}|"[^"]+")` and apply `id` / `output` / `type` / `mod` filters. None of the `mega_showdown` or `zamega` recipes are removed (grep over all `server_scripts`).
- **Vanilla:** `C:/Users/Usuario/curseforge/minecraft/Install/versions/1.21.1/1.21.1.jar!data/minecraft/recipe/` (clock, ender_eye, fire_charge, wind_charge). kubejs `mods/minecraft/recipes.js` does not remove any of them.

### 2. Loot tables in any namespace (59 ids)
- **Location:** `data/<any_ns>/loot_table/**` in jars and `kubejs/data/**`, plus the vanilla jar.
  - Chests and archaeology: `legendarymonuments/loot_table/chests/*.json` (turnback_cave_vault, bell_tower_chest, lugia_temple_chest, registeel_chest, dragoeleki_chest, calyrex_chest, regi*_chest). `mega_showdown/loot_table/{archaeological_site,archaeology,chests,wishing_weald}/*.json`.
  - Block drops: `mega_showdown/loot_table/blocks/{keystone_ore,mega_stone_crystal,wishing_star_crystal,max_mushroom}.json`, `allthemons/loot_table/blocks/*_apricorn*.json` (the apricorn seeds), `allthemodium/loot_table/blocks/unobtainium_block.json`.
  - Trainer rewards: `kubejs/data/rctmod/loot_table/trainers/single/team_allthemods_<name>.json` (all 12 `allthemons:the_*_badge`). `rctmod` jar `data/rctmod/loot_table/generic/{epic,legendary}/*.json` (sweet_apple, tart_apple, ancient_origin_ball).
  - Nested sets: `mega_showdown:sets/any_showdown_held_item` (adrenaline_orb, soul_dew) is referenced by `archaeological_site_chest` and `wishing_weald_chest`.
- **Generic parse:** the existing `parseTable` code works if you drop the `cobblemon/` prefix filter. Key tables by `<ns>:<path>` and expand every `minecraft:loot_table` reference (any namespace, recursive with a visited set). Classify by path: `blocks/` becomes blockDrop, `entities/` becomes mobDrop, `trainers/` becomes trainer, `gameplay/piglin_bartering` becomes barter, and everything else becomes structureLoot.

### 3. FTB Quests rewards (35 ids)
- **Location:** `config/ftbquests/quests/chapters/*.snbt` (main ones: `mega_showdown.snbt`, `allthemodium_cobblemon.snbt`, `legendaries.snbt`, `chapter_2_the_star.snbt`, `poke_farming.snbt`) and `config/ftbquests/quests/reward_tables/*.snbt`.
- **Generic parse:** SNBT. Take each quest's `rewards: [...]` block (bracket-balanced) and collect `item: { id: "ns:path" }`. Ignore `tasks:`: tasks are requirements, not sources. Tasks can also use `ftbfiltersystem:smart_filter`, so a raw grep over-counts. Reward tables hold `id:` entries. Store the chapter file (or its title from `lang/`) as the source label.

### 4. Structure NBT pre-placed items (30 ids, 12 have ONLY this)
- **Location:** `data/<ns>/structure/**/*.nbt` (gzip NBT) in `legendarymonuments` and `mega_showdown` jars.
- **Kinds found:** `cobblemon:display_case` block entity `Items[]` (flame_plate in ecruteak bell_tower_middle, splash_plate/water_memory in lugia_temple, mind_plate/psychic_memory/ghost_memory in hoopa_pyramid, iron_plate/steel_memory in throneroom, dragon/ice/electric_memory in snowpoint_temple, latiasite/latiosite in southern_island, reins_of_unity in crown_shrine, dna_splicer in kyuremcave). Item frames `entities[].nbt.Item` (bug_memory in outskirt_stand). `legendarymonuments:pokemon_trial_spawner` `rewards[].item` (fairy/fighting memory and tera shards in throneroom spawners). Chest blocks with `LootTable` (this links a structure to a loot table, useful for naming).
- **Generic parse:** add an NBT reader (for example `prismarine-nbt`) and walk `blocks[].nbt.Items[].id`, `blocks[].nbt.item.id` (decorated pots, brushable blocks), `blocks[].nbt.rewards[].item`, `entities[].nbt.Item.id`. Label with the structure path. These are finite (one per generated structure), so show them as "found in <structure>" and not as a farmable source.

### 5. Battle Tower BP shop (26 ids, 10 have ONLY this)
- **Location:** `config/cobblemon_battle_tower/bp_shop_items.json`, format `items[] {id, display_name, bp_cost, item_id, quantity}`. `load_default_items: true` also loads the mod's default list, but none of these ids are in the jar's defaults (the jar only holds opponent teams).
- **Generic parse:** read `items[].item_id` (skip entries that have `command`) and keep `bp_cost`. Examples: metal_alloy (5 BP), scroll_of_darkness, scroll_of_waters, shell_helmet, cornerstone/hearthflame/wellspring masks, legend_plate, reveal_glass, star_core.

### 6. Code drop: tera shards (19 ids, never the only route)
- **Evidence:** `config/mega_showdown/config.json` `teraShardDropRate: 10.0`, `stellarShardDropRate: 1.0`, read by `com/github/yajatkaul/mega_showdown/event/CobbleEvents.class`. Shards drop when you defeat a Pokémon (by its tera type). There is no data file for it, so this needs a small curated rule ("any `*_tera_shard`: drop from defeated Pokémon of that tera type, chance from config"). They also come from the terabeegos bee (productivebees recipe) and from `legendarymonuments/recipe/*_tera_shards_from_block.json`.

### 7. Vanilla loot and recipes (6 ids)
- `minecraft:clock`, `ender_eye`, `fire_charge`, `wind_charge`: recipe in the vanilla jar. `totem_of_undying`: `entities/evoker.json`. `white_concrete`: concrete powder touching water (hardcoded), plus Mekanism injecting and IE bottling. Generic parse: include `Install/versions/1.21.1/1.21.1.jar` as one more jar in the reader.

### 8. Smaller mechanisms
- **Global loot modifiers (2):** `kubejs/data/allthemons/loot_modifiers/cataclysm_{red,blue}_orb.json` (`productivelib:item_modifier`, `addition.id`, `chance: 0.25`, condition `neoforge:loot_table_id` = `cataclysm:entities/ignis|maledictus` for red; `cataclysm:entities/the_leviathan|scylla` for blue). They are listed in `kubejs/data/neoforge/loot_modifiers/global_loot_modifiers.json`. Parse: read the `entries` list, then for each entry `addition.id` and the conditions' `loot_table_id` (showing it as a mob drop).
- **Summoning Rituals (2):** `kubejs/server_scripts/mods/Summoning Rituals/recipes.js`, `event.recipes.summoningrituals.altar(...)` with `.itemOutputs([...])` / `.displayOutputs([...])` / `.id(...)`. imbued_pokemon_egg is at line 60, shiny_pika_star around line 300. Parse: a regex over `server_scripts` for `summoningrituals.altar` blocks, then `(itemOutputs|displayOutputs)\(\[([^\]]+)\]`.
- **kubejs `shaped/shapeless/custom` (2):** `kubejs/server_scripts/mods/Cobblemon/Recipes.js:16` `allthemods.shapeless('cobblemon:syrupy_apple', ['cobblemon:sweet_apple','#c:maple_syrup'])`. `kubejs/server_scripts/mods/Oritech/recipes.js:122-126` gives zygarde_cube. Parse: regex `\.(shaped|shapeless)\(\s*'([^']+)'` and `event.custom({...})` with a result id.
- **Pokémon interaction (1):** `Cobblemon jar!data/cobblemon/pokemon_interactions/miltank.json`, `interactions[].effects[{variant:"give_item", item:"cobblemon:moomoo_milk"}]` when the owner holds `minecraft:glass_bottle`. Parse: every `give_item` effect, labeled with the file's species target.
- **Wandering trader / Bee Queen (2):** `Apotheosis jar!data/apotheosis/wanderer_trades/{eye_of_ender,totem_of_undying}.json`, `the_bumblezone jar!data/the_bumblezone/bz_bee_queen_trades/*.json` (totem).
- **Worldgen (1):** `mega_showdown/worldgen/configured_feature/max_mushroom.json` (the block generates naturally, and its block loot drops the item).

## Phantom ids (6): remove from the catalog, not "none"
| id | origin |
|---|---|
| `karrablast`, `shelmet` | species ids used as a held item/trade partner in rctmod trainer data (`rctmod jar!data/rctmod/trainers/bug_catcher_cale_006e.json`). Not items. |
| `mega_showdown:darkinium-z` | typo in `kubejs/data/rctmod/trainers/team_allthemods_drackion.json` (real id `darkinium_z`) |
| `mega_showdown:mimikium-z` | typo in `kubejs/data/rctmod/trainers/team_allthemods_ultramegaa.json` (real id `mimikium_z`) |
| `mega_showdown:baxcalibrite` | wrong namespace in `kubejs/data/rctmod/trainers/allthemods_trainer_lego.json`. The mega_showdown jar has no model, lang entry or class string for it. The real item is `zamega:baxcalibrite` (crafting_shaped in the zamega jar). |
| `allthemons:badge` | `catalog.ts` `ITEM_KEY` matched the lang key `item.allthemons.badge.tooltip` (shared tooltip "Does not get consumed in crafting"). Fix: ignore keys ending in `.tooltip` or `.desc` when collecting ids. |

Suggested fix: when a trainer-referenced id has no lang entry, no texture and no registry evidence, drop it and warn (W_TRAINER_ITEM_UNKNOWN) instead of adding it to the catalog.

## Unobtainable (3)
- `cobblemon:bugwort`: only assets (`assets/cobblemon/blockstates/bugwort.json`, `models/item/bugwort.json`, textures) in Cobblemon 1.7.3. The string `bugwort` is absent from every `.class` and every data file in all 398 jars, so it is not registered (unreleased content). Confidence medium.
- `cobblemon:shalour_sable`: same situation (only `assets/cobblemon/models/item/shalour_sable.json`). Confidence medium.
- `cobblemon:npc_editor`: registered (`CobblemonItems.class`, `NPCEditorScreen`) but has no source anywhere. Creative/op tool. Confidence high.

## No route found (19): likely creative-only in this pack
Plates: `draco_plate`, `dread_plate`, `earth_plate`, `fist_plate`, `icicle_plate`, `insect_plate`, `meadow_plate`, `pixie_plate`, `sky_plate`, `stone_plate`, `toxic_plate`, `zap_plate`.
Memories: `dark_memory`, `fire_memory`, `flying_memory`, `grass_memory`, `ground_memory`, `poison_memory`, `rock_memory`.

All are `mega_showdown:` items, registered in `MegaShowdownItems.class`, and appear in data only in `data/mega_showdown/tags/item/plates.json` (plates) or not at all (memories).

I searched all of these and found nothing: recipes (all namespaces, by result), loot tables (all namespaces, including `#mega_showdown:*` tag references), GLMs, FTB chapters and reward tables, the BP shop, the raid dens configs, kubejs scripts, every `.nbt` structure in legendarymonuments and mega_showdown, and class-string search in every non-mega_showdown jar.

`pixie_plate` shows up only as an rctmod trainer's held item, which is not dropped. The sibling plates and memories that ARE obtainable come only from legendarymonuments structure display cases or trial spawners (and legend_plate from the BP shop). So the pack gives no way to get these 19. Show them as "Não obtenível no modpack (apenas criativo)".

## Not yet researched
None. All 360 ids are classified in the JSON.
